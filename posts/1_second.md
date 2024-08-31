---
title: "I wrote some fun code today"
date: "2024-07-09"
---

I open-sourced [some code](https://github.com/PrefectHQ/prefect/pull/14536) to track websocket workers today.

<br>

# we need to keep track of which workers are connected to which tasks at a given time
in a certain kind of SaaS setting, its pretty easy to use redis to track this. however in the open-source server, we can't use redis, so we need to do this in memory.

<br>

```python
TaskKey: TypeAlias = str
WorkerId: TypeAlias = str

class InMemoryTaskWorkerTracker:
    def __init__(self):
        self.workers = {}
        self.task_keys = defaultdict(set)
        self.worker_timestamps = {}
```

This tracker observes workers as they subscribed to task keys and ping the server:

```python
async def observe_worker(
    self, task_keys: list[TaskKey], worker_id: WorkerId
) -> None:
    self.workers[worker_id] = self.workers.get(worker_id, set()) | set(task_keys)
    self.worker_timestamps[worker_id] = time.monotonic()
    for task_key in task_keys:
        self.task_keys[task_key].add(worker_id)
```

When a worker disconnects, we forget about it:

```python
async def forget_worker(self, worker_id: WorkerId) -> None:
    if worker_id in self.workers:
        task_keys = self.workers.pop(worker_id)
        for task_key in task_keys:
            self.task_keys[task_key].discard(worker_id)
            if not self.task_keys[task_key]:
                del self.task_keys[task_key]
    self.worker_timestamps.pop(worker_id, None)
```

Now, we can use this to filter task workers by task keys:

```python
async def get_workers_for_task_keys(
    self,
    task_keys: list[TaskKey],
) -> List[TaskWorkerResponse]:
    if not task_keys:
        return await self.get_all_workers()
    active_workers = set().union(
        *(self.task_keys[key] for key in task_keys)
    )
    return [self._create_worker_response(worker_id) for worker_id in active_workers]
```

and then expose an endpoint to allow clients to do this:


```python
@router.post("/filter")
async def read_task_workers(
    task_worker_filter: Optional[TaskWorkerFilter] = Body(None)
):
    if task_worker_filter and task_worker_filter.task_keys:
        return await models.task_workers.get_workers_for_task_keys(
            task_keys=task_worker_filter.task_keys
        )
    else:
        return await models.task_workers.get_all_workers()
```

<br>
