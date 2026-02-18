from typing import Dict, Any
from ..routers.fast_router import FastRouter
from ..compliance.medical_compliance import MedicalVoiceCompliance, VoiceIntent

class VoiceAgentCore:
    """
    Main Orchestrator for the Voice Agent.
    Coordinates: Router -> Compliance -> Action
    """
    
    def __init__(self):
        self.router = FastRouter()
        self.compliance = MedicalVoiceCompliance()

    async def process_input(self, text: str, session_id: str) -> Dict[str, Any]:
        """
        Process a simplified voice input text.
        
        Returns:
            {
                "intent": VoiceIntent,
                "action_type": "audio_template" | "llm_stream" | "verification_flow" | "handoff",
                "payload": str (template_id or text response)
            }
        """
        # 1. Route (Latency: <5ms)
        intent, confidence = self.router.route(text)
        
        # 2. Compliance Check (Latency: <5ms)
        guard_result = self.compliance.check_compliance(intent, text, session_id)
        
        if not guard_result["allowed"]:
            return {
                "intent": intent,
                "action_type": "verification_flow",
                "payload": "request_identity_verification",
                "reason": guard_result["reason"]
            }

        # 3. Determine Action
        
        # A. Emergency
        if intent == VoiceIntent.EMERGENCY:
            return {
                "intent": intent,
                "action_type": "handoff",
                "payload": "emergency_escalation_protocol"
            }
            
        # B. Fast Path (Templates)
        template_id = self.router.get_template_response(intent)
        if template_id:
            return {
                "intent": intent,
                "action_type": "audio_template",
                "payload": template_id
            }
            
        # C. Intelligent Path (LLM) - Only if intent is generic/medical and allowed
        if intent in [VoiceIntent.MEDICAL_QUERY, VoiceIntent.PRICING_GENERAL, VoiceIntent.SCHEDULING, VoiceIntent.UNKNOWN]:
             return {
                "intent": intent,
                "action_type": "llm_stream",
                "payload": text # Pass original query to LLM
            }
            
        # Fallback
        return {
            "intent": VoiceIntent.UNKNOWN,
            "action_type": "llm_stream",
            "payload": text
        }
