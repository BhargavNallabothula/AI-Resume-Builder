from prompts import chat_prompt,resume_prompt
from services.llm_service import LLMService
import json
import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    connection=pymysql.connect(host=os.getenv("DB_HOST"),user=os.getenv("DB_USER"),password=os.getenv("DB_PASSWORD"),port=int(os.getenv("DB_PORT")),database=os.getenv("DB_NAME"),cursorclass=pymysql.cursors.DictCursor)
    return connection

class chatService:

    def ai_chat(self, request):
        conn=get_db_connection()
        cursor=conn.cursor()
        messages=[]
        messages.append({"role":"system","content":chat_prompt.prompt})

        query="select msg_role,msg_content from project1 where user_id=%s"
        cursor.execute(query,(request.user_id))
        history=cursor.fetchall()

        

        for msg in history:
            messages.append({"role":msg["msg_role"],"content":msg["msg_content"]})

        messages.append({"role":"user","content":request.message})

        llm_client = LLMService()
        

        response = llm_client.llm_invoke(messages, request)
        content = response.content

        try:
            json_response = json.loads(content)
        except Exception:
            return {
                "error": "Invalid JSON from LLM",
                "raw_output": content
            }

        ai_reply = json_response.get("ai_reply", "")

        state=json_response.get("state",{})


        query = "INSERT INTO project1 (user_id, msg_role, msg_content) VALUES (%s,%s,%s)"
        cursor.execute(query, (request.user_id, "user", request.message))

        query = "INSERT INTO project1 (user_id, msg_role, msg_content) VALUES (%s,%s,%s)"
        cursor.execute(query, (request.user_id, "assistant", ai_reply))

        if state.get("status")=="complete":
            resume_messages=[{
                "role":"system",
                "content":resume_prompt.prompt
            },
            {
                "role":"user",
                "content":json.dumps(state)
            }
            ]

            resume_response=llm_client.llm_invoke(resume_messages,request)

            resume=resume_response.content

            cursor.close()
            conn.close()

            return {
                "ai_reply":ai_reply,
                "state":state,
                "resume":resume
            }

        conn.commit()
        cursor.close()
        conn.close()

        return json_response

        

        

        



