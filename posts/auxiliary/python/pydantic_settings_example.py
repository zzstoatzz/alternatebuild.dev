# /// script
# dependencies = [
#     "pydantic-settings>=2",
# ]
# ///

from typing import Annotated, TypeVar

from pydantic import Field, PlainSerializer, Secret, SecretStr, SerializationInfo
from pydantic_settings import BaseSettings

T = TypeVar("T")


def maybe_unmask(v: Secret[T], info: SerializationInfo) -> T | Secret[T]:
    if info.context and info.context.get("unmask"):
        return v.get_secret_value()
    return v


class Settings(BaseSettings):
    current_user: str = Field(alias="user")
    redis_host: str
    redis_port: int = Field(ge=0)
    openai_api_key: Annotated[SecretStr, PlainSerializer(maybe_unmask)]

    def to_env_vars(self) -> dict[str, str]:
        return {
            k.upper(): str(v)
            for k, v in self.model_dump(context={"unmask": True}).items()
            if v is not None
        }


print(Settings().to_env_vars())  # type: ignore
