from config.llm_client import LLMclient

class LLMService:

    def llm_invoke(self,prompt,request):
        llm_client=LLMclient.get_client()  #here if we want specific provider we can mention LLMclient.get_client(provider="openai")
        response=llm_client.invoke(prompt)
        return response
