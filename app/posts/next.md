---
title: "LLMOps is orchestration"
date: "2024-06-06"
---
The first half of this year has been crazy. I've been working on bringing [prefect 3.0](https://github.com/prefecthq/prefect) into the world. Practically speaking, this has been a lot of `pydantic` 2 compatibility, and grappling with the right level of abstraction to offer around `asyncio` and "normal" python code.

## rediscovering orchestration
At `prefect`, we've been watching the rest of the world rediscover the utility of incrementally adoptable orchestration and observability tools (which happen to be really useful when you're trying to find concrete uses for LLMs in your traditional software stack).

OpenTelemetry in general is a great for isloated traces of your system, yes. Airflow is painful to use in 2024, and it doesn't offer a convincing way to observe and react to the state of your system. Our thesis at `prefect` is that you should be able to use the python ecosystem as you normally would, but in a cloud native and _cloud agnostic_ way, that doesn't interrupt your business logic.

## LLMOps


