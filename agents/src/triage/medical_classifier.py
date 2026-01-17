from typing import Dict, Any
from ..utils.rag_mock import rag_client

def classify_urgency(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Mock triage agent. Uses mock RAG to determine urgency.
    """
    condition = patient_data.get("primary_diagnosis", "General Checkup")
    print(f"[Stub] Classifying urgency for: {condition}")
    
    # Query mock RAG
    protocols = rag_client.query_treatment_protocols(condition)
    protocol = protocols[0]
    
    return {
        "level": protocol["urgency_level"],
        "recommended_specialist": protocol["recommended_specialist"],
        "reasoning": f"Condition '{condition}' matches high-risk protocols.",
        "requires_evac": False
    }
