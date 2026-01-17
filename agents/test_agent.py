"""
Quick test script to verify AI agent is working
"""

import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Test Gemini API key
print("🔑 Testing Gemini API key...")
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    print(f"   ✅ API key found: {api_key[:20]}...")
else:
    print("   ❌ API key not found in .env!")
    sys.exit(1)

# Test imports
print("\n📦 Testing imports...")
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    print("   ✅ langchain_google_genai imported")
except ImportError as e:
    print(f"   ❌ Import failed: {e}")
    print("   Run: pip install -r requirements.txt")
    sys.exit(1)

try:
    from langgraph.graph import StateGraph
    print("   ✅ langgraph imported")
except ImportError as e:
    print(f"   ❌ Import failed: {e}")
    sys.exit(1)

# Test Gemini connection
print("\n🌐 Testing Gemini connection...")
try:
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=api_key,
        temperature=0.7
    )

    response = llm.invoke("Say 'Hello from KmedTour AI!'")
    print(f"   ✅ Gemini responded: {response.content[:50]}...")

except Exception as e:
    print(f"   ❌ Gemini connection failed: {e}")
    sys.exit(1)

# Test LangGraph agent
print("\n🤖 Testing LangGraph agent...")
try:
    from app.core.graph import app as agent_app
    print("   ✅ Agent imported successfully")

    # Test query
    config = {"configurable": {"thread_id": "test-123"}}
    test_input = {"messages": [{"role": "user", "content": "What is rhinoplasty?"}]}

    print("\n   📝 Sending test query: 'What is rhinoplasty?'")
    print("   ⏳ Waiting for response (may take 2-5 seconds)...\n")

    result = agent_app.invoke(test_input, config=config)
    response_text = result["messages"][-1].content

    print("   ✅ Agent Response:")
    print("   " + "="*70)
    print(f"   {response_text[:500]}...")
    print("   " + "="*70)

    # Verify disclaimer is present
    if "MEDICAL DISCLAIMER" in response_text or "general information only" in response_text:
        print("\n   ✅ Medical disclaimer present")
    else:
        print("\n   ⚠️  Warning: Medical disclaimer may be missing")

except Exception as e:
    print(f"   ❌ Agent test failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "="*70)
print("✅ ALL TESTS PASSED!")
print("="*70)
print("\n🚀 Your AI agent is working! Ready to start the API server.")
print("\nNext step: Run 'python -m app.main' to start the FastAPI server")
