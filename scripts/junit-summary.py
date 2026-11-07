#!/usr/bin/env python3
"""Turns a JUnit XML report into a Markdown table (CI step summary) or a small HTML page (GitHub Pages).

    python3 scripts/junit-summary.py reports/maestro/junit.xml          # Markdown
    python3 scripts/junit-summary.py reports/maestro/junit.xml --html   # HTML
"""
import html
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


def load(path: Path):
    if not path.exists():
        return None
    root = ET.parse(path).getroot()
    cases = []
    for case in root.iter("testcase"):
        failure = case.find("failure")
        if failure is None:
            failure = case.find("error")
        status = "skipped" if case.find("skipped") is not None else ("failed" if failure is not None else "passed")
        message = (failure.get("message") or failure.text or "").strip() if failure is not None else ""
        cases.append({
            "name": case.get("name", "?"),
            "time": float(case.get("time") or 0),
            "status": status,
            "message": message.splitlines()[0] if message else "",
        })
    return cases


ICON = {"passed": "✅", "failed": "❌", "skipped": "⏭️"}


def markdown(cases):
    if cases is None:
        return "### Maestro\n\nNo JUnit report was produced (the run stopped before the flows ran).\n"
    passed = sum(c["status"] == "passed" for c in cases)
    lines = [f"### Maestro: {passed}/{len(cases)} flows passed", "", "| | Flow | Time | Failure |", "|---|---|---|---|"]
    for c in cases:
        lines.append(f"| {ICON[c['status']]} | {c['name']} | {c['time']:.1f}s | {c['message'].replace('|', '/')} |")
    return "\n".join(lines) + "\n"


def page(cases):
    rows = "".join(
        f"<tr class='{c['status']}'><td>{ICON[c['status']]}</td><td>{html.escape(c['name'])}</td>"
        f"<td>{c['time']:.1f}s</td><td>{html.escape(c['message'])}</td></tr>"
        for c in (cases or [])
    )
    passed = sum(c["status"] == "passed" for c in (cases or []))
    total = len(cases or [])
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Maestro report</title>
<style>body{{font:15px system-ui,sans-serif;margin:2rem auto;max-width:960px;padding:0 1rem}}
table{{border-collapse:collapse;width:100%}}td,th{{border-bottom:1px solid #ddd;padding:.5rem;text-align:left}}
tr.failed td{{background:#fdecec}}</style></head><body>
<h1>Maestro flows: {passed}/{total} passed</h1>
<p>Screenshots and logs of every flow are in the <code>artifacts</code> folder of the CI run.</p>
<table><tr><th></th><th>Flow</th><th>Time</th><th>Failure</th></tr>{rows}</table>
<p><a href="../">Back to the reports</a></p></body></html>"""


if __name__ == "__main__":
    report = load(Path(sys.argv[1]))
    print(page(report) if "--html" in sys.argv else markdown(report))
