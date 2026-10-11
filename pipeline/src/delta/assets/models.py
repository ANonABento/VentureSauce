import dagster as dg
from dagster_sqlmesh import SQLMeshContextConfig, SQLMeshResource, sqlmesh_assets

from delta.settings import GATEWAY, SQLMESH_DIR

sqlmesh_config = SQLMeshContextConfig(path=str(SQLMESH_DIR), gateway=GATEWAY)


@sqlmesh_assets(environment="prod", config=sqlmesh_config, name="sqlmesh_models")
def sqlmesh_models(context: dg.AssetExecutionContext, sqlmesh: SQLMeshResource):
    yield from sqlmesh.run(context, config=sqlmesh_config, environment="prod")
