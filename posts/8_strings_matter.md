---
title: "telling strings that they matter"
date: "2024-11-24"
---

i worked over the weekend on a [contribution](https://github.com/MarshalX/atproto/pull/451) to [marshalx/atproto](https://github.com/MarshalX/atproto), a python client for the at protocol (the protocol that powers bluesky).

<br>

## the issue

there was an [open issue](https://github.com/MarshalX/atproto/issues/406) to implement validation for various string formats defined in the [at protocol spec](https://atproto.com/specs/lexicon#string-formats):

| format | example | pattern |
|--------|---------|---------|
| [`did`](https://github.com/did-method-plc/did-method-plc) | `did:plc:z72i7hdynmk6r22z27h6tvur` | `did:[method]:[identifier]` |
| `handle` | `alice.bsky.social` | `[user].[domain].[tld]` |
| `at-uri` | `at://alice.bsky.social/app.bsky.feed.post/3jxtb5w2hkt2m` | `at://[authority]/[collection]/[record]` |
| `datetime` | `2024-11-24T06:02:00Z` | ISO 8601 with timezone |
| `nsid` | `app.bsky.feed.post` | `[service].[provider].[name]` |
| `tid` | `3jxtb5w2hkt2m` | 13 chars of [a-z2-7] |
| `cid` | `bafyreia3tbsfxe3cc75xrxyyn6qc42oupi7g7zfhqimj7w5` | content identifier (..?) |
| `uri` | `https://example.com/path` | standard uri format |

<div class="note-box">
  <div class="note-header">📝 note (as of Sun Nov 24 2024)</div>
  <div class="note-content">
    this is my current understanding of the formats
  </div>
</div>

<style>
/* base table styles */
table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5em 0;
    background: rgba(30, 30, 40, 0.6);
    border-radius: 8px;
}

th {
    background: rgba(40, 40, 50, 0.8);
    color: #64e3ff;
    font-weight: 600;
    text-align: left;
    padding: 12px;
}

td {
    padding: 12px;
    border: 1px solid rgba(100, 227, 255, 0.1);
    text-align: left;
}

td:nth-child(2) {
    font-family: monospace;
    color: #98ff98;
}

td:nth-child(3) {
    color: #ffd700;
}

/* code blocks */
code {
    background: rgba(50, 50, 60, 0.5);
    padding: 2px 6px;
    border-radius: 4px;
}

/* note box */
.note-box {
    background: rgba(30, 30, 40, 0.8);
    border-left: 4px solid #64e3ff;
    border-radius: 4px;
    margin: 2em 0;
    padding: 1.2em;
    backdrop-filter: blur(5px);
}

.note-header {
    color: #64e3ff;
    font-weight: 600;
    margin-bottom: 0.8em;
}

.note-content {
    color: #e1e1e1;
    line-height: 1.6;
}

/* reasons list */
.reasons-list {
    background: rgba(30, 30, 40, 0.6);
    border-radius: 8px;
    padding: 1.2em;
    margin: 1.5em 0;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
}

.reason {
    display: flex;
    align-items: center;
    margin: 0.8em 0;
    padding: 0.5em;
}

.number {
    color: #64e3ff;
    font-weight: bold;
    margin-right: 1.2em;
    min-width: 1.5em;
    text-align: center;
}

.text {
    color: #98ff98;
    flex: 1;
}

/* general spacing */
br {
    margin: 1.5em 0;
}

h2 {
    margin-top: 2em;
    margin-bottom: 1em;
}
</style>

since this validation gets generated into all the model classes, [@MarshalX](https://github.com/MarshalX) wisely [asked me to make it optional](https://github.com/MarshalX/atproto/issues/406#issuecomment-2485780481), which made sense for two familiar reasons:

<div class="reasons-list">
    <div class="reason">
        <span class="number">1</span>
        <span class="text">derisk the happy path</span>
    </div>
    <div class="reason">
        <span class="number">2</span>
        <span class="text">lure early adopters with goodies</span>
    </div>
</div>

<br>

## the main idea

i used pydantic's [validation context](https://docs.pydantic.dev/2.9/concepts/validators/#validation-context) to allow opt-in validation:

```python
from pydantic import BaseModel, BeforeValidator, ValidationInfo
from typing import Annotated, Literal, Mapping

PLS_BE_SERIOUS: Literal["i am being so serious rn"] = "i am being so serious rn"

def contextually_validate(validate_fn):
    def wrapper(v: str, info: ValidationInfo) -> str:
        if (
            info and
            isinstance(info.context, Mapping) and
            info.context.get(PLS_BE_SERIOUS)
        ):
            return validate_fn(v, info)
        return v
    return wrapper

@contextually_validate
def assert_bespoke_requirement(v, info) -> str:
    if "lol" in v.lower():
        raise ValueError("this is serious business")
    return v

class Message(BaseModel):
    content: Annotated[str, BeforeValidator(assert_bespoke_requirement)]

Message(content="lol whatever")
Message.model_validate( # raises
    {"content": "lol whatever"},
    context={"i am being so serious rn": True}
)
```

```python
ValidationError: 1 validation error for Message
content
  Value error, this is serious business [type=value_error, input_value='lol whatever', input_type=str]
    For further information visit https://errors.pydantic.dev/2.8/v/value_error
```

<br>

## performance impact (*[obligatory micro-benchmark disclaimer]*)
there's small (but non-zero) performance cost to the mere existence of the annotations:

| test type                     | items   | time (seconds) | items/second |
| ---------------------------- | ------- | -------------- | ------------ |
| raw dictionaries             | 100,000 | 0.40           | 247,971      |
| skipped validation (default) | 100,000 | 0.57           | 176,242      |
| opted-in to strict validation| 100,000 | 1.00           | 99,908       |

<style>
table {
    width: 100%;
    border-collapse: collapse;
}
th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}
th {
    background-color: #f9f9f9;
}
tr:nth-child(even) {
    background-color: #333641;
    opacity: 0.9;
}
</style>

<br>

## testing

we used the official [atproto interop test files](https://github.com/bluesky-social/atproto/tree/main/interop-test-files/syntax) for test data, which provide valid and invalid examples for each string format.

<br>

## key takeaways

<div class="reasons-list">
    <div class="reason">
        <span class="number">1</span>
        <span class="text">"🧑‍🚀 🌕 its all just canaries? it always has been 👨‍🚀 🔫"</span>
    </div>
    <div class="reason">
        <span class="number">2</span>
        <span class="text">"do I need this?" before you leap</span>
    </div>
</div>

<br>

this is just stream of consciousness, and the [pr](https://github.com/MarshalX/atproto/pull/451) is still up for review so I will update this if more interesting things come up 🙂 - but thanks [@MarshalX](https://github.com/MarshalX) for guidance thus far and for maintaining!
