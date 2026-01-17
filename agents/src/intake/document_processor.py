from typing import List, Dict, Any
from pydantic import BaseModel, Field

# Mock models since we don't have the real LLM connected in stub mode yet
class ExtractedMedicalData(BaseModel):
    primary_diagnosis: str = Field(description="Main medical condition")
    symptoms: List[str] = Field(description="List of symptoms")
    urgency_indicators: List[str] = Field(description="Signs of urgency")

def process_documents(documents: List[str]) -> Dict[str, Any]:
    """
    Mock document processor. In real version, this uses Unstructured.io + Claude.
    """
    print(f"[Stub] Processing documents: {documents}")
    
    # Return mock extracted data
    return {
        "documents_processed": len(documents),
        "structured_data": {
            "primary_diagnosis": "Cardiac Arrhythmia",
            "symptoms": ["Palpitations", "Dizziness"],
            "urgency_indicators": ["Fainting spells"],
            "medications": ["Beta blockers"]
        },
        "confidence": 0.95
    }
