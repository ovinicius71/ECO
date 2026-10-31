from typing import Annotated

import httpx
from fastapi import Depends, Request

from app.services.cache import Cache


def get_http(request: Request) -> httpx.AsyncClient:
    return request.app.state.http


def get_cache(request: Request) -> Cache:
    return request.app.state.cache


Http = Annotated[httpx.AsyncClient, Depends(get_http)]
CacheDep = Annotated[Cache, Depends(get_cache)]
