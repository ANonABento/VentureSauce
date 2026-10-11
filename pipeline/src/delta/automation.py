import dagster as dg

from delta.assets import daily, form_d, sqlmesh_models

ingest_job = dg.define_asset_job("ingest_form_d", selection=[form_d], partitions_def=daily)
transform_job = dg.define_asset_job("transform", selection=[sqlmesh_models])

nightly_ingest = dg.build_schedule_from_partitioned_job(ingest_job, hour_of_day=23, minute_of_hour=30)


@dg.run_status_sensor(
    run_status=dg.DagsterRunStatus.SUCCESS,
    monitored_jobs=[ingest_job],
    request_job=transform_job,
)
def transform_after_ingest(context: dg.RunStatusSensorContext) -> dg.RunRequest:
    return dg.RunRequest(run_key=context.dagster_run.run_id)
