from typing import Dict, Any

class MockN8N:
    """
    Mock n8n webhook system to simulate external actions.
    """
    
    def trigger_webhook(self, workflow_name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate triggering an n8n workflow"""
        print(f"[Stub] Triggering n8n workflow '{workflow_name}' with payload: {payload}")
        
        if workflow_name == "hospital_availability":
            return {"available_slots": ["2026-02-10T10:00:00Z", "2026-02-12T14:00:00Z"]}
        
        if workflow_name == "generate_quote":
            return {"pdf_url": "https://kmedtour.com/quotes/sample_quote_123.pdf"}
            
        if workflow_name == "send_notification":
            return {"status": "sent", "channel": payload.get("channel", "email")}
            
        return {"status": "success", "mock": True}

n8n_client = MockN8N()
