"""OpenAI-compatible chat client (Nebius by default) with strict JSON output and a model fallback."""

import json
import logging
import os

from openai import OpenAI

log = logging.getLogger(__name__)

_client: OpenAI | None = None


def client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            base_url=os.getenv("LLM_BASE_URL", "https://api.tokenfactory.nebius.com/v1/"),
            api_key=os.environ["LLM_API_KEY"],
            timeout=float(os.getenv("LLM_TIMEOUT_S", "45")),
        )
    return _client


def models() -> list[str]:
    primary = os.getenv("LLM_MODEL", "openai/gpt-oss-120b")
    fallback = os.getenv("LLM_FALLBACK_MODEL", "deepseek-ai/DeepSeek-V4.1-Flash")
    return [m for m in (primary, fallback) if m]


def chat_json(system: str, user: str, schema: dict, name: str) -> dict:
    """Returns the parsed JSON object. Tries each model in turn; raises the last error if all fail."""
    last: Exception | None = None
    for model in models():
        extra = {"reasoning_effort": "low"} if "gpt-oss" in model else {}
        try:
            r = client().chat.completions.create(
                model=model,
                temperature=0,
                messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
                response_format={"type": "json_schema", "json_schema": {"name": name, "schema": schema, "strict": True}},
                **extra,
            )
            return json.loads(r.choices[0].message.content)
        except Exception as e:
            log.warning("LLM %s failed (%s); trying next model", model, e)
            last = e
    raise RuntimeError(f"all LLM models failed: {last}")
