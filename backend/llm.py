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


def vision_models() -> list[str]:
    primary = os.getenv("VISION_MODEL", "moonshotai/Kimi-K3")
    fallback = os.getenv("VISION_FALLBACK_MODEL", "google/gemma-3-27b-it")
    return [m for m in (primary, fallback) if m]


def transcribe_image(jpeg_b64: str) -> str:
    """Slide/screenshot → plain text. Tries each vision model in turn."""
    last: Exception | None = None
    for model in vision_models():
        try:
            r = client().chat.completions.create(
                model=model,
                temperature=0,
                max_tokens=1500,
                messages=[{"role": "user", "content": [
                    {"type": "text", "text": "Transcribe all text in this image exactly, preserving numbers. "
                                             "Output only the transcription, no commentary."},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{jpeg_b64}"}},
                ]}],
            )
            text = (r.choices[0].message.content or "").strip()
            if text:
                return text
            # Reasoning models can spend the whole budget thinking and return no content: try the next model.
            last = RuntimeError(f"{model} returned no text")
            log.warning("vision %s returned no text; trying next model", model)
        except Exception as e:
            log.warning("vision %s failed (%s); trying next model", model, e)
            last = e
    raise RuntimeError(f"all vision models failed: {last}")


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
