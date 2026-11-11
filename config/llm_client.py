from config.settings import settings
from langchain_openai import ChatOpenAI


class LLMclient:

    @staticmethod
    def get_client(provider:str | None=None):
        provider=provider or settings.DEFAULT_PROVIDER

        if provider.lower()=="openai":
            return ChatOpenAI(model=settings.OPEN_AI_MODEL,api_key=settings.OPENAI_API_KEY)

