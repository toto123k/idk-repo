from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    ors_token: str
    ors_url: str = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"
    ors_timeout: int = 15

settings = Settings()
