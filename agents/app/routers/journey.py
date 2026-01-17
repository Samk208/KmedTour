"""
KmedTour Medical Tourism Operating System - Journey API Router

FastAPI router for patient journey management:
- Start/resume journeys
- Get journey state and timeline
- Manual state transitions (coordinator)
- Process patient through agent workflow
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

from agents.src.core.state_machine import (
    PatientJourneyStateMachine,
    JourneyState,
    StateTransition,
    InvalidTransitionError,
    get_state_machine
)

router = APIRouter(prefix="/api/journey", tags=["journey"])


# ============================================================================
# Request/Response Models
# ============================================================================

class StartJourneyRequest(BaseModel):
    """Request to start a new patient journey"""
    patient_id: str = Field(..., description="Patient intake UUID")
    documents: Optional[List[str]] = Field(default=[], description="Document URLs for processing")
    trigger: str = Field(default="intake_submitted", description="What triggered this journey")


class TransitionRequest(BaseModel):
    """Request to manually transition state (for coordinators)"""
    to_state: str = Field(..., description="Target state (e.g., 'MATCHING', 'QUOTE')")
    reason: str = Field(..., description="Reason for manual transition")
    force: bool = Field(default=False, description="Force transition (bypass validation)")
    coordinator_id: Optional[str] = None
    coordinator_name: Optional[str] = None


class AssignCoordinatorRequest(BaseModel):
    """Request to assign a coordinator to a patient"""
    coordinator_id: str
    coordinator_name: str


class LogEventRequest(BaseModel):
    """Request to log a custom event"""
    event_type: str = Field(..., description="Event type (e.g., 'note', 'document_upload')")
    event_data: Dict[str, Any] = Field(default={})
    coordinator_name: Optional[str] = None


class JourneyStateResponse(BaseModel):
    """Current journey state response"""
    patient_id: str
    state: str
    previous_state: Optional[str]
    state_entered_at: str
    thread_id: str
    metadata: Dict[str, Any]
    assigned_coordinator: Optional[str]
    last_updated_at: str


class TimelineEventResponse(BaseModel):
    """Single timeline event"""
    event_id: str
    event_type: str
    from_state: Optional[str]
    to_state: Optional[str]
    triggered_by: str
    agent_id: Optional[str]
    coordinator_name: Optional[str]
    event_data: Dict[str, Any]
    created_at: str


class JourneyTimelineResponse(BaseModel):
    """Journey timeline response"""
    patient_id: str
    events: List[TimelineEventResponse]
    total_count: int


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/start", response_model=Dict[str, Any])
async def start_journey(
    request: StartJourneyRequest,
    background_tasks: BackgroundTasks
):
    """
    Start or resume a patient journey.

    This endpoint:
    1. Checks if patient already has a journey
    2. If not, creates one in INQUIRY state
    3. Optionally triggers document processing in background

    Returns:
        Journey status and workflow ID for tracking
    """
    try:
        sm = get_state_machine()

        # Check existing state
        existing = await sm.get_state(request.patient_id)

        if existing:
            return {
                "status": "resumed",
                "patient_id": request.patient_id,
                "current_state": existing.state.value,
                "state_entered_at": existing.state_entered_at.isoformat(),
                "message": f"Journey already exists at state: {existing.state.value}"
            }

        # Create new journey
        result = await sm.transition(
            request.patient_id,
            StateTransition(
                from_state=None,
                to_state=JourneyState.INQUIRY,
                triggered_by="system",
                event_data={"trigger": request.trigger, "documents_count": len(request.documents)}
            )
        )

        # If documents provided, trigger processing in background
        if request.documents:
            background_tasks.add_task(
                process_patient_documents,
                request.patient_id,
                request.documents
            )

        return {
            "status": "started",
            "patient_id": request.patient_id,
            "current_state": JourneyState.INQUIRY.value,
            "workflow_id": f"wf_{request.patient_id}",
            "message": "Journey started successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{patient_id}/state", response_model=JourneyStateResponse)
async def get_journey_state(patient_id: str):
    """
    Get the current state of a patient's journey.

    Returns current state, previous state, timestamps, and metadata.
    """
    try:
        sm = get_state_machine()
        record = await sm.get_state(patient_id)

        if not record:
            raise HTTPException(
                status_code=404,
                detail=f"No journey found for patient: {patient_id}"
            )

        return JourneyStateResponse(
            patient_id=record.patient_id,
            state=record.state.value,
            previous_state=record.previous_state.value if record.previous_state else None,
            state_entered_at=record.state_entered_at.isoformat(),
            thread_id=record.thread_id,
            metadata=record.metadata,
            assigned_coordinator=record.assigned_coordinator_name,
            last_updated_at=record.last_updated_at.isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{patient_id}/timeline", response_model=JourneyTimelineResponse)
async def get_journey_timeline(
    patient_id: str,
    limit: int = 50,
    event_types: Optional[str] = None
):
    """
    Get the event timeline for a patient's journey.

    Args:
        patient_id: Patient UUID
        limit: Maximum events to return (default 50)
        event_types: Comma-separated list of event types to filter

    Returns:
        List of timeline events in reverse chronological order
    """
    try:
        sm = get_state_machine()

        types_list = event_types.split(",") if event_types else None
        events = await sm.get_timeline(patient_id, limit=limit, event_types=types_list)

        return JourneyTimelineResponse(
            patient_id=patient_id,
            events=[
                TimelineEventResponse(
                    event_id=e.get("id", ""),
                    event_type=e.get("event_type", ""),
                    from_state=e.get("from_state"),
                    to_state=e.get("to_state"),
                    triggered_by=e.get("triggered_by", "unknown"),
                    agent_id=e.get("agent_id"),
                    coordinator_name=e.get("coordinator_name"),
                    event_data=e.get("event_data", {}),
                    created_at=e.get("created_at", "")
                )
                for e in events
            ],
            total_count=len(events)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{patient_id}/transition")
async def manual_transition(patient_id: str, request: TransitionRequest):
    """
    Manually transition a patient to a new state.

    This is primarily for coordinators to:
    - Move patients forward when manual steps are complete
    - Handle exceptions or special cases
    - Correct errors in the workflow

    Requires coordinator_name for audit trail.
    """
    try:
        sm = get_state_machine()

        # Validate target state
        try:
            target_state = JourneyState(request.to_state)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid state: {request.to_state}. Valid states: {[s.value for s in JourneyState]}"
            )

        # Get current state for the transition
        current_record = await sm.get_state(patient_id)
        if not current_record:
            raise HTTPException(status_code=404, detail=f"No journey found for patient: {patient_id}")

        # Perform transition
        result = await sm.transition(
            patient_id,
            StateTransition(
                from_state=current_record.state,
                to_state=target_state,
                triggered_by="coordinator",
                coordinator_id=request.coordinator_id,
                coordinator_name=request.coordinator_name,
                event_data={"reason": request.reason, "manual": True},
                force=request.force
            )
        )

        return {
            "success": True,
            "patient_id": patient_id,
            "from_state": result["from_state"],
            "to_state": result["to_state"],
            "forced": result["forced"],
            "message": f"Transitioned to {target_state.value}"
        }

    except InvalidTransitionError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{patient_id}/assign-coordinator")
async def assign_coordinator(patient_id: str, request: AssignCoordinatorRequest):
    """
    Assign a coordinator to a patient's journey.
    """
    try:
        sm = get_state_machine()
        success = await sm.assign_coordinator(
            patient_id,
            request.coordinator_id,
            request.coordinator_name
        )

        if success:
            return {
                "success": True,
                "patient_id": patient_id,
                "coordinator_name": request.coordinator_name
            }
        else:
            raise HTTPException(status_code=404, detail="Patient journey not found")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{patient_id}/log-event")
async def log_event(patient_id: str, request: LogEventRequest):
    """
    Log a custom event to the patient's journey timeline.

    Useful for:
    - Adding coordinator notes
    - Logging document uploads
    - Recording external communications
    """
    try:
        sm = get_state_machine()

        await sm._log_event(
            patient_id=patient_id,
            event_type=request.event_type,
            triggered_by="coordinator" if request.coordinator_name else "system",
            coordinator_name=request.coordinator_name,
            event_data=request.event_data
        )

        return {
            "success": True,
            "patient_id": patient_id,
            "event_type": request.event_type
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{patient_id}/next-actions")
async def get_next_actions(patient_id: str):
    """
    Get suggested next actions based on current state.

    Returns action items for both the patient and coordinator
    depending on the current journey state.
    """
    try:
        sm = get_state_machine()
        record = await sm.get_state(patient_id)

        if not record:
            raise HTTPException(status_code=404, detail="Journey not found")

        # Define next actions per state
        actions_map = {
            JourneyState.INQUIRY: {
                "patient": ["Complete medical questionnaire", "Upload medical documents"],
                "coordinator": ["Review intake form", "Initiate screening"]
            },
            JourneyState.SCREENING: {
                "patient": ["Await medical review"],
                "coordinator": ["Review medical history", "Classify urgency", "Move to matching"]
            },
            JourneyState.MATCHING: {
                "patient": ["Review hospital options"],
                "coordinator": ["Match with hospitals", "Request quotes from hospitals"]
            },
            JourneyState.QUOTE: {
                "patient": ["Review quote", "Accept or request revision"],
                "coordinator": ["Follow up on quote acceptance", "Answer patient questions"]
            },
            JourneyState.BOOKING: {
                "patient": ["Pay deposit", "Provide travel details"],
                "coordinator": ["Confirm hospital booking", "Arrange accommodation", "Generate visa letter"]
            },
            JourneyState.PRE_TRAVEL: {
                "patient": ["Book flights", "Complete pre-travel checklist", "Confirm arrival details"],
                "coordinator": ["Send pre-travel instructions", "Arrange airport pickup"]
            },
            JourneyState.TREATMENT: {
                "patient": ["Follow hospital instructions"],
                "coordinator": ["Monitor treatment progress", "Stay in contact with hospital"]
            },
            JourneyState.POST_CARE: {
                "patient": ["Follow post-care instructions", "Report any issues"],
                "coordinator": ["Send post-care checklist", "Schedule follow-up"]
            },
            JourneyState.FOLLOWUP: {
                "patient": ["Complete satisfaction survey", "Attend follow-up appointments"],
                "coordinator": ["Collect feedback", "Close journey"]
            },
            JourneyState.COMPLETED: {
                "patient": ["Leave a review"],
                "coordinator": ["Archive case"]
            },
            JourneyState.CANCELLED: {
                "patient": [],
                "coordinator": ["Document cancellation reason", "Process any refunds"]
            }
        }

        actions = actions_map.get(record.state, {"patient": [], "coordinator": []})

        return {
            "patient_id": patient_id,
            "current_state": record.state.value,
            "patient_actions": actions["patient"],
            "coordinator_actions": actions["coordinator"],
            "valid_next_states": [s.value for s in StateTransition if s.value]  # Will fix
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Background Tasks
# ============================================================================

async def process_patient_documents(patient_id: str, document_urls: List[str]):
    """
    Background task to process patient documents through the agent workflow.

    This triggers the LangGraph workflow for document processing and
    transitions the patient to SCREENING state when complete.
    """
    try:
        from agents.src.workflows.patient_intake_graph import app as intake_workflow

        sm = get_state_machine()

        # Run the intake workflow
        initial_state = {
            "patient_id": patient_id,
            "documents": document_urls,
            "extracted_data": {},
            "triage_result": {},
            "matched_hospitals": [],
            "final_quote": {},
            "messages": []
        }

        config = {"configurable": {"thread_id": f"intake_{patient_id}"}}

        # Execute workflow (this is synchronous in the current implementation)
        # TODO: Make fully async when LangGraph supports it better
        result = intake_workflow.invoke(initial_state, config=config)

        # Transition to SCREENING
        await sm.transition(
            patient_id,
            StateTransition(
                from_state=JourneyState.INQUIRY,
                to_state=JourneyState.SCREENING,
                triggered_by="agent",
                agent_id="document_agent",
                event_data={
                    "documents_processed": len(document_urls),
                    "extraction_summary": result.get("extracted_data", {})
                }
            )
        )

        print(f"✅ Document processing complete for patient {patient_id}")

    except Exception as e:
        print(f"❌ Error processing documents for {patient_id}: {str(e)}")
        # Log the error but don't crash
        sm = get_state_machine()
        await sm._log_event(
            patient_id=patient_id,
            event_type="processing_error",
            triggered_by="agent",
            agent_id="document_agent",
            error_message=str(e),
            event_data={"documents": document_urls}
        )
