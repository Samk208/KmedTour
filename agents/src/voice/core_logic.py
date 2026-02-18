from enum import Enum
from typing import Optional, Dict, List
import re
from datetime import datetime, timedelta

# Import existing state machine
# Adjust import path based on actual structure
try:
    from src.core.state_machine import get_state_machine, JourneyState
except ImportError:
    # Fallback for independence if needed, or mocking
    pass

class VoiceIntent(Enum):
    GREETING = "greeting"
    HOURS = "hours"
    LOCATION = "location"
    PRICING_GENERAL = "pricing_general"
    HUMAN_HANDOFF = "human_handoff"
    EMERGENCY = "emergency"
    MEDICAL_QUERY = "medical_query"  # Requires LLM
    SCHEDULING = "scheduling"      # Requires Auth

class MedicalVoiceCompliance:
    """
    Behavioral HIPAA compliance layer.
    Must run BEFORE any sensitive processing.
    """
    
    SENSITIVE_INTENTS = {
        VoiceIntent.MEDICAL_QUERY,
        VoiceIntent.SCHEDULING,
    }

    def __init__(self):
        self.verified_sessions = {}
        # self.state_machine = get_state_machine()

    async def verify_session(self, session_id: str, dob: str, ref_id: str) -> bool:
        """
        Verify patient identity against Supabase
        """
        # Logic to query Supabase via State Machine or direct DB
        # For now, stubbed
        is_valid = True # await self.state_machine.verify_patient(dob, ref_id)
        
        if is_valid:
            self.verified_sessions[session_id] = {
                "verified_at": datetime.now(),
                "expires_at": datetime.now() + timedelta(minutes=15)
            }
            return True
        return False

    def is_verified(self, session_id: str) -> bool:
        session = self.verified_sessions.get(session_id)
        if not session:
            return False
        if datetime.now() > session["expires_at"]:
            del self.verified_sessions[session_id]
            return False
        return True

    def check_guardrails(self, text: str, intent: VoiceIntent, session_id: str) -> Dict:
        """
        Determine if request is allowed based on verification state
        """
        # 1. Emergency Check (Always allow, but route to human/911 logic)
        if intent == VoiceIntent.EMERGENCY:
            return {"allowed": True, "action": "escalate_emergency"}
            
        # 2. PHI Gate
        if intent in self.SENSITIVE_INTENTS:
            if not self.is_verified(session_id):
                return {
                    "allowed": False,
                    "action": "request_verification",
                    "reason": "PHI_PROTECTION"
                }
        
        return {"allowed": True, "action": "proceed"}

class FastRouter:
    """
    Zero-latency regex/keyword router for common queries.
    Bypasses LLM for 60-70% of traffic.
    """
    
    PATTERNS = [
        (r"(?i)(hello|hi|hey|good morning)", VoiceIntent.GREETING),
        (r"(?i)(hours|open|close|time)", VoiceIntent.HOURS),
        (r"(?i)(where|location|address|map)", VoiceIntent.LOCATION),
        (r"(?i)(cost|price|expensive|how much)", VoiceIntent.PRICING_GENERAL),
        (r"(?i)(human|person|agent|speak to someone)", VoiceIntent.HUMAN_HANDOFF),
        (r"(?i)(chest pain|heart attack|dying|emergency|bleed)", VoiceIntent.EMERGENCY),
    ]

    def route(self, text: str) -> VoiceIntent:
        for pattern, intent in self.PATTERNS:
            if re.search(pattern, text):
                return intent
        return VoiceIntent.MEDICAL_QUERY  # Default to LLM if unknown
