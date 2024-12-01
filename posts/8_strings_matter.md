---
title: "strings matter"
date: "2024-11-24"
---

<div class="note-box">
  <div class="note-header">👋 hi</div>
  <div class="note-content">
    i'm on bsky as <a href="https://bsky.app/profile/alternatebuild.dev">n8@alternatebuild.dev</a>
  </div>
</div>


i worked a bit over the weekend on a [contribution](https://github.com/MarshalX/atproto/pull/451) to [Marshalx/atproto](https://github.com/MarshalX/atproto), a python client for [ATProtocol](https://atproto.com/) (the protocol that powers bluesky).

<br>

## the issue

there was an [open issue](https://github.com/MarshalX/atproto/issues/406) to implement validation for various string formats defined in the [at protocol spec](https://atproto.com/specs/lexicon#string-formats):

| format | example | pattern/constraints |
|--------|---------|---------|
| `handle` | `alice.bsky.social` | Domain name: 2+ segments, ASCII alphanumeric/hyphens, 1-63 chars per segment, max 253 total. Last segment no leading digit. |
| `at-uri` | `at://alice.bsky.social/app.bsky.feed.post/3jxtb5w2hkt2m` | `at://` + handle/DID + optional `/collection/rkey`. Max 8KB. No query/fragment in Lexicon. |
| `datetime` | `2024-11-24T06:02:00Z` | ISO 8601/RFC 3339 with required 'T', seconds, timezone (Z/±HH:MM). No -00:00. |
| `nsid` | `app.bsky.feed.post` | 3+ segments: reversed domain (lowercase alphanum+hyphen) + name (letters only). Max 317 chars. |
| `tid` | `3jxtb5w2hkt2m` | 13 chars of [2-7a-z]. First byte's high bit (0x40) must be 0. |
| `record-key` | `3jxtb5w2hkt2m` | 1-512 chars of [A-Za-z0-9._:~-]. "." and ".." forbidden. |
| `uri` | `https://example.com/path` | RFC-3986 URI with letter scheme + netloc/path/query/fragment. Max 8KB, no spaces. |
| `did:plc` | `did:plc:z72i7hdynmk6r22z27h6tvur` | Method identifier must be 24 chars of base32 ([a-z2-7]). Cannot include underscore. |

<div class="note-box">
  <div class="note-header">note (originally Sun Nov 24 2024, updated Sun Dec 1 2024)</div>
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

<br>

I was like, ooh! I know how to do this! bc [i looooove annotated types](https://alternatebuild.dev/posts/6_how_to_use_pydantic_settings)

<br>

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

def maybe_validate_bespoke_format(v: str, info: ValidationInfo) -> str:
    if (
        info and 
        isinstance(info.context, Mapping) and
        info.context.get(PLS_BE_SERIOUS) and
        "lol" in v.lower()
    ):
        raise ValueError("this is serious business")
    return v

class BskyModel(BaseModel):
    handle: Annotated[str, BeforeValidator(maybe_validate_bespoke_format)]

BskyModel.model_validate( # skips validation
    {"handle": "alice.bsky.social"}
)
BskyModel.model_validate( # raises
    {"handle": "lol whatever"},
    context={PLS_BE_SERIOUS: True}
)
```

```python
ValidationError: 1 validation error for BskyModel
handle
  Value error, this is serious business [type=value_error, input_value='lol whatever', input_type=str]
    For further information visit https://errors.pydantic.dev/2.8/v/value_error
```

<br>

See here for some [more realistic](https://github.com/MarshalX/atproto/pull/451/files#diff-2a32a53e86030a7a6860211073303be9944578bb2d13f4558124cc75d0d3081eR44-R136) format validators.


## performance impact (*[obligatory micro-benchmark disclaimer]*)
there's small (but non-zero) [performance cost](https://gist.github.com/zzstoatzz/fd0654593ad3f46af4c31a75550d7dd7?permalink_comment_id=5291350#file-atproto_validators-py-L237-L289) for the mere existence of the annotations:

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
        <span class="text">"🧑‍🚀 🌕 its all just canaries?" "it always has been 👨‍🚀 🔫"</span>
    </div>
    <div class="reason">
        <span class="number">2</span>
        <span class="text">"do I need this?" before you leap</span>
    </div>
</div>

<br>

this is just stream of consciousness, and the [pr](https://github.com/MarshalX/atproto/pull/451) is still up for review so I will update this if more interesting things come up 🙂 - but thanks [@MarshalX](https://github.com/MarshalX) for guidance thus far and for maintaining!

## update (Sun Dec 1 2024)

after some more good [feedback](https://github.com/MarshalX/atproto/pull/451#discussion_r1859107073) from [@MarshalX](https://github.com/MarshalX), I found some interesting nuances in the string format validation:

<div class="reasons-list">
    <div class="reason">
        <span class="number">1</span>
        <span class="text">
            the test cases from <a href="https://github.com/bluesky-social/atproto/tree/main/interop-test-files/syntax">atproto's interop tests</a> revealed edge cases not covered by existing validation:
        </span>
    </div>
</div>

```python
# at-uri examples that should fail:
"a://did:plc:asdf123"    # must start with "at://"
"at:/did:plc:asdf123"    # needs double slash
"at://name"              # handle needs 2+ segments
"at://name.0"           # last segment can't start with number
"at://did:plc:asdf123/12345"  # path must be valid NSID
```

<div class="reasons-list">
    <div class="reason">
        <span class="number">2</span>
        <span class="text">
            some formats have subtle requirements that aren't immediately obvious from the spec. for example, at-uri validation needs to check:
            <br>- strict "at://" prefix
            <br>- handle format in authority section
            <br>- NSID-compliant path segments
        </span>
    </div>
</div>

<div class="reasons-list">
    <div class="reason">
        <span class="number">3</span>
        <span class="text">
            watch out for whitespace! learned this the fun way when <code>.strip()</code>ing test cases:
        </span>
    </div>
</div>

```python
# bad
with open("invalid_datetimes.txt") as f:
    cases = [line.strip() for line in f]  # strips whitespace (that should be preserved to correctly fail)

# good
with open("invalid_datetimes.txt") as f:
    cases = [line.rstrip('\n') for line in f]  # keeps whitespace (correctly fail)
```

<br>

the [PR](https://github.com/MarshalX/atproto/pull/451) is still up for review but I will update again if more interesting things come up 🙂
