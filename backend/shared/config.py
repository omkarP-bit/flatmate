from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # Database
    db_host: str = Field(..., env="DB_HOST")
    db_name: str = Field(..., env="DB_NAME")
    db_user: str = Field(..., env="DB_USER")
    db_password: str = Field(..., env="DB_PASSWORD")
    db_port: int = Field(5432, env="DB_PORT")

    # Redis
    redis_url: str = Field("redis://localhost:6379", env="REDIS_URL")

    # S3
    s3_bucket: str = Field("", env="S3_BUCKET")

    # Cognito
    cognito_user_pool_id: str = Field(..., env="COGNITO_USER_POOL_ID")
    cognito_client_id: str = Field(..., env="COGNITO_CLIENT_ID")
    cognito_region: str = Field("ap-south-1", env="COGNITO_REGION")

    # App
    environment: str = Field("production", env="ENVIRONMENT")
    service_name: str = Field("unknown", env="SERVICE_NAME")

    @property
    def db_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def cognito_jwks_url(self) -> str:
        return (
            f"https://cognito-idp.{self.cognito_region}.amazonaws.com"
            f"/{self.cognito_user_pool_id}/.well-known/jwks.json"
        )

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()