from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Modelo exposto em JSON com camelCase (videoId, startMs…), como o front espera."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
