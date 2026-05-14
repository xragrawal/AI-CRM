#!/usr/bin/env python3
"""
Personal AI CRM — Automated Demo Recording
Uses browser-use 0.12 (VLM/Gemini) + Playwright video recording.

Usage:
  .venv-demo/bin/python3 demo-record.py

Output:
  demo-recordings/crm-demo-<timestamp>.mp4
"""

import asyncio
import glob
import os
import subprocess
from datetime import datetime
from pathlib import Path

from browser_use import Agent, Browser
from browser_use.llm.google import ChatGoogle

# ── Config ─────────────────────────────────────────────────────────────────────

BASE_URL = "http://localhost:3000"
RECORDINGS_DIR = Path("./demo-recordings")
RECORDINGS_DIR.mkdir(exist_ok=True)

# Load GEMINI_API_KEY from .env manually (no python-dotenv needed)
def load_env(path=".env"):
    vals = {}
    try:
        for line in Path(path).read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                vals[k.strip()] = v.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return vals

env = load_env()
GEMINI_API_KEY = env.get("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")

# ── Demo task ──────────────────────────────────────────────────────────────────

DEMO_TASK = f"""
You are recording a polished ~2:40 product demo of "Personal AI CRM" — an AI-powered CRM
that turns unstructured meeting notes into structured deal data automatically.

Open {BASE_URL} and execute each step below IN ORDER.
After every step marked with ⏸ PAUSE, do nothing for the specified duration so the screen is visible.

────────────────────────────────────────────────────────────────
STEP 1 — DASHBOARD  (~0:00–0:12)
[Your deal universe at a glance]
────────────────────────────────────────────────────────────────
Navigate to {BASE_URL}. Wait for full page load.
Move the mouse slowly over the KPI cards at the top of the page (Total Deals, Contacts, Organizations).
Hover briefly on each card so the numbers are clearly visible.
⏸ PAUSE 4 seconds on the dashboard.

────────────────────────────────────────────────────────────────
STEP 2 — COMPANIES  (~0:12–0:28)
[Every partner org auto-populates from meeting notes — no manual entry]
────────────────────────────────────────────────────────────────
Click "Companies" in the left sidebar navigation.
Wait for the list of organizations to load.
Move the mouse slowly over 2-3 company cards/rows to show the list.
Click on any one company to open its detail page.
Wait for the detail page to load. Scroll down slowly to show linked deals and contact count.
⏸ PAUSE 3 seconds on the company detail page.

────────────────────────────────────────────────────────────────
STEP 3 — PEOPLE  (~0:28–0:42)
[Key contacts, roles, and handles — all extracted from raw notes]
────────────────────────────────────────────────────────────────
Click "People" in the left sidebar navigation.
Wait for the contacts list to load.
Move the mouse slowly over 2-3 contact rows to show email and organization columns.
Click on any one contact to open their profile page.
Wait for the profile to load. Scroll to show their linked deals and contact details.
⏸ PAUSE 3 seconds on the contact profile page.

────────────────────────────────────────────────────────────────
STEP 4 — INTELLIGENCE HUB: CAPTURE  (~0:42–1:05)
[Paste any meeting notes — AI extracts the structure instantly]
────────────────────────────────────────────────────────────────
Click "Intelligence" in the left sidebar navigation.
The page has two columns. On the LEFT side you see a "Capture" form with a large textarea.
The textarea has placeholder text "Paste a meeting transcript, email thread, or any unstructured notes..."
⏸ PAUSE 2 seconds to show the empty form.

Look for a small purple button labeled "Load Sample" in the bottom-right corner of the textarea
(it is only visible when the textarea is empty). Click "Load Sample".
⏸ PAUSE 3 seconds to show the loaded sample meeting notes text.

Now click the dark "Submit to AI" button at the bottom-right of the form.
Wait for the page to navigate away (the form will show "Processing..." then redirect).

────────────────────────────────────────────────────────────────
STEP 5 — AI REVIEW: HUMAN-IN-THE-LOOP  (~1:05–1:30)
[Review AI's proposal, see existing matches, approve or edit before committing]
────────────────────────────────────────────────────────────────
You will land on /items/[id]. Wait for the AI extraction to complete (watch for loading spinner to disappear).
The page has 3 columns:
  LEFT:   "Raw Input" — the original notes
  MIDDLE: "AI Proposal" — extracted deal name, organization, contacts, tags, next steps
  RIGHT:  "Existing Matches" — similar deals from the database

⏸ PAUSE 4 seconds on the full 3-column view to let viewers read the extracted data.

Scroll the MIDDLE column slowly downward to reveal all extracted fields.
⏸ PAUSE 2 seconds at the bottom of the middle column.

Find the green "Approve" button (it should be prominent, likely at the bottom of the middle column
or at the top of the page). Click it. Wait for the redirect.

────────────────────────────────────────────────────────────────
STEP 6 — DEAL DETAIL  (~1:30–1:42)
[One approved note → structured deal card with contacts and activity log]
────────────────────────────────────────────────────────────────
You land on /deals/[id]. Scroll down slowly to reveal:
- Deal summary section
- Linked contacts with their roles
- Activity history at the bottom
⏸ PAUSE 4 seconds before moving on.

────────────────────────────────────────────────────────────────
STEP 7 — DEALS PIPELINE: KANBAN VIEW  (~1:42–1:58)
[Visual pipeline — drag deals from Qualified to Won]
────────────────────────────────────────────────────────────────
Click "Deals" in the left sidebar.
The page loads in table view. Find the "Kanban" toggle/button near the top of the page and click it.
Wait for the Kanban board with swimlane columns (Qualified, MOU Signed, Integration, Won, On Hold).
Slowly move the mouse over 2-3 deal cards to hover over them across different columns.
⏸ PAUSE 4 seconds on the Kanban board.

────────────────────────────────────────────────────────────────
STEP 8 — COMMAND CENTER: AI RECALL  (~1:58–2:15)
[Ask anything about your deals — get cited answers from your own notes]
────────────────────────────────────────────────────────────────
Press the keyboard shortcut Command+K to open the Command Center overlay.
Wait for the dark modal dialog to appear with a search input.
⏸ PAUSE 1 second after it opens.

Type this EXACT text into the input: "What's the status of our latest deal?"
Press Enter to submit. Wait for the AI response (it will show a cited answer).
⏸ PAUSE 4 seconds to show the full AI response with source citations.
Press Escape to close the overlay.

────────────────────────────────────────────────────────────────
STEP 9 — AGENT HUB: MOU GENERATION  (~2:15–2:40)
[One-click MoU draft — AI reads the deal and generates a legal document]
────────────────────────────────────────────────────────────────
Click "Agent Hub" in the left sidebar.
You see a grid of agent cards. Find and click the card labeled "Create MoU" (it has a "Live" green badge).

On the MoU page:
1. Find the "Split" button in the top-right toggle (next to "Wizard") and click it to enter split view.
2. In the left panel, click the "Deal" dropdown and select any deal from the list.
3. Watch the form fields auto-fill (Scope of Work, Key Contacts, Pricing Terms).
⏸ PAUSE 3 seconds to show the auto-filled form.

4. Click the "Generate MoU" button (purple button at the bottom of the left panel).
5. Wait for generation to complete (the right panel will show a spinning loader, then the document).
⏸ PAUSE 2 seconds once the MoU text appears.

6. Slowly scroll the RIGHT panel (the MoU preview) downward to show the document sections:
   RECITALS → Terms → Obligations → Signature blocks.
⏸ PAUSE 4 seconds at the bottom of the MoU before finishing.

────────────────────────────────────────────────────────────────
END OF DEMO
────────────────────────────────────────────────────────────────
The demo is complete. Stay on the MoU page. Do not navigate further.

GLOBAL RULES:
- Move the mouse slowly and deliberately at all times (no fast jumps)
- Always wait for page load / loading spinners to disappear before the next action
- If a button is not immediately visible, scroll to find it
- Do NOT click anything outside the described flow
- Target total runtime: ~160 seconds
"""

# ── Main ───────────────────────────────────────────────────────────────────────

async def main():
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not found in .env — set it before running")

    print(f"🎬  Personal AI CRM — Demo Recorder")
    print(f"    Target : {BASE_URL}")
    print(f"    Model  : gemini-2.5-flash")
    print(f"    Output : {RECORDINGS_DIR}/")
    print()

    llm = ChatGoogle(
        model="gemini-2.5-flash",
        api_key=GEMINI_API_KEY,
        temperature=0,
    )

    browser = Browser(
        headless=False,
        viewport={"width": 1440, "height": 900},
        record_video_dir=str(RECORDINGS_DIR),
        record_video_size={"width": 1440, "height": 900},
        record_video_framerate=30,
        # Slow down actions for a smoother, human-like recording
        wait_between_actions=1.8,
        minimum_wait_page_load_time=1.5,
        wait_for_network_idle_page_load_time=2.5,
        # Clean video — no debug highlight boxes
        highlight_elements=False,
        dom_highlight_elements=False,
        args=[
            "--window-size=1440,900",
            "--disable-blink-features=AutomationControlled",  # hide automation banner
        ],
    )

    agent = Agent(
        task=DEMO_TASK,
        llm=llm,
        browser=browser,
        use_vision=True,
        use_thinking=True,
        max_actions_per_step=2,   # deliberate pacing — 1-2 actions at a time
        max_failures=4,
    )

    try:
        print("▶  Running demo agent...")
        await agent.run(max_steps=120)
        print("\n✅  Agent completed all steps.")
    except Exception as e:
        print(f"\n⚠️  Agent stopped early: {e}")
    finally:
        print("   Closing browser and flushing video...")
        await browser.close()

    # ── Post-process with ffmpeg ───────────────────────────────────────────────
    webm_files = sorted(
        RECORDINGS_DIR.glob("*.webm"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    if not webm_files:
        print("❌  No .webm recording found in demo-recordings/")
        return

    latest_webm = webm_files[0]
    size_raw = latest_webm.stat().st_size / 1_000_000
    print(f"\n🎞   Raw recording : {latest_webm.name} ({size_raw:.1f} MB)")

    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    output_mp4 = RECORDINGS_DIR / f"crm-demo-{timestamp}.mp4"

    # Get actual video duration
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(latest_webm)],
        capture_output=True, text=True,
    )
    duration = float(probe.stdout.strip()) if probe.stdout.strip() else 160.0
    fade_out_start = max(duration - 1.5, 0)

    print(f"    Duration  : {duration:.1f}s")
    print(f"    Output    : {output_mp4.name}")

    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-i", str(latest_webm),
        "-vf", (
            f"scale=1440:900:flags=lanczos,"
            f"fade=t=in:st=0:d=0.8,"                          # fade in 0.8s
            f"fade=t=out:st={fade_out_start:.2f}:d=1.5"       # fade out last 1.5s
        ),
        "-c:v", "libx264",
        "-preset", "slow",
        "-crf", "17",              # near-lossless quality
        "-pix_fmt", "yuv420p",     # broad compatibility (QuickTime, Chrome, etc.)
        "-movflags", "+faststart",  # web-optimised (moov atom at front)
        "-an",                      # no audio track
        str(output_mp4),
    ]

    result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
    if result.returncode == 0:
        size_out = output_mp4.stat().st_size / 1_000_000
        print(f"\n✅  Demo video ready: {output_mp4}  ({size_out:.1f} MB)")
    else:
        print(f"\n❌  ffmpeg failed:\n{result.stderr[-800:]}")
        print(f"    Raw recording kept at: {latest_webm}")


if __name__ == "__main__":
    asyncio.run(main())
