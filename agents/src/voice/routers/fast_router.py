import re
from typing import Optional, Tuple
from ..compliance.medical_compliance import VoiceIntent

class FastRouter:
    """
    Zero-latency (<10ms) Regex Router.
    Handles high-frequency, low-complexity queries locally.
    """

    # Compiled patterns for O(1) matching
    PATTERNS = [
        (re.compile(r"(?i)\b(emergency|die|dying|chest pain|bleed|heart attack|stroke|ambulance|911)\b"), VoiceIntent.EMERGENCY),
        (re.compile(r"(?i)\b(speak.*human|talk.*person|agent|representative|operator)\b"), VoiceIntent.HUMAN_HANDOFF),
        (re.compile(r"(?i)\b(hello|hi|hey|good morning|afternoon|evening)\b"), VoiceIntent.GREETING),
        (re.compile(r"(?i)\b(hours|open|close|time|when)\b"), VoiceIntent.HOURS),
        (re.compile(r"(?i)\b(where|location|address|map|directions|parking)\b"), VoiceIntent.LOCATION),
        (re.compile(r"(?i)\b(cost|price|expensive|much|quote|estimate)\b"), VoiceIntent.PRICING_GENERAL),
        (re.compile(r"(?i)\b(schedule|book|appointment|calendar|visit|meet)\b"), VoiceIntent.SCHEDULING),
        # Medical keywords that trigger LLM but mark as query
        (re.compile(r"(?i)\b(symptom|pain|sick|hurt|surgery|implant|consult|doctor|dr)\b"), VoiceIntent.MEDICAL_QUERY),
    ]

    def route(self, text: str) -> Tuple[VoiceIntent, float]:
        """
        Route text to intent.
        Returns (Intent, Confidence). 
        Regex is always confidence 1.0 if matched.
        """
        clean_text = text.strip()
        
        for pattern, intent in self.PATTERNS:
            if pattern.search(clean_text):
                return intent, 1.0
                
        return VoiceIntent.UNKNOWN, 0.0

    def get_template_response(self, intent: VoiceIntent) -> Optional[str]:
        """
        Map intent to pre-cached audio file ID or text template.
        """
        TEMPLATES = {
            VoiceIntent.GREETING: "greeting_default",
            VoiceIntent.HOURS: "clinic_hours_info",
            VoiceIntent.LOCATION: "clinic_location_info",
            VoiceIntent.HUMAN_HANDOFF: "transferring_to_agent",
            VoiceIntent.UNKNOWN: None # No template, needs LLM
        }
        return TEMPLATES.get(intent)
