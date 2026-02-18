"""
KmedTour AI Agent - LangGraph Multi-Agent System (Self-Healing Edition)
Production-grade orchestration with deterministic safety checks.
"""

from langgraph.graph import StateGraph, START, END

# from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from typing import Literal, TypedDict, List, Any
import os
from dotenv import load_dotenv

# Import Safety Layer
from app.core.medical_safety import MedicalSafetyLayer, SafetyViolation

# Load environment variables
load_dotenv()

# Initialize OpenAI (Fallback for robustness)
llm = ChatOpenAI(
    model="gpt-4o-mini",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7
)

# Initialize Safety Layer
safety_layer = MedicalSafetyLayer()

# --- STATE DEFINITION ---
class AgentState(TypedDict):
    messages: List[Any]
    query_type: str
    requires_human_review: bool
    safety_violations: List[SafetyViolation]

# --- PROMPTS ---
MEDICAL_DISCLAIMER = """⚠️ **MEDICAL DISCLAIMER**
I provide general information only and am NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical decisions.

For medical emergencies, call 119 (Korea) or your local emergency number immediately.
"""

FAQ_SYSTEM_PROMPT = f"""{MEDICAL_DISCLAIMER}

You are a helpful medical tourism assistant for KmedTour, helping international patients learn about medical procedures in South Korea.

**What you CAN do**:
- Explain medical procedures in simple terms (general information)
- Provide cost estimates from our database
- Share recovery timeline information
- Describe hospital facilities and accreditations (KAHF/KOIHA)
- Explain visa requirements and travel logistics
- Answer questions about accommodation and transportation

**What you CANNOT do**:
- Diagnose medical conditions
- Recommend specific procedures for individual health situations
- Prescribe medications or treatments
- Provide emergency medical care
- Give definitive medical advice without doctor consultation

**Communication Style**:
- Warm, empathetic, and professional
- Clear and concise (avoid medical jargon)
- Culturally sensitive to international patients
- Always provide helpful next steps
"""

MEDICAL_INFO_SYSTEM_PROMPT = f"""{MEDICAL_DISCLAIMER}

You are a specialized medical information agent for KmedTour.

**Your Role**:
- Provide comprehensive information about specific procedures
- Explain procedure steps, techniques, and technologies used
- Discuss recovery processes and timelines
- Compare different surgical approaches when relevant

**Critical Rules**:
- NEVER diagnose or suggest treatments for specific symptoms
- NEVER recommend whether someone should get a procedure
- ALWAYS cite that information is general and consultation is needed
- If asked about complications or risks, be honest but balanced

Use simple language that non-medical people can understand.
"""

# --- NODES ---

def route_query(state: AgentState) -> Literal["faq", "medical_info", "emergency", "human"]:
    """Deterministic routing node"""
    query = state["messages"][-1].content.lower()

    # Emergency check (also pre-check for safety layer)
    emergency_keywords = [
        "chest pain", "heart attack", "can't breathe", "difficulty breathing",
        "severe bleeding", "heavy bleeding", "suicide", "kill myself",
        "overdose", "unconscious", "stroke", "seizure", "emergency"
    ]
    if any(keyword in query for keyword in emergency_keywords):
        return "emergency"

    # Medical advice requests (out of scope)
    medical_advice_phrases = [
        "should i get", "should i have", "do i need",
        "diagnose", "what's wrong with", "am i sick",
        "what medication", "what treatment"
    ]
    if any(phrase in query for phrase in medical_advice_phrases):
        return "human"

    # Detailed medical/procedure questions
    procedure_keywords = [
        "how does", "procedure work", "surgery", "surgical",
        "recovery", "healing", "what happens during",
        "technique", "method", "approach"
    ]
    if any(keyword in query for keyword in procedure_keywords):
        return "medical_info"

    return "faq"

def faq_agent_node(state: AgentState):
    messages = state["messages"]
    system_msg = SystemMessage(content=FAQ_SYSTEM_PROMPT)
    response = llm.invoke([system_msg] + messages)
    # We append the response to messages list? Or return updates?
    # LangGraph StateGraph usually expects updates.
    # But since we defined custom TypedDict, we must return the full update manually or just the changed field.
    # Current LangGraph versions merge updates for TypedDict if annotated, or replace.
    # Let's return the updated messages list safe way.
    return {"messages": messages + [response], "query_type": "faq"}

def medical_info_agent_node(state: AgentState):
    messages = state["messages"]
    system_msg = SystemMessage(content=MEDICAL_INFO_SYSTEM_PROMPT)
    response = llm.invoke([system_msg] + messages)
    return {"messages": messages + [response], "query_type": "medical_info"}

def emergency_escalation_node(state: AgentState):
    emergency_message = """🚨 **THIS IS A MEDICAL EMERGENCY**

Please call emergency services immediately:
- **Korea**: 119
- **United States**: 911
- **UK**: 999
- **Europe**: 112

Our AI assistant cannot help with medical emergencies. Please seek immediate medical attention.
"""
    response = AIMessage(content=emergency_message)
    return {"messages": state["messages"] + [response], "query_type": "emergency"}

def human_escalation_node(state: AgentState):
    escalation_message = """I cannot provide medical advice, diagnoses, or treatment recommendations.

**Next Steps**:
1. **Book a FREE consultation** with our medical coordinators.
2. **Email us** at: [email protected]
3. **WhatsApp**: +82-10-XXXX-XXXX (24/7)

Would you like me to help you schedule a consultation?
"""
    response = AIMessage(content=escalation_message)
    return {"messages": state["messages"] + [response], "query_type": "human"}

def safety_check_node(state: AgentState):
    """
    CRITICAL SAFETY LAYER
    This node intercepts the agent's response and checks it against rules.
    """
    last_message = state["messages"][-1]
    
    # If the last message wasn't from assistant, skip (shouldn't happen)
    if not isinstance(last_message, AIMessage):
        return state

    check_result = safety_layer.check_response(
        last_message.content,
        query_type=state.get("query_type", "faq")
    )

    if check_result["action"] == "block":
        # Block: Replace with safe fallback
        fallback_text = (
            "I apologize, but I cannot provide that specific medical information or advice "
            "as it falls outside my safety guidelines. \n\n"
            "Please consult with a qualified doctor for personalized medical advice. "
            "Would you like to speak with one of our medical coordinators?"
        )
        new_messages = state["messages"][:-1] + [AIMessage(content=fallback_text)]
        return {
            "messages": new_messages,
            "requires_human_review": True,
            "safety_violations": check_result["violations"]
        }
    
    elif check_result["action"] == "human_review":
        # Flag: Keep response but mark for review
        return {
            "requires_human_review": True,
            "safety_violations": check_result["violations"]
        }
    
    return {"safety_violations": []}

from app.admin.review_queue import review_queue

def human_review_queue_node(state: AgentState):
    """
    Sends data to an admin review queue.
    """
    last_message = state["messages"][-1]
    content = last_message.content if hasattr(last_message, "content") else str(last_message)
    
    review_queue.flag_for_review(
        input_messages=state["messages"][:-1],
        unsafe_response=content,
        violations=state.get("safety_violations", []),
        metadata={"query_type": state.get("query_type")}
    )
    return state

# --- GRAPH DEFINITION ---

workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("router", lambda state: {"query_type": route_query(state)})
workflow.add_node("faq_agent", faq_agent_node)
workflow.add_node("medical_info_agent", medical_info_agent_node)
workflow.add_node("emergency", emergency_escalation_node)
workflow.add_node("human", human_escalation_node)
workflow.add_node("safety_check", safety_check_node)
workflow.add_node("human_review", human_review_queue_node)

# Add Edges
workflow.add_edge(START, "router")

# Router Logic
workflow.add_conditional_edges(
    "router",
    lambda state: state["query_type"],
    {
        "faq": "faq_agent",
        "medical_info": "medical_info_agent",
        "emergency": "emergency",
        "human": "human"
    }
)

# Agents -> Safety Check (Linear Flow)
workflow.add_edge("faq_agent", "safety_check")
workflow.add_edge("medical_info_agent", "safety_check")
# Emergency/Human nodes are already safe canned responses, but we'll check anyway for consistency
workflow.add_edge("emergency", "safety_check")
workflow.add_edge("human", "safety_check")

# Safety Check -> End or Review (Conditional)
def should_review(state: AgentState):
    if state.get("requires_human_review"):
        return "review"
    return "end"

workflow.add_conditional_edges(
    "safety_check",
    should_review,
    {
        "review": "human_review",
        "end": END
    }
)

workflow.add_edge("human_review", END)

# Compile
from langgraph.checkpoint.memory import MemorySaver
app = workflow.compile(checkpointer=MemorySaver())

if __name__ == "__main__":
    import sys
    import traceback
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
    try:
        print("KmedTour AI Agent (Self-Healing) initialized!")
        
        # Test valid query
        config = {"configurable": {"thread_id": "test-safe"}}
        print("\nTest 1 (Safe): What is rhinoplasty?")
        res = app.invoke({"messages": [HumanMessage(content="What is rhinoplasty?")]}, config=config)
        print(f"Outcome: {res['messages'][-1].content[:50]}...")
    except Exception:
        traceback.print_exc()
