import dagster as dg

from delta import settings
from delta.edgar import EdgarClient


class EdgarResource(dg.ConfigurableResource):
    user_agent: str = settings.SEC_USER_AGENT
    max_requests_per_second: float = 8

    def client(self) -> EdgarClient:
        return EdgarClient(self.user_agent, self.max_requests_per_second)
