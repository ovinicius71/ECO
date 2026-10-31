from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import Settings, get_settings
from app.errors import install_error_handlers
from app.routers import health, lyrics, songs
from app.services.cache import Cache


def create_app(settings: Settings | None = None, cache: Cache | None = None) -> FastAPI:
    settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        app.state.cache = cache or Cache(Path(settings.cache_dir) / "cache.sqlite3")
        async with httpx.AsyncClient(
            headers={"User-Agent": settings.user_agent},
            timeout=settings.http_timeout_s,
            follow_redirects=True,
        ) as http:
            app.state.http = http
            yield
        app.state.cache.close()

    app = FastAPI(title="Eco API", version="0.0.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.cors_origin],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    install_error_handlers(app)
    app.include_router(health.router, prefix="/api")
    app.include_router(songs.router, prefix="/api")
    app.include_router(lyrics.router, prefix="/api")
    return app


app = create_app()
