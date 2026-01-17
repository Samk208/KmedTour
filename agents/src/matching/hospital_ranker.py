from typing import List, Dict, Any
from ..utils.rag_mock import rag_client
from ..utils.n8n_mock import n8n_client

def rank_hospitals(specialists: List[str], patient_preferences: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Mock hospital matching agent. 
    1. Queries RAG for candidates.
    2. Calls n8n to check real-time availability.
    """
    print(f"[Stub] Matching hospitals for specialists: {specialists}")
    
    # 1. RAG Search
    candidates = rag_client.query_hospitals(specialists, patient_preferences.get("location"))
    
    # 2. Availability Check (via n8n stub)
    hospital_ids = [h["id"] for h in candidates]
    availability = n8n_client.trigger_webhook("hospital_availability", {"hospital_ids": hospital_ids})
    
    # Merge availability into results
    for hospital in candidates:
        hospital["next_available_slot"] = availability["available_slots"][0]
        
    return candidates
