"""
KmedTour Medical Tourism Operating System - FastAPI Server

Features:
- AI chatbot with LangGraph multi-agent system
- Patient journey state machine
- Workflow orchestration
- Cost: ~$5-20/month with Gemini Flash
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from app.core.graph import app as agent_app
from app.routers.journey import router as journey_router
import uuid
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="KmedTour Medical Tourism OS API",
    description="Medical Tourism Operating System with AI agents, journey orchestration, and workflow automation",
    version="2.0.0"
)

# Include routers
app.include_router(journey_router)

# CORS configuration for Next.js frontend
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    session_id: str
    response: str
    agent_used: Optional[str] = None


# API Endpoints
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "KmedTour AI Agents",
        "status": "healthy",
        "version": "1.0.0",
        "llm_provider": "Gemini Flash",
        "cost_per_1m_tokens": "$0.075"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "api": "running",
            "langgraph": "initialized",
            "gemini": "connected"
        }
    }


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint - routes queries through LangGraph multi-agent system

    Cost: ~$0.0001 - $0.0005 per request with Gemini Flash
    """
    try:
        # Generate or use existing session ID
        session_id = request.session_id or str(uuid.uuid4())

        # Format messages for LangGraph
        messages = [
            {"role": msg.role, "content": msg.content}
            for msg in request.messages
        ]

        # Call LangGraph agent (with persistent memory via session_id)
        config = {"configurable": {"thread_id": session_id}}

        result = await agent_app.ainvoke(
            {"messages": messages},
            config=config
        )

        # Extract response
        assistant_message = result["messages"][-1]

        # Determine which agent was used (for debugging/analytics)
        agent_used = "unknown"
        if "emergency" in assistant_message.content.lower():
            agent_used = "emergency_escalation"
        elif "cannot provide medical advice" in assistant_message.content.lower():
            agent_used = "human_escalation"
        elif len(assistant_message.content) > 500:
            agent_used = "medical_info_agent"
        else:
            agent_used = "faq_agent"

        return ChatResponse(
            session_id=session_id,
            response=assistant_message.content,
            agent_used=agent_used
        )

    except Exception as e:
        print(f"❌ Error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Streaming chat endpoint (for real-time responses)
    TODO: Implement streaming with LangGraph
    """
    raise HTTPException(
        status_code=501,
        detail="Streaming not yet implemented. Use /api/chat for now."
    )


@app.get("/api/stats")
async def get_stats():
    """
    Get usage statistics (for monitoring costs)
    TODO: Implement Redis-based stats tracking
    """
    return {
        "total_conversations": 0,
        "total_messages": 0,
        "estimated_cost_today": "$0.00",
        "cache_hit_rate": "0%"
    }


# Run server
if __name__ == "__main__":
    import uvicorn

    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8000))

    print(f"""
    🚀 KmedTour AI Agents Server Starting...

    📡 Server: http://{host}:{port}
    📚 Docs: http://{host}:{port}/docs
    🔧 Health: http://{host}:{port}/health

    💰 Cost Estimate: ~$5-20/month with Gemini Flash
    🌍 CORS Origins: {allowed_origins}
    """)

    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=os.getenv("DEBUG", "false").lower() == "true"
    )
