#!/usr/bin/env python3
"""Sync lib/data/treatments.json -> the Supabase `treatments` table.

WHY THIS EXISTS
---------------
lib/api/repositories/treatments-repository.ts reads Supabase FIRST and only
falls back to treatments.json:

    const fromDb = await fetchTreatmentsFromSupabase()
    if (fromDb && fromDb.length > 0) return fromDb
    return treatmentSchema.array().parse(treatmentsJson)

In production Supabase is always configured, so the JSON is dead code there.
Editing treatments.json therefore has NO effect on the live site -- which is why
the same procedure-page bugs were "fixed" twice (Apr and Jul 2026) and kept
coming back. The JSON is the reviewable, version-controlled, test-covered copy;
this script is what actually pushes it to the database.

Workflow: edit treatments.json -> `pnpm test` (guards image refs) -> run this.

Only fields listed in SYNC_FIELDS are written. A field is written only when the
DB value is missing or is a known placeholder, so hand-edits made directly in
the database are never clobbered. Pass --force to overwrite regardless.

Usage:
    python scripts/sync-treatments-to-supabase.py            # dry run
    python scripts/sync-treatments-to-supabase.py --apply
    python scripts/sync-treatments-to-supabase.py --apply --force
"""
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
TABLE = "treatments"
SYNC_FIELDS = {
    # json key        -> db column
    "imageUrl": "image_url",
    "shortDescription": "short_description",
    "description": "description",
    "priceRange": "price_range",
    "priceNote": "price_note",
    "duration": "duration",
    "category": "category",
}
APPLY = "--apply" in sys.argv
FORCE = "--force" in sys.argv


def env(name: str) -> str:
    for line in (REPO / ".env.local").read_text(encoding="utf-8").splitlines():
        if line.startswith(name + "="):
            return line.split("=", 1)[1].strip().strip("\"'")
    sys.exit(f"missing {name} in .env.local")


BASE = env("NEXT_PUBLIC_SUPABASE_URL").rstrip("/") + f"/rest/v1/{TABLE}"
KEY = env("SUPABASE_SERVICE_ROLE_KEY")
HDR = {
    "apikey": KEY,
    "Authorization": "Bearer " + KEY,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


def is_placeholder(row: dict, col: str) -> bool:
    """True when the DB value carries no real information."""
    val = (row.get(col) or "").strip()
    if not val:
        return True
    if col == "short_description":
        return val == (row.get("title") or "").strip()
    if col == "description":
        return val.startswith("Comprehensive guide to")
    if col == "image_url":
        # the recurring bug: extension points at a file that does not exist
        return not (REPO / "public" / val.lstrip("/")).exists()
    return False


def fetch_rows() -> list:
    req = urllib.request.Request(BASE + "?select=*", headers=HDR)
    with urllib.request.urlopen(req, timeout=45) as r:
        return json.loads(r.read().decode())


def main() -> None:
    js = {r["slug"]: r for r in json.loads((REPO / "lib/data/treatments.json").read_text(encoding="utf-8"))}
    rows = fetch_rows()
    print(f"db rows: {len(rows)}   json rows: {len(js)}")

    plan = []
    for row in rows:
        src = js.get(row["slug"])
        if not src:
            continue
        patch = {}
        for jkey, col in SYNC_FIELDS.items():
            new = src.get(jkey)
            if not new or not str(new).strip():
                continue
            if str(new).strip() == (row.get(col) or "").strip():
                continue
            if not FORCE and not is_placeholder(row, col):
                continue  # real DB content -- leave it alone
            if col == "image_url" and not (REPO / "public" / str(new).lstrip("/")).exists():
                print(f"  SKIP {row['slug']}: json image {new} not on disk")
                continue
            patch[col] = new
        if patch:
            plan.append((row["slug"], patch))

    by_col = {}
    for _, p in plan:
        for c in p:
            by_col[c] = by_col.get(c, 0) + 1
    print(f"rows to patch: {len(plan)}")
    for c, n in sorted(by_col.items()):
        print(f"  {c}: {n}")

    if not APPLY:
        for slug, p in plan[:3]:
            preview = {k: (str(v)[:60] + "..." if len(str(v)) > 60 else v) for k, v in p.items()}
            print("  sample", slug, "->", preview)
        print("\nDRY RUN -- pass --apply to write.")
        return

    ok = fail = 0
    for slug, patch in plan:
        req = urllib.request.Request(
            f"{BASE}?slug=eq.{slug}", data=json.dumps(patch).encode(),
            headers=HDR, method="PATCH",
        )
        try:
            with urllib.request.urlopen(req, timeout=45) as resp:
                if resp.status in (200, 204) and json.loads(resp.read().decode() or "[]"):
                    ok += 1
                else:
                    fail += 1
                    print("  UNEXPECTED", slug, resp.status)
        except urllib.error.HTTPError as e:
            fail += 1
            print("  FAIL", slug, e.code, e.read().decode()[:200])
        except Exception as e:
            fail += 1
            print("  FAIL", slug, type(e).__name__, e)

    print(f"\napplied ok={ok} fail={fail}")
    if fail:
        sys.exit(1)


if __name__ == "__main__":
    main()
