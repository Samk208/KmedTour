import asyncio
from agents.src.voice.compliance.medical_compliance import VoiceIntent
from agents.src.voice.core.agent import VoiceAgentCore

async def run_test_cases():
    agent = VoiceAgentCore()
    
    test_inputs = [
        ("Hello there", "session_001", "GREETING / Template"),
        ("What are your hours?", "session_001", "HOURS / Template"),
        ("I have chest pain", "session_001", "EMERGENCY / Handoff"),
        ("I need a heart surgery", "session_unverified", "MEDICAL_QUERY / Blocked"),
        ("I need a heart surgery", "session_verified", "MEDICAL_QUERY / LLM"),
    ]

    # Pre-verify a session for testing
    agent.compliance.verify_session("session_verified", {"id": "patient_123", "role": "patient"})

    print(f"{'INPUT':<30} | {'EXPECTED':<25} | {'ACTUAL ACTION':<20} | {'RESULT'}")
    print("-" * 100)

    for text, session_id, expected_desc in test_inputs:
        result = await agent.process_input(text, session_id)
        
        # Determine pass/fail based on rough match of expectation
        status = "FAIL"
        action = result["action_type"]
        
        if "Template" in expected_desc and action == "audio_template": status = "PASS"
        elif "Handoff" in expected_desc and action == "handoff": status = "PASS"
        elif "Blocked" in expected_desc and action == "verification_flow": status = "PASS"
        elif "LLM" in expected_desc and action == "llm_stream": status = "PASS"
        
        print(f"{text:<30} | {expected_desc:<25} | {action:<20} | {status}")

if __name__ == "__main__":
    asyncio.run(run_test_cases())
