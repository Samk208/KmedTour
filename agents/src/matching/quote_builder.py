from typing import Dict, Any, List
from ..utils.n8n_mock import n8n_client

def build_quote(matched_hospitals: List[Dict[str, Any]], patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Mock quote generator.
    Triggers n8n to generate a PDF quote.
    """
    top_hospital = matched_hospitals[0]
    print(f"[Stub] Generating quote for {top_hospital['name']}")
    
    quote_payload = {
        "hospital_id": top_hospital["id"],
        "procedure": patient_data.get("primary_diagnosis"),
        "base_cost": 15000,
        "travel_cost": 2000,
        "currency": "USD"
    }
    
    # Call n8n to create PDF
    n8n_response = n8n_client.trigger_webhook("generate_quote", quote_payload)
    
    return {
        "quote_id": "q_123456",
        "total_amount": 17000,
        "currency": "USD",
        "pdf_url": n8n_response["pdf_url"],
        "breakdown": quote_payload
    }
