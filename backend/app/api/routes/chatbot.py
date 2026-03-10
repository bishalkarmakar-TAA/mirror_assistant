from fastapi import APIRouter, Depends, HTTPException
from ...schemas.chatbot import ChatRequest, ChatResponse
from ...services.chatbot_service import ChatbotService
from ..dependencies import get_supabase_client
from supabase import Client

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

@router.post("/message", response_model=ChatResponse)
async def post_message(request: ChatRequest, db: Client = Depends(get_supabase_client)):
    try:
        # Note the 'async' keyword here since Groq calls are asynchronous
        return await ChatbotService.process_message(db, request)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")