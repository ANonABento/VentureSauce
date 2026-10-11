import hashlib
import json
from pathlib import Path
from typing import Any


class Cache:
    def __init__(self, root: Path):
        self.root = root

    def path(self, key: str) -> Path:
        digest = hashlib.sha1(key.encode()).hexdigest()
        return self.root / digest[:2] / f"{digest}.json"

    def get(self, key: str) -> Any | None:
        path = self.path(key)
        return json.loads(path.read_text())["value"] if path.exists() else None

    def put(self, key: str, value: Any) -> None:
        path = self.path(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        partial = path.with_suffix(".part")
        partial.write_text(json.dumps({"key": key, "value": value}))
        partial.replace(path)
