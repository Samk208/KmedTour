"""
KmedTour AI Agent - LangGraph Multi-Agent System
Uses Gemini Flash for cost-effective medical tourism assistance
"""

from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.checkpoint.sqlite import SqliteSaver
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from typing import Literal
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Gemini Flash (cheapest option: $0.075 per 1M tokens)
llm = ChatGoogleGenerativeAI(
    model=os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.7,
    convert_system_message_to_human=True
)

# Medical Disclaimer (MUST appear in every response)
MEDICAL_DISCLAIMER = """⚠️ **MEDICAL DISCLAIMER**
I provide general information only and am NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical decisions.

For medical emergencies, call 119 (Korea) or your local emergency number immediately.
"""

# System prompts for different agents
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
- Make claims about guaranteed outcomes

**Communication Style**:
- Warm, empathetic, and professional
- Clear and concise (avoid medical jargon)
- Culturally sensitive to international patients
- Always provide helpful next steps (e.g., "Would you like to book a free consultation?")

**Important**: If you're unsure or the question is complex, suggest connecting with a human medical coordinator.
"""

MEDICAL_INFO_SYSTEM_PROMPT = f"""{MEDICAL_DISCLAIMER}

You are a specialized medical information agent for KmedTour, providing detailed information about medical procedures in South Korea.

**Your Role**:
- Provide comprehensive information about specific procedures
- Explain procedure steps, techniques, and technologies used
- Discuss recovery processes and timelines
- Compare different surgical approaches when relevant
- Explain what to expect before, during, and after procedures

**Critical Rules**:
- NEVER diagnose or suggest treatments for specific symptoms
- NEVER recommend whether someone should get a procedure
- ALWAYS cite that information is general and consultation is needed
- ALWAYS remind patients to discuss their specific case with a doctor
- If asked about complications or risks, be honest but balanced

Use simple language that non-medical people can understand.
"""

def route_by_query_type(state: MessagesState) -> Literal["faq", "medical_info", "emergency", "human"]:
    """
    Intelligent routing based on query analysis
    """
    query = state["messages"][-1].content.lower()

    # Emergency keywords → immediate escalation
    emergency_keywords = [
        "chest pain", "heart attack", "can't breathe", "difficulty breathing",
        "severe bleeding", "heavy bleeding", "suicide", "kill myself",
        "overdose", "unconscious", "stroke", "seizure", "emergency"
    ]
    if any(keyword in query for keyword in emergency_keywords):
        return "emergency"

    # Medical advice requests (out of scope) → human escalation
    medical_advice_phrases = [
        "should i get", "should i have", "do i need",
        "diagnose", "what's wrong with", "am i sick",
        "what medication", "what treatment"
    ]
    if any(phrase in query for phrase in medical_advice_phrases):
        return "human"

    # Detailed medical/procedure questions → medical info agent
    procedure_keywords = [
        "how does", "procedure work", "surgery", "surgical",
        "recovery", "healing", "what happens during",
        "technique", "method", "approach"
    ]
    if any(keyword in query for keyword in procedure_keywords):
        return "medical_info"

    # Default → FAQ agent (pricing, general info, logistics)
    return "faq"


def faq_agent_node(state: MessagesState):
    """
    Handle general FAQs about procedures, costs, hospitals, logistics
    """
    messages = state["messages"]

    # Prepare messages with system prompt
    system_msg = SystemMessage(content=FAQ_SYSTEM_PROMPT)
    all_messages = [system_msg] + messages

    # Call Gemini (very cheap: ~$0.0001 per request)
    response = llm.invoke(all_messages)

    return {"messages": [response]}


def medical_info_agent_node(state: MessagesState):
    """
    Handle detailed medical/procedure information requests
    """
    messages = state["messages"]

    # Prepare messages with medical info system prompt
    system_msg = SystemMessage(content=MEDICAL_INFO_SYSTEM_PROMPT)
    all_messages = [system_msg] + messages

    # Call Gemini with more detailed context
    response = llm.invoke(all_messages)

    return {"messages": [response]}


def emergency_escalation_node(state: MessagesState):
    """
    Handle emergency situations - DO NOT use AI
    """
    emergency_message = """🚨 **THIS IS A MEDICAL EMERGENCY**

Please call emergency services immediately:
- **Korea**: 119
- **United States**: 911
- **UK**: 999
- **Europe**: 112

Our AI assistant cannot help with medical emergencies. Please seek immediate medical attention.

If you're experiencing a mental health crisis:
- **Korea Suicide Prevention Hotline**: 1393
- **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/
"""

    return {"messages": [{"role": "assistant", "content": emergency_message}]}


def human_escalation_node(state: MessagesState):
    """
    Handle out-of-scope queries that need human medical coordinator
    """
    escalation_message = """I cannot provide medical advice, diagnoses, or treatment recommendations. These questions require consultation with a qualified healthcare professional.

**Next Steps**:
1. **Book a FREE consultation** with our medical coordinators who can:
   - Review your specific medical history
   - Connect you with appropriate specialists
   - Provide personalized recommendations
   - Answer detailed questions about your case

2. **Email us** at: [email protected]
3. **WhatsApp**: +82-10-XXXX-XXXX (24/7)

Would you like me to help you schedule a consultation? I just need your:
- Name
- Email
- Preferred consultation time
- Brief description of what you're interested in
"""

    return {"messages": [{"role": "assistant", "content": escalation_message}]}


# Build the LangGraph workflow
workflow = StateGraph(MessagesState)

# Add all agent nodes
workflow.add_node("router", lambda state: state)  # Dummy node for routing logic
workflow.add_node("faq_agent", faq_agent_node)
workflow.add_node("medical_info_agent", medical_info_agent_node)
workflow.add_node("emergency", emergency_escalation_node)
workflow.add_node("human", human_escalation_node)

# Define edges
workflow.add_edge(START, "router")

# Conditional routing from the router
workflow.add_conditional_edges(
    "router",
    route_by_query_type,
    {
        "faq": "faq_agent",
        "medical_info": "medical_info_agent",
        "emergency": "emergency",
        "human": "human"
    }
)

# All agents end after responding
workflow.add_edge("faq_agent", END)
workflow.add_edge("medical_info_agent", END)
workflow.add_edge("emergency", END)
workflow.add_edge("human", END)

# Compile with persistent memory (SQLite checkpointer)
memory = SqliteSaver.from_conn_string("checkpoints.db")
app = workflow.compile(checkpointer=memory)

# Test function
if __name__ == "__main__":
    print("🚀 KmedTour AI Agent initialized!")
    print(f"Using model: {os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')}")

    # Test query
    config = {"configurable": {"thread_id": "test-session"}}
    test_message = {"messages": [{"role": "user", "content": "What is rhinoplasty?"}]}

    print("\n📝 Test query: What is rhinoplasty?")
    result = app.invoke(test_message, config=config)
    print(f"\n💬 Response:\n{result['messages'][-1].content}")
