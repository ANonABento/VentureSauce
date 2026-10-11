from sqlmesh.core.config import (
    Config,
    DuckDBConnectionConfig,
    GatewayConfig,
    ModelDefaultsConfig,
    MotherDuckConnectionConfig,
)

from delta import settings
from delta.warehouse import RAW_DDL

settings.DATA_DIR.mkdir(parents=True, exist_ok=True)

config = Config(
    gateways={
        "local": GatewayConfig(connection=DuckDBConnectionConfig(database=str(settings.LOCAL_DATABASE_PATH))),
        "motherduck": GatewayConfig(
            connection=MotherDuckConnectionConfig(database=settings.DATABASE, token=settings.MOTHERDUCK_TOKEN)
        ),
    },
    default_gateway=settings.GATEWAY,
    model_defaults=ModelDefaultsConfig(dialect="duckdb", start="2025-01-01"),
    variables={"universe_size": settings.UNIVERSE_SIZE},
    before_all=[statement.strip() for statement in RAW_DDL.split(";") if statement.strip()],
)
