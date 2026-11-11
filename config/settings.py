from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str
    ANTHROPIC_API_KEY: str
    DEFAULT_PROVIDER: str
    OPEN_AI_MODEL: str
    ANTHROPIC_MODEL: str

    DB_HOST: str
    DB_USER: str
    DB_PASSWORD: str
    DB_PORT: int
    DB_NAME: str


    model_config = {
        "env_file": ".env"
    }

settings = Settings()

