from typing import List, Dict, Any

class MockRAG:
    """
    Mock RAG system for simulating Knowledge Base retrieval
    without needing Supabase pgvector initially.
    """
    
    def query_hospitals(self, specialists: List[str], location: str = "") -> List[Dict[str, Any]]:
        """Simulate finding matching hospitals"""
        return [
            {
                "id": "e305e6b0-c0b0-4e3e-8f3e-5f3e4c4c4c4c",
                "name": "Seoul National University Hospital",
                "specialists": ["Cardiology", "Oncology"],
                "api_integration_level": "FULL_API",
                "location": "Seoul",
                "rating": 4.9
            },
            {
                "id": "f405e6b0-c0b0-4e3e-8f3e-5f3e4c4c4c4d",
                "name": "Samsung Medical Center",
                "specialists": ["Cosmetic", "Dermatology"],
                "api_integration_level": "WEBHOOK",
                "location": "Gangnam",
                "rating": 4.8
            }
        ]

    def query_treatment_protocols(self, condition: str) -> List[Dict[str, Any]]:
        """Simulate finding treatment protocols"""
        return [
            {
                "condition": condition,
                "urgency_level": "HIGH" if "pain" in condition.lower() else "MEDIUM",
                "recommended_specialist": "Cardiology" if "heart" in condition.lower() else "General",
                "estimated_cost_usd": 15000
            }
        ]

rag_client = MockRAG()
