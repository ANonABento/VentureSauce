import dagster as dg
from dagster_sqlmesh import SQLMeshResource

from delta.assets import form_d, sqlmesh_models
from delta.automation import ingest_job, nightly_ingest, transform_after_ingest, transform_job
from delta.resources import EdgarResource

defs = dg.Definitions(
    assets=[form_d, sqlmesh_models],
    jobs=[ingest_job, transform_job],
    schedules=[nightly_ingest],
    sensors=[transform_after_ingest],
    resources={"edgar": EdgarResource(), "sqlmesh": SQLMeshResource()},
)
