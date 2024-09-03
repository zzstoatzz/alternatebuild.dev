---
title: "Grug Benchmarks Prefect"
date: "2024-09-02"
---

# Grug want to know truth about cat

<br>

grug hear internet have many cat facts - want cat facts fast, grug brain go purrrrr.

grug scratch head, then idea come. grug try three way to get 23 cat facts:

<br>

-- grug way (`for` loop)
-- fancy way (`asyncio gather`)
-- magic stone way (Prefect `.map`)

<br>

grug use cat fact API because grug like cats. cats smart and worthwhile, not like complexity demon.

<br>

## grug way (`for` loop)

grug start simple. grug know `for` loop. `for` loop like caveman tool, always work:

```python
import httpx
import time

MAX_CAT_FACT_LENGTH = 500

def get_cat_fact(max_length: int) -> str:
    response = httpx.get(f"https://catfact.ninja/fact?max_length={max_length}")
    response.raise_for_status()
    return response.json()["fact"]

def grug_way(n: int = 23):
    start_time = time.time()
    cat_facts = []
    for _ in range(n):
        cat_facts.append(get_cat_fact(MAX_CAT_FACT_LENGTH))
    end_time = time.time()
    return cat_facts, end_time - start_time

if __name__ == "__main__":
    facts, grug_time = grug_way()
    print(f"grug time: {grug_time:.2f} seconds")
    print(f"grug first fact: {facts[0]}")
```

grug run code, see result:

```
grug time: 3.41 seconds
grug first fact: Cats have over 20 muscles that control their ears.
```

grug scratch head. why so slow? if cat have 20 muscles for ear, maybe grug need more muscle for code?

<br>

## fancy way (`asyncio.gather`)

young grug tell grug about `asyncio`. grug suspicious. `asyncio` sound like complexity demon trick. but grug try anyway:

```python
import asyncio
import httpx
import time

MAX_CAT_FACT_LENGTH = 500

async def get_cat_fact(max_length: int) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://catfact.ninja/fact?max_length={max_length}")
        response.raise_for_status()
        return response.json()["fact"]

async def fancy_gather_way(n: int = 23):
    start_time = time.time()
    tasks = [get_cat_fact(MAX_CAT_FACT_LENGTH) for _ in range(n)]
    cat_facts = await asyncio.gather(*tasks)
    end_time = time.time()
    return cat_facts, end_time - start_time

facts, fancy_time = asyncio.run(fancy_gather_way())
print(f"fancy time: {fancy_time:.2f} seconds")
print(f"fancy first fact: {facts[0]}")
```

grug run fancy code, see result:

```
fancy time: 0.61 seconds
fancy first fact: A cat called Dusty has the known record for the most kittens. She had more than 420 kittens in her lifetime.
```

grug impressed with speed. but grug worried. too many new words: `async`, `await`, `gather`. grug smell complexity demon nearby. grug reach for club, just in case.

<br>

## magic stone way (Prefect `.map`)


grug read about `prefect` on r/dataengineering. grug learn `prefect` is tool for making flow of tasks. grug think flow like river, task like rock in river. prefect help flow around rock.

<br>

grug read prefect server can run in whale box:

```base
docker run -d -p 4200:4200 --rm \
    prefecthq/prefect:3.0.0rc20-python3.12 \
    prefect server start --host 0.0.0.0
```

<br>

and grug install special rock tools:


```bash
uv pip install prefect
```

and link grug box to whale box:

```bash
prefect config set PREFECT_API_URL="http://0.0.0.0:4200/api"
```

young grug say `uv` is faster than `pip`. grug like fast.

<br>


grug hear Prefect `.map` can repeat same task many times, like magic stone. grug like magic stone. grug try:

```python
from prefect import flow, task
import httpx
import time

MAX_CAT_FACT_LENGTH = 500

@task
def get_cat_fact(max_length: int) -> str:
    response = httpx.get(f"https://catfact.ninja/fact?max_length={max_length}")
    response.raise_for_status()
    return response.json()["fact"]

@flow
def magic_stone_way(n: int = 23):
    start_time = time.time()
    cat_facts = get_cat_fact.map([MAX_CAT_FACT_LENGTH] * n).result()
    end_time = time.time()
    return cat_facts, end_time - start_time

facts, magic_time = magic_stone_way()
print(f"magic 🗿 time: {magic_time:.2f} seconds")
print(f"magic 🗿 first fact: {facts[0]}")
```

grug run magic stone code, see result:

```
magic stone time: 0.74 seconds
magic stone first fact: Cat bites are more likely to become infected than dog bites.
```

grug happy. magic stone fast like fancy way, but simple like grug way. grug can stalk task in UI.

<br>

when grug open http://localhost:4200, see many task happen at same time:

![grug cat](../assets/grug-run.png)

<br>

grug see many cat facts, all at same time. grug feel is grug king, rule over cat facts.

<br>

## grug learn important things:


<br>

-- grug brain way slow but simple. good for few cat facts, bad for many. like trying catch mouse with bare hands, grug too slow.

<br>

-- fancy way fast but many new words make grug head hurt. like trying catch mouse with complicated trap, catch grug finger instead.

<br>

-- magic 🗿 way (`.map`) fast and simple. grug likes magic 🗿 - like smart cat that catch mouse for grug.

<br>

grug say: when need do same thing many times, try magic `.map` 🗿. magic `.map` 🗿 turn simple code into fast code, no complexity demon smell.


<br>

grug go read cat facts now. maybe learn meow and catch mouse like smart cat.
