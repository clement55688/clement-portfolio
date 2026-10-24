from pathlib import Path
from textwrap import dedent

ROOT = Path(r"C:\Users\Clement\Documents\ChatGPT\benchling-python-practice")


def write(path: str, content: str) -> None:
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(dedent(content).lstrip(), encoding="utf-8")


write("README.md", r'''
# Benchling Python interview practice: Tasks 7-14

Eight independent, 45-60 minute Python exercises for Clement's first-stage Benchling technical interview on **Monday, October 12, 2026 at 1:00 PM PDT**.

These are original practice problems, not leaked or official Benchling questions. They are shaped by Benchling's candidate guide, the current role description, and public candidate reports. The strongest repeated signals are practical problem solving, ordinary data structures, readable and extensible code, debugging, and explaining decisions while collaborating.

## Start here

Python 3.11+ is enough; there are no third-party dependencies.

```powershell
python run_task.py 7
python run_task.py 8
python verify_solutions.py
```

Each task has:

- `prompt.md`: requirements, examples, extensions, and discussion prompts.
- `starter.py`: the file to edit.
- `test_task.py`: visible acceptance tests.
- `solution.py`: a reference solution for review after the timer ends.

`run_task.py` runs the starter tests. Failures are expected until you implement the task. `verify_solutions.py` confirms all reference solutions pass.

## Recommended order

| Task | Exercise | Main signal | Target |
|---|---|---|---:|
| 07 | Traffic controller | State machine, invariants | 45 min |
| 08 | Gene segment chains | Sorting, interval merging | 45 min |
| 09 | Expiring LRU cache | Data structures, edge cases | 60 min |
| 10 | JSON schema validator | Recursion, interface design | 60 min |
| 11 | Search engine repair | Debugging, extension | 50 min |
| 12 | Versioned lab notebook | Data modeling, immutability | 55 min |
| 13 | Experiment scheduler | Graphs, deterministic output | 50 min |
| 14 | Microplate allocator | Constraints, backtracking | 60 min |

Prioritize **07, 09, 10, and 11** before Monday. Then do 08 and 13. Tasks 12 and 14 prepare for later architecture and data-modeling rounds.

## Interview simulation rules

1. Use a blank editor or CoderPad-style single file.
2. No AI during a timed attempt. Benchling explicitly prohibits it in the interview.
3. Internet syntax lookup is allowed by Benchling, but first try Python's built-in `help()` and the standard library docs.
4. Spend the first 5 minutes restating requirements and testing examples aloud.
5. Write a correct baseline before optimizing.
6. Test empty input, duplicates, invalid input, and one adversarial case.
7. End by explaining complexity, tradeoffs, and the next extension.

See [INTERVIEW_RUNBOOK.md](INTERVIEW_RUNBOOK.md) for a minute-by-minute routine and [COMPANY_RESEARCH.md](COMPANY_RESEARCH.md) for the evidence behind this set.
''')

write("COMPANY_RESEARCH.md", r'''
# Benchling interview research

Checked October 7, 2026.

## What Benchling told you directly

- Stage 1 is a one-hour Zoom with an engineer using CoderPad.
- Expect to brainstorm and code a working solution using everyday data structures.
- They evaluate readable, maintainable code and want to hear decisions and alternatives.
- They allow normal internet lookup and expect you to debug, but prohibit LLM use during interviews.
- Later rounds include debugging and extending existing code, data modeling, and extensible architecture.

## Current role signals

The Full Stack, Developer Productivity role emphasizes end-to-end ownership, frontend frameworks and architecture, testing and release tooling, product thinking, iteration on feedback, and experience with Node or Python. Benchling describes its product as a platform for structured scientific data and scientific workflows.

## Public candidate reports: useful, but unverified

Public reports describe practical exercises rather than only standard algorithm puzzles. Examples mentioned online include a traffic state machine, cache eviction, contiguous gene segments, debugging and extending a search system, and validating JSON against a schema without third-party packages. Treat these as directional signals, not promises of your exact question.

## Sources

- Benchling candidate guide supplied by the recruiter.
- Current role: https://jobs.ashbyhq.com/benchling/53bb40c8-3e10-4a9d-9d47-017292ab7d20
- Benchling Developer Platform: https://docs.benchling.com/docs/developer-platform-overview
- Recent Glassdoor reports: https://www.glassdoor.com/Interview/Benchling-Interview-Questions-E1291069.htm
- Public onsite report: https://leetcode.com/discuss/post/7427370/
- Older public coding-round report: https://www.jointaro.com/interviews/companies/benchling/experiences/software-engineer-united-states-april-1-2022-no-offer-positive-9fad697f/
''')

write("INTERVIEW_RUNBOOK.md", r'''
# One-hour technical interview runbook

## 0-5 minutes: align

- Restate the input, output, invalid-input behavior, and mutation rules.
- Ask which requirements are essential and which are extensions.
- Walk through one normal example and one edge case.

Useful wording: "I'll start with a small correct interface, then add the extension without changing callers."

## 5-10 minutes: choose the model

- Name the core data structure and why it fits.
- State one simpler alternative and why you are not starting there.
- Write function signatures and one tiny test/example.

## 10-40 minutes: implement vertically

- Make one end-to-end path work.
- Keep parsing, state changes, and formatting separate.
- Use descriptive names and small helpers.
- Pause after meaningful steps to summarize what now works.

## 40-52 minutes: test and debug

- Run normal, empty, duplicate/tie, invalid, and boundary cases.
- When a test fails: state expected vs. actual, isolate the smallest failing input, then change one thing.

## 52-60 minutes: close strongly

- Give time and space complexity.
- Identify the most important invariant.
- Explain one design tradeoff and one next extension.
- If unfinished, describe the exact remaining steps and risks.

## Python reminders

- Prefer `dict`, `set`, `list`, `deque`, `heapq`, `defaultdict`, and `OrderedDict` when they express the model clearly.
- Avoid third-party packages; CoderPad availability can be limited.
- Pass clocks/timestamps into time-sensitive code so tests stay deterministic.
- Return deterministic ordering even when dictionaries or sets are involved.
''')

write("run_task.py", r'''
import argparse
import os
import subprocess
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("task", type=int, choices=range(7, 15))
    parser.add_argument("--solution", action="store_true")
    args = parser.parse_args()
    root = Path(__file__).parent
    matches = sorted((root / "tasks").glob(f"task_{args.task:02d}_*"))
    if len(matches) != 1:
        raise SystemExit(f"Expected one directory for task {args.task}; found {len(matches)}")
    env = os.environ.copy()
    env["BENCHLING_IMPL"] = "solution" if args.solution else "starter"
    return subprocess.call(
        [sys.executable, "-m", "unittest", "discover", "-s", str(matches[0]), "-t", str(root), "-v"],
        cwd=root,
        env=env,
    )


if __name__ == "__main__":
    raise SystemExit(main())
''')

write("verify_solutions.py", r'''
import subprocess
import sys
from pathlib import Path

root = Path(__file__).parent
for task in range(7, 15):
    result = subprocess.run([sys.executable, "run_task.py", str(task), "--solution"], cwd=root)
    if result.returncode:
        raise SystemExit(result.returncode)
print("All reference solutions pass.")
''')

write("tasks/__init__.py", "")

tasks = {}

tasks["task_07_traffic_controller"] = {
"prompt.md": r'''
# Task 07 - Traffic controller state machine

Implement `TrafficController` for an intersection. It begins in `RED`.

- `timer`: `RED -> GREEN -> YELLOW -> RED`.
- `pedestrian`: record a pending pedestrian request; do not change color immediately.
- A pending request is served when `GREEN` receives `timer`: transition to `YELLOW` and increment `served_pedestrians`.
- `emergency`: immediately enter `RED` and emergency mode. Repeated emergency events are idempotent.
- While in emergency mode, `timer` and `pedestrian` do not change normal state; pedestrian requests remain pending.
- `clear`: leave emergency mode in `RED`. Calling it outside emergency mode raises `ValueError`.
- Any unknown event raises `ValueError`.

`snapshot()` returns a new dictionary with `color`, `emergency`, `pedestrian_pending`, and `served_pedestrians`.

Extension discussion: how would you support multiple intersections without making invalid transitions possible?
''',
"starter.py": r'''
class TrafficController:
    def __init__(self):
        self.color = "RED"
        self.emergency = False
        self.pedestrian_pending = False
        self.served_pedestrians = 0

    def handle(self, event: str) -> dict:
        raise NotImplementedError

    def snapshot(self) -> dict:
        raise NotImplementedError
''',
"solution.py": r'''
class TrafficController:
    def __init__(self):
        self.color = "RED"
        self.emergency = False
        self.pedestrian_pending = False
        self.served_pedestrians = 0

    def handle(self, event: str) -> dict:
        if event not in {"timer", "pedestrian", "emergency", "clear"}:
            raise ValueError(f"unknown event: {event}")
        if event == "emergency":
            self.emergency = True
            self.color = "RED"
        elif event == "clear":
            if not self.emergency:
                raise ValueError("cannot clear when emergency mode is inactive")
            self.emergency = False
            self.color = "RED"
        elif self.emergency:
            pass
        elif event == "pedestrian":
            self.pedestrian_pending = True
        elif self.color == "RED":
            self.color = "GREEN"
        elif self.color == "GREEN":
            self.color = "YELLOW"
            if self.pedestrian_pending:
                self.pedestrian_pending = False
                self.served_pedestrians += 1
        else:
            self.color = "RED"
        return self.snapshot()

    def snapshot(self) -> dict:
        return {
            "color": self.color,
            "emergency": self.emergency,
            "pedestrian_pending": self.pedestrian_pending,
            "served_pedestrians": self.served_pedestrians,
        }
''',
"test_task.py": r'''
import os, unittest
if os.getenv("BENCHLING_IMPL") == "solution":
    from tasks.task_07_traffic_controller.solution import TrafficController
else:
    from tasks.task_07_traffic_controller.starter import TrafficController

class Tests(unittest.TestCase):
    def test_normal_cycle_and_snapshot_copy(self):
        c = TrafficController()
        self.assertEqual(c.handle("timer")["color"], "GREEN")
        self.assertEqual(c.handle("timer")["color"], "YELLOW")
        self.assertEqual(c.handle("timer")["color"], "RED")
        snap = c.snapshot(); snap["color"] = "BROKEN"
        self.assertEqual(c.snapshot()["color"], "RED")

    def test_pedestrian_and_emergency(self):
        c = TrafficController(); c.handle("timer"); c.handle("pedestrian")
        self.assertTrue(c.snapshot()["pedestrian_pending"])
        c.handle("emergency"); c.handle("timer")
        self.assertEqual(c.snapshot()["color"], "RED")
        self.assertTrue(c.snapshot()["pedestrian_pending"])
        c.handle("clear"); c.handle("timer"); c.handle("timer")
        self.assertEqual(c.snapshot()["served_pedestrians"], 1)

    def test_invalid_events(self):
        c = TrafficController()
        with self.assertRaises(ValueError): c.handle("clear")
        with self.assertRaises(ValueError): c.handle("dance")

if __name__ == "__main__": unittest.main()
'''}

tasks["task_08_gene_chains"] = {
"prompt.md": r'''
# Task 08 - Longest contiguous gene chain

`longest_gene_chains(segments)` receives `(gene, start, end)` tuples with inclusive coordinates. Validate non-empty gene names, integer coordinates, and `start <= end`.

For each gene, merge intervals that overlap or touch (`next_start <= current_end + 1`). Return that gene's longest merged chain as `(gene, start, end, piece_count)`. Length is `end - start + 1`; break equal-length ties by earlier start, then earlier end. Sort results by gene name. Empty input returns `[]`.

Do not mutate the input. State your complexity before coding.
''',
"starter.py": r'''
def longest_gene_chains(segments):
    raise NotImplementedError
''',
"solution.py": r'''
from collections import defaultdict

def longest_gene_chains(segments):
    grouped = defaultdict(list)
    for item in segments:
        if not isinstance(item, (tuple, list)) or len(item) != 3:
            raise ValueError("each segment must contain gene, start, end")
        gene, start, end = item
        if not isinstance(gene, str) or not gene.strip():
            raise ValueError("gene must be non-empty")
        if type(start) is not int or type(end) is not int or start > end:
            raise ValueError("invalid coordinates")
        grouped[gene].append((start, end))
    answer = []
    for gene in sorted(grouped):
        merged = []
        for start, end in sorted(grouped[gene]):
            if merged and start <= merged[-1][1] + 1:
                old_start, old_end, count = merged[-1]
                merged[-1] = (old_start, max(old_end, end), count + 1)
            else:
                merged.append((start, end, 1))
        start, end, count = min(merged, key=lambda x: (-(x[1]-x[0]+1), x[0], x[1]))
        answer.append((gene, start, end, count))
    return answer
''',
"test_task.py": r'''
import os, unittest
module = "solution" if os.getenv("BENCHLING_IMPL") == "solution" else "starter"
if module == "solution": from tasks.task_08_gene_chains.solution import longest_gene_chains
else: from tasks.task_08_gene_chains.starter import longest_gene_chains

class Tests(unittest.TestCase):
    def test_merge_and_choose(self):
        data = [("B", 8, 9), ("A", 5, 7), ("A", 1, 2), ("A", 3, 4), ("B", 1, 2)]
        original = list(data)
        self.assertEqual(longest_gene_chains(data), [("A",1,7,3),("B",8,9,1)])
        self.assertEqual(data, original)
    def test_overlap_and_tie(self):
        self.assertEqual(longest_gene_chains([("G",10,12),("G",11,15),("G",1,6)]), [("G",1,6,1)])
    def test_empty_and_invalid(self):
        self.assertEqual(longest_gene_chains([]), [])
        for bad in [[("",1,2)], [("A",3,2)], [("A",True,2)], [("A",1)]]:
            with self.assertRaises(ValueError): longest_gene_chains(bad)
if __name__ == "__main__": unittest.main()
'''}

tasks["task_09_expiring_lru"] = {
"prompt.md": r'''
# Task 09 - Expiring LRU cache

Implement `ExpiringLRUCache(capacity)` with `put(key, value, ttl, now)`, `get(key, now)`, `delete(key)`, and `keys(now)`.

- Capacity must be a positive integer; TTL must be positive.
- An item is expired when `now >= expires_at`.
- `get` returns `None` for missing/expired keys. A successful get makes the key most recently used.
- `put` replaces an existing key and makes it most recent. Before enforcing capacity, purge all expired entries. Then evict least recently used live entries.
- `keys` purges expired entries and returns keys from least to most recently used.
- Passing time backwards relative to the last public operation raises `ValueError`.

Aim for O(1) average `get` and `put`, excluding the cost of purging expired entries.
''',
"starter.py": r'''
class ExpiringLRUCache:
    def __init__(self, capacity: int):
        raise NotImplementedError
    def put(self, key, value, ttl: float, now: float) -> None:
        raise NotImplementedError
    def get(self, key, now: float):
        raise NotImplementedError
    def delete(self, key) -> bool:
        raise NotImplementedError
    def keys(self, now: float) -> list:
        raise NotImplementedError
''',
"solution.py": r'''
from collections import OrderedDict

class ExpiringLRUCache:
    def __init__(self, capacity: int):
        if type(capacity) is not int or capacity <= 0: raise ValueError("capacity must be positive")
        self.capacity = capacity
        self._items = OrderedDict()
        self._last_now = None
    def _advance(self, now):
        if self._last_now is not None and now < self._last_now: raise ValueError("time cannot move backwards")
        self._last_now = now
    def _purge(self, now):
        for key in [k for k, (_, expiry) in self._items.items() if now >= expiry]:
            del self._items[key]
    def put(self, key, value, ttl: float, now: float) -> None:
        self._advance(now)
        if ttl <= 0: raise ValueError("ttl must be positive")
        self._purge(now)
        self._items.pop(key, None)
        self._items[key] = (value, now + ttl)
        while len(self._items) > self.capacity: self._items.popitem(last=False)
    def get(self, key, now: float):
        self._advance(now); self._purge(now)
        if key not in self._items: return None
        value, expiry = self._items.pop(key); self._items[key] = (value, expiry)
        return value
    def delete(self, key) -> bool:
        return self._items.pop(key, None) is not None
    def keys(self, now: float) -> list:
        self._advance(now); self._purge(now); return list(self._items)
''',
"test_task.py": r'''
import os, unittest
if os.getenv("BENCHLING_IMPL") == "solution": from tasks.task_09_expiring_lru.solution import ExpiringLRUCache
else: from tasks.task_09_expiring_lru.starter import ExpiringLRUCache

class Tests(unittest.TestCase):
    def test_lru_and_replacement(self):
        c=ExpiringLRUCache(2); c.put("a",1,10,0); c.put("b",2,10,1)
        self.assertEqual(c.get("a",2),1); c.put("c",3,10,3)
        self.assertIsNone(c.get("b",4)); self.assertEqual(c.keys(4),["a","c"])
        c.put("a",9,10,5); self.assertEqual(c.keys(5),["c","a"])
    def test_expiry_and_capacity(self):
        c=ExpiringLRUCache(1); c.put("a",1,2,0); self.assertIsNone(c.get("a",2))
        c.put("b",2,1,3); c.put("c",3,2,4); self.assertEqual(c.keys(4),["c"])
    def test_validation_and_delete(self):
        with self.assertRaises(ValueError): ExpiringLRUCache(0)
        c=ExpiringLRUCache(1)
        with self.assertRaises(ValueError): c.put("x",1,0,0)
        c.put("x",1,1,1)
        with self.assertRaises(ValueError): c.get("x",0)
        self.assertTrue(c.delete("x")); self.assertFalse(c.delete("x"))
if __name__ == "__main__": unittest.main()
'''}

tasks["task_10_json_validator"] = {
"prompt.md": r'''
# Task 10 - Dependency-free JSON schema validator

Implement `validate(value, schema) -> list[str]`. Return deterministic error strings; do not raise for invalid data.

Supported schema keys:

- `type`: `object`, `array`, `string`, `integer`, `number`, or `boolean`.
- Objects: `properties`, `required`, and `additionalProperties` (default `True`).
- Arrays: `items`, `minItems`, and `maxItems`.
- Strings: `minLength` and `maxLength`.

Paths use `$`, `$.name`, and `$[0]`. Report type errors as `PATH: expected TYPE`; required fields as `PATH: required`; unexpected fields as `PATH: unexpected`; and length errors as `PATH: too short` / `too long` / `too few items` / `too many items`.

Do not treat booleans as integers or numbers. Sort object keys when traversing so output is deterministic.
''',
"starter.py": r'''
def validate(value, schema) -> list[str]:
    raise NotImplementedError
''',
"solution.py": r'''
def validate(value, schema) -> list[str]:
    errors = []
    def walk(v, s, path):
        typ = s.get("type")
        checks = {
            "object": lambda x: isinstance(x, dict),
            "array": lambda x: isinstance(x, list),
            "string": lambda x: isinstance(x, str),
            "integer": lambda x: type(x) is int,
            "number": lambda x: type(x) in (int, float),
            "boolean": lambda x: type(x) is bool,
        }
        if typ not in checks: raise ValueError(f"unsupported schema type: {typ}")
        if not checks[typ](v): errors.append(f"{path}: expected {typ}"); return
        if typ == "object":
            props = s.get("properties", {})
            for name in sorted(s.get("required", [])):
                if name not in v: errors.append(f"{path}.{name}: required")
            for name in sorted(v):
                child = f"{path}.{name}"
                if name in props: walk(v[name], props[name], child)
                elif s.get("additionalProperties", True) is False: errors.append(f"{child}: unexpected")
        elif typ == "array":
            if len(v) < s.get("minItems", 0): errors.append(f"{path}: too few items")
            if "maxItems" in s and len(v) > s["maxItems"]: errors.append(f"{path}: too many items")
            if "items" in s:
                for i, item in enumerate(v): walk(item, s["items"], f"{path}[{i}]")
        elif typ == "string":
            if len(v) < s.get("minLength", 0): errors.append(f"{path}: too short")
            if "maxLength" in s and len(v) > s["maxLength"]: errors.append(f"{path}: too long")
    walk(value, schema, "$")
    return errors
''',
"test_task.py": r'''
import os, unittest
if os.getenv("BENCHLING_IMPL") == "solution": from tasks.task_10_json_validator.solution import validate
else: from tasks.task_10_json_validator.starter import validate

SCHEMA={"type":"object","required":["name","samples"],"additionalProperties":False,"properties":{
"name":{"type":"string","minLength":2},"samples":{"type":"array","minItems":1,"items":{"type":"object","required":["id"],"properties":{"id":{"type":"integer"}}}}}}
class Tests(unittest.TestCase):
    def test_valid(self): self.assertEqual(validate({"name":"Run","samples":[{"id":1}]},SCHEMA),[])
    def test_nested_errors_deterministic(self):
        self.assertEqual(validate({"extra":1,"name":"R","samples":[{"id":True},{}]},SCHEMA),[
            "$.extra: unexpected","$.name: too short","$.samples[0].id: expected integer","$.samples[1].id: required"])
    def test_type_short_circuit(self):
        self.assertEqual(validate([],SCHEMA),["$: expected object"])
    def test_bad_schema(self):
        with self.assertRaises(ValueError): validate(1,{"type":"mystery"})
if __name__ == "__main__": unittest.main()
'''}

tasks["task_11_search_repair"] = {
"prompt.md": r'''
# Task 11 - Debug and extend a search engine

The starter contains bugs. Repair it and add field filters.

`SearchIndex.search(query)` accepts space-separated tokens. Plain tokens are case-insensitive substring matches against `title` or `body`. Tokens shaped like `field:value` filter exact, case-insensitive equality for `type` and `owner`. All tokens use AND semantics. Return matching IDs in input order. Repeated spaces are ignored; a blank query returns every ID.

Unknown filter fields raise `ValueError`. Documents must have unique `id`, plus string `title`, `body`, `type`, and `owner` fields; validate them in the constructor. Do not mutate documents.
''',
"starter.py": r'''
class SearchIndex:
    def __init__(self, documents):
        self.documents = documents

    def search(self, query):
        tokens = query.lower().split(" ")
        results = []
        for doc in self.documents:
            text = doc["title"].lower()
            if any(token in text for token in tokens):
                results.append(doc["id"])
        return sorted(results)
''',
"solution.py": r'''
class SearchIndex:
    REQUIRED = ("id","title","body","type","owner")
    FILTERS = {"type","owner"}
    def __init__(self, documents):
        self.documents=[]; seen=set()
        for doc in documents:
            if not isinstance(doc, dict) or any(k not in doc for k in self.REQUIRED): raise ValueError("invalid document")
            if doc["id"] in seen: raise ValueError("duplicate id")
            if any(not isinstance(doc[k], str) for k in ("title","body","type","owner")): raise ValueError("text fields must be strings")
            seen.add(doc["id"]); self.documents.append(dict(doc))
    def search(self, query):
        tokens=query.casefold().split(); parsed=[]
        for token in tokens:
            if ":" in token:
                field,value=token.split(":",1)
                if field not in self.FILTERS: raise ValueError(f"unknown filter: {field}")
                parsed.append((field,value))
            else: parsed.append((None,token))
        answer=[]
        for doc in self.documents:
            haystack=(doc["title"]+" "+doc["body"]).casefold()
            if all((str(doc[field]).casefold()==value if field else value in haystack) for field,value in parsed): answer.append(doc["id"])
        return answer
''',
"test_task.py": r'''
import os, unittest
if os.getenv("BENCHLING_IMPL") == "solution": from tasks.task_11_search_repair.solution import SearchIndex
else: from tasks.task_11_search_repair.starter import SearchIndex
DOCS=[{"id":"b","title":"Protein Run","body":"alpha beta","type":"experiment","owner":"Ada"},{"id":"a","title":"Alpha Notes","body":"protein","type":"note","owner":"Ben"},{"id":"c","title":"Control","body":"alpha protein","type":"experiment","owner":"Ada"}]
class Tests(unittest.TestCase):
    def test_and_semantics_and_input_order(self):
        s=SearchIndex(DOCS); self.assertEqual(s.search("alpha protein"),["b","a","c"])
    def test_filters(self):
        s=SearchIndex(DOCS); self.assertEqual(s.search("protein type:experiment owner:ada"),["b","c"])
        self.assertEqual(s.search("   "),["b","a","c"])
        with self.assertRaises(ValueError): s.search("color:red")
    def test_validation_and_copy(self):
        with self.assertRaises(ValueError): SearchIndex(DOCS+[dict(DOCS[0])])
        source=[dict(DOCS[0])]; s=SearchIndex(source); source[0]["title"]="changed"
        self.assertEqual(s.search("protein"),["b"])
if __name__ == "__main__": unittest.main()
'''}

tasks["task_12_versioned_notebook"] = {
"prompt.md": r'''
# Task 12 - Versioned lab notebook

Implement an in-memory `NotebookStore`.

- `create(entry_id, fields)` creates version 1; duplicate IDs raise `ValueError`.
- `update(entry_id, changes)` creates a new version by shallow-merging fields. The prior version must remain unchanged.
- `get(entry_id, version=None)` returns a defensive copy of the latest or requested version.
- `history(entry_id)` returns version numbers in ascending order.
- `revert(entry_id, version)` creates a new latest version whose content equals the requested old version.
- Missing IDs or versions raise `KeyError`. Entry IDs must be non-empty strings and fields/changes must be dictionaries.

Never expose internal mutable dictionaries.
''',
"starter.py": r'''
class NotebookStore:
    def __init__(self): raise NotImplementedError
    def create(self, entry_id, fields): raise NotImplementedError
    def update(self, entry_id, changes): raise NotImplementedError
    def get(self, entry_id, version=None): raise NotImplementedError
    def history(self, entry_id): raise NotImplementedError
    def revert(self, entry_id, version): raise NotImplementedError
''',
"solution.py": r'''
from copy import deepcopy
class NotebookStore:
    def __init__(self): self._entries={}
    def _valid(self, entry_id, fields):
        if not isinstance(entry_id,str) or not entry_id.strip(): raise ValueError("invalid entry id")
        if not isinstance(fields,dict): raise ValueError("fields must be a dictionary")
    def create(self, entry_id, fields):
        self._valid(entry_id,fields)
        if entry_id in self._entries: raise ValueError("duplicate entry")
        self._entries[entry_id]=[deepcopy(fields)]; return 1
    def _versions(self, entry_id):
        if entry_id not in self._entries: raise KeyError(entry_id)
        return self._entries[entry_id]
    def update(self, entry_id, changes):
        self._valid(entry_id,changes); versions=self._versions(entry_id)
        value=deepcopy(versions[-1]); value.update(deepcopy(changes)); versions.append(value); return len(versions)
    def get(self, entry_id, version=None):
        versions=self._versions(entry_id); version=len(versions) if version is None else version
        if type(version) is not int or version < 1 or version > len(versions): raise KeyError(version)
        return deepcopy(versions[version-1])
    def history(self, entry_id): return list(range(1,len(self._versions(entry_id))+1))
    def revert(self, entry_id, version):
        value=self.get(entry_id,version); self._entries[entry_id].append(value); return len(self._entries[entry_id])
''',
"test_task.py": r'''
import os, unittest
if os.getenv("BENCHLING_IMPL") == "solution": from tasks.task_12_versioned_notebook.solution import NotebookStore
else: from tasks.task_12_versioned_notebook.starter import NotebookStore
class Tests(unittest.TestCase):
    def test_versions_and_revert(self):
        s=NotebookStore(); self.assertEqual(s.create("e",{"status":"draft","tags":["a"]}),1)
        self.assertEqual(s.update("e",{"status":"done"}),2); self.assertEqual(s.get("e",1)["status"],"draft")
        self.assertEqual(s.revert("e",1),3); self.assertEqual(s.get("e")["status"],"draft"); self.assertEqual(s.history("e"),[1,2,3])
    def test_defensive_copy(self):
        s=NotebookStore(); data={"nested":{"x":1}}; s.create("e",data); data["nested"]["x"]=9
        got=s.get("e"); got["nested"]["x"]=7; self.assertEqual(s.get("e")["nested"]["x"],1)
    def test_errors(self):
        s=NotebookStore()
        with self.assertRaises(ValueError): s.create("",{})
        with self.assertRaises(KeyError): s.get("missing")
if __name__ == "__main__": unittest.main()
'''}

tasks["task_13_experiment_scheduler"] = {
"prompt.md": r'''
# Task 13 - Experiment dependency scheduler

Implement `schedule(tasks)` where `tasks` is a list of dictionaries with `id`, `depends_on` (list of IDs), and integer `priority`.

Return a valid execution order. Whenever multiple tasks are ready, choose higher priority first, then lexicographically smaller ID. Reject duplicate IDs, missing dependency IDs, self-dependencies, non-integer priorities, and cycles with `ValueError`. Do not mutate inputs.

Explain why a global sort by priority is insufficient.
''',
"starter.py": r'''
def schedule(tasks):
    raise NotImplementedError
''',
"solution.py": r'''
import heapq
def schedule(tasks):
    by_id={}
    for task in tasks:
        if not isinstance(task,dict) or not isinstance(task.get("id"),str) or not task["id"] or not isinstance(task.get("depends_on"),list) or type(task.get("priority")) is not int: raise ValueError("invalid task")
        if task["id"] in by_id: raise ValueError("duplicate task")
        by_id[task["id"]]=(list(task["depends_on"]),task["priority"])
    outgoing={task_id:[] for task_id in by_id}; indegree={task_id:0 for task_id in by_id}
    for task_id,(deps,_) in by_id.items():
        for dep in set(deps):
            if dep not in by_id or dep==task_id: raise ValueError("invalid dependency")
            outgoing[dep].append(task_id); indegree[task_id]+=1
    ready=[(-by_id[i][1],i) for i,d in indegree.items() if d==0]; heapq.heapify(ready); result=[]
    while ready:
        _,task_id=heapq.heappop(ready); result.append(task_id)
        for child in outgoing[task_id]:
            indegree[child]-=1
            if indegree[child]==0: heapq.heappush(ready,(-by_id[child][1],child))
    if len(result)!=len(by_id): raise ValueError("dependency cycle")
    return result
''',
"test_task.py": r'''
import os, unittest
if os.getenv("BENCHLING_IMPL") == "solution": from tasks.task_13_experiment_scheduler.solution import schedule
else: from tasks.task_13_experiment_scheduler.starter import schedule
class Tests(unittest.TestCase):
    def test_priority_among_ready(self):
        tasks=[{"id":"analyze","depends_on":["prep"],"priority":9},{"id":"prep","depends_on":[],"priority":1},{"id":"backup","depends_on":[],"priority":5},{"id":"report","depends_on":["analyze"],"priority":2}]
        self.assertEqual(schedule(tasks),["backup","prep","analyze","report"])
    def test_tie_and_empty(self):
        self.assertEqual(schedule([]),[])
        self.assertEqual(schedule([{"id":"b","depends_on":[],"priority":1},{"id":"a","depends_on":[],"priority":1}]),["a","b"])
    def test_errors(self):
        cases=[[{"id":"a","depends_on":["x"],"priority":1}],[{"id":"a","depends_on":["b"],"priority":1},{"id":"b","depends_on":["a"],"priority":1}]]
        for case in cases:
            with self.assertRaises(ValueError): schedule(case)
if __name__ == "__main__": unittest.main()
'''}

tasks["task_14_plate_allocator"] = {
"prompt.md": r'''
# Task 14 - 96-well microplate allocator

Implement `allocate(samples, reserved=None)`.

A 96-well plate has rows `A`-`H` and columns `1`-`12`. `samples` contains dictionaries with a unique non-empty string `id` and `replicates` from 1 to 8. `reserved` is an optional collection of well names.

Assign every replicate to an unused, non-reserved well. Replicates of the same sample must use different rows. Return `{sample_id: [well, ...]}` in sample input order, with each list in column-major well order (`A1, B1, ..., H1, A2, ...`). Choose the lexicographically earliest valid complete allocation under that well order. Raise `ValueError` for malformed input/reservations or when no allocation exists. Do not mutate inputs.

Start with a clear correct approach; discuss how you would optimize for many plates later.
''',
"starter.py": r'''
def allocate(samples, reserved=None):
    raise NotImplementedError
''',
"solution.py": r'''
ROWS="ABCDEFGH"
WELLS=[f"{r}{c}" for c in range(1,13) for r in ROWS]
def allocate(samples, reserved=None):
    reserved=set() if reserved is None else set(reserved)
    if any(w not in WELLS for w in reserved): raise ValueError("invalid reserved well")
    clean=[]; seen=set()
    for sample in samples:
        if not isinstance(sample,dict) or not isinstance(sample.get("id"),str) or not sample["id"] or type(sample.get("replicates")) is not int or not 1 <= sample["replicates"] <= 8: raise ValueError("invalid sample")
        if sample["id"] in seen: raise ValueError("duplicate sample")
        seen.add(sample["id"]); clean.append((sample["id"],sample["replicates"]))
    available=[w for w in WELLS if w not in reserved]; assigned={sample_id:[] for sample_id,_ in clean}; used=set()
    slots=[sample_id for sample_id,count in clean for _ in range(count)]
    def backtrack(index):
        if index==len(slots): return True
        sample_id=slots[index]; used_rows={w[0] for w in assigned[sample_id]}
        start=WELLS.index(assigned[sample_id][-1])+1 if assigned[sample_id] else 0
        for well in available:
            if WELLS.index(well)<start or well in used or well[0] in used_rows: continue
            used.add(well); assigned[sample_id].append(well)
            if backtrack(index+1): return True
            assigned[sample_id].pop(); used.remove(well)
        return False
    if not backtrack(0): raise ValueError("no valid allocation")
    return assigned
''',
"test_task.py": r'''
import os, unittest
if os.getenv("BENCHLING_IMPL") == "solution": from tasks.task_14_plate_allocator.solution import allocate
else: from tasks.task_14_plate_allocator.starter import allocate
class Tests(unittest.TestCase):
    def test_deterministic_allocation(self):
        self.assertEqual(allocate([{"id":"s1","replicates":2},{"id":"s2","replicates":1}],{"A1"}),{"s1":["B1","C1"],"s2":["D1"]})
    def test_rows_distinct_and_reserved(self):
        out=allocate([{"id":"x","replicates":8}],{"A1","B1"})["x"]
        self.assertEqual(len({w[0] for w in out}),8); self.assertFalse({"A1","B1"}&set(out))
    def test_validation(self):
        for samples,reserved in [([{"id":"x","replicates":9}],None),([{"id":"x","replicates":1},{"id":"x","replicates":1}],None),([], {"Z9"})]:
            with self.assertRaises(ValueError): allocate(samples,reserved)
if __name__ == "__main__": unittest.main()
'''}

for directory, files in tasks.items():
    write(f"tasks/{directory}/__init__.py", "")
    for name, body in files.items():
        write(f"tasks/{directory}/{name}", body)

write(".gitignore", "__pycache__/\n*.pyc\n.coverage\n")
print(ROOT)
