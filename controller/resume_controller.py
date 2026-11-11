from fastapi import APIRouter
from services.resume_service import chatService
from models.request import chatRequest

api_path=APIRouter(prefix="/chat")
chat_service=chatService()

@api_path.post("")
def chat(request:chatRequest):
    response=chat_service.ai_chat(request)
    return response



