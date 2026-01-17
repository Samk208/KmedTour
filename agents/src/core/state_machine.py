"""
KmedTour Medical Tourism Operating System - State Machine

This module provides the core patient journey state machine with:
- State transition validation
- Persistent state storage via Supabase
- Event logging for audit trail
- Crash recovery support

Journey States:
    INQUIRY → SCREENING → MATCHING → QUOTE → BOOKING →
    PRE_TRAVEL → TREATMENT → POST_CARE → FOLLOWUP → COMPLETED
"""

from enum import Enum
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field
from datetime import datetime
import os
import httpx
from dotenv import load_dotenv

load_dotenv()


class JourneyState(str, Enum):
    """Patient journey states matching database enum"""
    INQUIRY = "INQUIRY"
    SCREENING = "SCREENING"
    MATCHING = "MATCHING"
    QUOTE = "QUOTE"
    BOOKING = "BOOKING"
    PRE_TRAVEL = "PRE_TRAVEL"
    TREATMENT = "TREATMENT"
    POST_CARE = "POST_CARE"
    FOLLOWUP = "FOLLOWUP"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"


# Valid state transitions
STATE_TRANSITIONS: Dict[JourneyState, List[JourneyState]] = {
    JourneyState.INQUIRY: [JourneyState.SCREENING, JourneyState.CANCELLED],
    JourneyState.SCREENING: [JourneyState.MATCHING, JourneyState.CANCELLED],
    JourneyState.MATCHING: [JourneyState.QUOTE, JourneyState.SCREENING, JourneyState.CANCELLED],
    JourneyState.QUOTE: [JourneyState.BOOKING, JourneyState.MATCHING, JourneyState.CANCELLED],
    JourneyState.BOOKING: [JourneyState.PRE_TRAVEL, JourneyState.CANCELLED],
    JourneyState.PRE_TRAVEL: [JourneyState.TREATMENT, JourneyState.CANCELLED],
    JourneyState.TREATMENT: [JourneyState.POST_CARE],
    JourneyState.POST_CARE: [JourneyState.FOLLOWUP, JourneyState.COMPLETED],
    JourneyState.FOLLOWUP: [JourneyState.COMPLETED],
    JourneyState.CANCELLED: [],
    JourneyState.COMPLETED: [],
}


class InvalidTransitionError(Exception):
    """Raised when an invalid state transition is attempted"""
    def __init__(self, from_state: JourneyState, to_state: JourneyState):
        self.from_state = from_state
        self.to_state = to_state
        super().__init__(
            f"Invalid state transition from {from_state.value} to {to_state.value}. "
            f"Valid transitions: {[s.value for s in STATE_TRANSITIONS.get(from_state, [])]}"
        )


@dataclass
class StateTransition:
    """Represents a state transition request"""
    from_state: Optional[JourneyState]
    to_state: JourneyState
    triggered_by: str  # 'system' | 'agent' | 'patient' | 'coordinator'
    agent_id: Optional[str] = None
    coordinator_id: Optional[str] = None
    coordinator_name: Optional[str] = None
    event_data: Dict[str, Any] = field(default_factory=dict)
    force: bool = False  # Allow coordinators to bypass validation


@dataclass
class JourneyStateRecord:
    """Current state of a patient's journey"""
    patient_id: str
    state: JourneyState
    previous_state: Optional[JourneyState]
    state_entered_at: datetime
    thread_id: str
    metadata: Dict[str, Any]
    assigned_coordinator_name: Optional[str]
    last_updated_at: datetime


class PatientJourneyStateMachine:
    """
    Manages patient journey state transitions with Supabase persistence.

    Usage:
        sm = PatientJourneyStateMachine()

        # Get current state
        state = await sm.get_state("patient-uuid")

        # Transition to new state
        await sm.transition(
            "patient-uuid",
            StateTransition(
                from_state=JourneyState.INQUIRY,
                to_state=JourneyState.SCREENING,
                triggered_by="agent",
                agent_id="document_agent"
            )
        )
    """

    def __init__(self, supabase_url: str = None, supabase_key: str = None):
        self.supabase_url = supabase_url or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        self.supabase_key = supabase_key or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase URL and service role key are required")

        self.headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    async def get_state(self, patient_id: str) -> Optional[JourneyStateRecord]:
        """Get the current journey state for a patient"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.supabase_url}/rest/v1/patient_journey_state",
                headers=self.headers,
                params={"patient_id": f"eq.{patient_id}", "select": "*"}
            )

            if response.status_code != 200:
                raise Exception(f"Failed to get state: {response.text}")

            data = response.json()
            if not data:
                return None

            record = data[0]
            return JourneyStateRecord(
                patient_id=record["patient_id"],
                state=JourneyState(record["state"]),
                previous_state=JourneyState(record["previous_state"]) if record.get("previous_state") else None,
                state_entered_at=datetime.fromisoformat(record["state_entered_at"].replace("Z", "+00:00")),
                thread_id=record["thread_id"],
                metadata=record.get("metadata", {}),
                assigned_coordinator_name=record.get("assigned_coordinator_name"),
                last_updated_at=datetime.fromisoformat(record["last_updated_at"].replace("Z", "+00:00"))
            )

    def validate_transition(
        self,
        current_state: Optional[JourneyState],
        new_state: JourneyState,
        force: bool = False
    ) -> bool:
        """
        Validate if a state transition is allowed.

        Args:
            current_state: The current state (None if new patient)
            new_state: The desired new state
            force: If True, skip validation (for coordinator overrides)

        Returns:
            True if valid

        Raises:
            InvalidTransitionError if invalid and not forced
        """
        if force:
            return True

        if current_state is None:
            # New patient - only INQUIRY is valid
            if new_state != JourneyState.INQUIRY:
                raise InvalidTransitionError(None, new_state)
            return True

        allowed = STATE_TRANSITIONS.get(current_state, [])
        if new_state not in allowed:
            raise InvalidTransitionError(current_state, new_state)

        return True

    async def transition(self, patient_id: str, transition: StateTransition) -> Dict[str, Any]:
        """
        Transition a patient to a new state.

        This method:
        1. Validates the transition (unless forced)
        2. Updates the state in Supabase
        3. Logs the event to journey_events

        Args:
            patient_id: The patient's UUID
            transition: StateTransition object with details

        Returns:
            Dict with success status and new state info
        """
        # Get current state
        current_record = await self.get_state(patient_id)
        current_state = current_record.state if current_record else None

        # Validate transition
        self.validate_transition(current_state, transition.to_state, transition.force)

        async with httpx.AsyncClient() as client:
            if current_record is None:
                # Create new state record
                response = await client.post(
                    f"{self.supabase_url}/rest/v1/patient_journey_state",
                    headers=self.headers,
                    json={
                        "patient_id": patient_id,
                        "state": transition.to_state.value,
                        "previous_state": None,
                        "thread_id": f"thread_{patient_id}",
                        "current_stage": transition.to_state.value,  # Legacy field
                        "metadata": {
                            "created_by": transition.triggered_by,
                            "agent_id": transition.agent_id
                        }
                    }
                )
            else:
                # Update existing state
                response = await client.patch(
                    f"{self.supabase_url}/rest/v1/patient_journey_state",
                    headers=self.headers,
                    params={"patient_id": f"eq.{patient_id}"},
                    json={
                        "state": transition.to_state.value,
                        "previous_state": current_state.value if current_state else None,
                        "state_entered_at": datetime.utcnow().isoformat(),
                        "last_updated_at": datetime.utcnow().isoformat(),
                        "current_stage": transition.to_state.value,  # Legacy field
                        "metadata": {
                            **(current_record.metadata if current_record else {}),
                            "last_transition": {
                                "from": current_state.value if current_state else None,
                                "to": transition.to_state.value,
                                "triggered_by": transition.triggered_by,
                                "agent_id": transition.agent_id,
                                "at": datetime.utcnow().isoformat()
                            }
                        }
                    }
                )

            if response.status_code not in [200, 201]:
                raise Exception(f"Failed to update state: {response.text}")

            # Log the event
            await self._log_event(
                patient_id=patient_id,
                event_type="state_change",
                from_state=current_state,
                to_state=transition.to_state,
                triggered_by=transition.triggered_by,
                agent_id=transition.agent_id,
                coordinator_id=transition.coordinator_id,
                coordinator_name=transition.coordinator_name,
                event_data=transition.event_data
            )

            return {
                "success": True,
                "patient_id": patient_id,
                "from_state": current_state.value if current_state else None,
                "to_state": transition.to_state.value,
                "forced": transition.force
            }

    async def _log_event(
        self,
        patient_id: str,
        event_type: str,
        triggered_by: str,
        event_data: Dict[str, Any] = None,
        from_state: JourneyState = None,
        to_state: JourneyState = None,
        agent_id: str = None,
        coordinator_id: str = None,
        coordinator_name: str = None,
        error_message: str = None
    ):
        """Log an event to the journey_events table"""
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{self.supabase_url}/rest/v1/journey_events",
                headers=self.headers,
                json={
                    "patient_id": patient_id,
                    "event_type": event_type,
                    "from_state": from_state.value if from_state else None,
                    "to_state": to_state.value if to_state else None,
                    "triggered_by": triggered_by,
                    "agent_id": agent_id,
                    "coordinator_id": coordinator_id,
                    "coordinator_name": coordinator_name,
                    "event_data": event_data or {},
                    "error_message": error_message
                }
            )

    async def get_timeline(
        self,
        patient_id: str,
        limit: int = 50,
        event_types: List[str] = None
    ) -> List[Dict[str, Any]]:
        """Get the event timeline for a patient"""
        async with httpx.AsyncClient() as client:
            params = {
                "patient_id": f"eq.{patient_id}",
                "order": "created_at.desc",
                "limit": str(limit)
            }

            if event_types:
                params["event_type"] = f"in.({','.join(event_types)})"

            response = await client.get(
                f"{self.supabase_url}/rest/v1/journey_events",
                headers=self.headers,
                params=params
            )

            if response.status_code != 200:
                raise Exception(f"Failed to get timeline: {response.text}")

            return response.json()

    async def recover_from_crash(self, patient_id: str) -> Optional[JourneyStateRecord]:
        """
        Recover patient journey state after a crash.

        Checks the last checkpoint data and recovery_data fields
        to determine the best state to resume from.
        """
        record = await self.get_state(patient_id)

        if not record:
            return None

        # Log recovery attempt
        await self._log_event(
            patient_id=patient_id,
            event_type="recovery_attempt",
            triggered_by="system",
            event_data={
                "recovered_state": record.state.value,
                "recovered_at": datetime.utcnow().isoformat()
            }
        )

        return record

    async def assign_coordinator(
        self,
        patient_id: str,
        coordinator_id: str,
        coordinator_name: str
    ) -> bool:
        """Assign a coordinator to a patient journey"""
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{self.supabase_url}/rest/v1/patient_journey_state",
                headers=self.headers,
                params={"patient_id": f"eq.{patient_id}"},
                json={
                    "assigned_coordinator_id": coordinator_id,
                    "assigned_coordinator_name": coordinator_name,
                    "last_updated_at": datetime.utcnow().isoformat()
                }
            )

            if response.status_code == 200:
                await self._log_event(
                    patient_id=patient_id,
                    event_type="assignment",
                    triggered_by="system",
                    coordinator_id=coordinator_id,
                    coordinator_name=coordinator_name,
                    event_data={"action": "coordinator_assigned"}
                )
                return True

            return False


# Singleton instance
_state_machine: Optional[PatientJourneyStateMachine] = None


def get_state_machine() -> PatientJourneyStateMachine:
    """Get or create the singleton state machine instance"""
    global _state_machine
    if _state_machine is None:
        _state_machine = PatientJourneyStateMachine()
    return _state_machine
