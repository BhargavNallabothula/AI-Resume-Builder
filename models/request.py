from pydantic import BaseModel

class chatRequest(BaseModel):
    message:str
    user_id:str
