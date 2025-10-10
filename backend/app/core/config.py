from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    DATABASE_PASSWORD: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Construct the database URL from settings
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://postgres:{self.DATABASE_PASSWORD}@localhost:5432/Python"

    class Config:
        env_file = ".env"

settings = Settings()