import json
import sqlite3
import threading
import time
from pathlib import Path
from typing import Any

DAY = 24 * 60 * 60


class Cache:
    """Cache chave → JSON em SQLite, com validade por entrada."""

    def __init__(self, path: Path | str, clock=time.time) -> None:
        if str(path) != ":memory:":
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        self._db = sqlite3.connect(str(path), check_same_thread=False)
        self._db.execute(
            "CREATE TABLE IF NOT EXISTS cache "
            "(key TEXT PRIMARY KEY, value TEXT NOT NULL, expires_at REAL NOT NULL)"
        )
        self._lock = threading.Lock()
        self._clock = clock

    def get(self, key: str) -> Any | None:
        with self._lock:
            row = self._db.execute(
                "SELECT value, expires_at FROM cache WHERE key = ?", (key,)
            ).fetchone()
        if row is None or row[1] <= self._clock():
            return None
        return json.loads(row[0])

    def set(self, key: str, value: Any, ttl_s: float) -> None:
        with self._lock:
            self._db.execute(
                "INSERT OR REPLACE INTO cache (key, value, expires_at) VALUES (?, ?, ?)",
                (key, json.dumps(value), self._clock() + ttl_s),
            )
            self._db.commit()

    def close(self) -> None:
        self._db.close()
