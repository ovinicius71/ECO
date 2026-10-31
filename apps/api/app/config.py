from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuração lida das variáveis ECO_* (ver .env.example)."""

    model_config = SettingsConfigDict(env_prefix="ECO_", env_file=".env", extra="ignore")

    cors_origin: str = "http://localhost:5173"
    cache_dir: str = ".cache"
    enable_whisper: bool = False
    whisper_model: str = "small"
    translate_provider: str = ""
    translate_api_key: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
