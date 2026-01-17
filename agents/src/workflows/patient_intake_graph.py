from typing import TypedDict, Annotated, List, Dict, Any
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

# Import our stubbed agents
from agents.src.intake.document_processor import process_documents
from agents.src.triage.medical_classifier import classify_urgency
from agents.src.matching.hospital_ranker import rank_hospitals
from agents.src.matching.quote_builder import build_quote

# Define the state that passes through the graph
class PatientJourneyState(TypedDict):
    patient_id: str
    documents: List[str]
    extracted_data: Dict[str, Any]
    triage_result: Dict[str, Any]
    matched_hospitals: List[Dict[str, Any]]
    final_quote: Dict[str, Any]
    messages: Annotated[List[str], "append"]

# --- Node Functions ---

def intake_node(state: PatientJourneyState):
    """Step 1: Process Documents"""
    result = process_documents(state["documents"])
    return {
        "extracted_data": result["structured_data"],
        "messages": [f"Processed {result['documents_processed']} docs"]
    }

def triage_node(state: PatientJourneyState):
    """Step 2: Classify Urgency"""
    urgency = classify_urgency(state["extracted_data"])
    return {
        "triage_result": urgency,
        "messages": [f"Triage Level: {urgency['level']}"]
    }

def matching_node(state: PatientJourneyState):
    """Step 3: Find Hospitals"""
    specialist = state["triage_result"]["recommended_specialist"]
    matches = rank_hospitals([specialist], state["extracted_data"])
    return {
        "matched_hospitals": matches,
        "messages": [f"Found {len(matches)} hospitals"]
    }

def quote_node(state: PatientJourneyState):
    """Step 4: Generate Quote"""
    quote = build_quote(state["matched_hospitals"], state["extracted_data"])
    return {
        "final_quote": quote,
        "messages": [f"Quote generated: {quote['quote_id']}"]
    }

# --- Graph Construction ---

workflow = StateGraph(PatientJourneyState)

# Add nodes
workflow.add_node("intake", intake_node)
workflow.add_node("triage", triage_node)
workflow.add_node("matching", matching_node)
workflow.add_node("quote", quote_node)

# Define edges (Linear flow for MVP)
workflow.set_entry_point("intake")
workflow.add_edge("intake", "triage")
workflow.add_edge("triage", "matching")
workflow.add_edge("matching", "quote")
workflow.add_edge("quote", END)

# Compile with memory persistence
app = workflow.compile(checkpointer=MemorySaver())
