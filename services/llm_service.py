from config.llm_client import LLMclient

class LLMService:

    def llm_invoke(self,prompt,request):
        llm_client=LLMclient.get_client()  
        response=llm_client.invoke(prompt)
        return response
