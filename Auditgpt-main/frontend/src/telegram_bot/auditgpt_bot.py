#!/usr/bin/env python3
"""
AuditGPT Telegram Bot  (fixed)
================================
Fixes applied vs v1:
  1. api() — 404 now returns None instead of raising; non-JSON bodies handled
  2. api_sector() — URL-encodes sector names with urllib.parse (not requests.utils)
  3. score extraction — reads scores.composite_score OR top-level composite_score
  4. ForensicReport field names aligned: beneish_score / altman_score / industry_adj_z_score / trend_break_count
  5. /top — no longer fires N sector sub-requests blindly; handles both list and dict responses
  6. _send_report — red_flags list handled whether items are str or dict
  7. escape() — now also escapes '/' so sector URLs never break MarkdownV2
  8. callback sector: button — strips escaped chars before using as URL param
  9. All float formatting guarded with safe_float() — never crashes on None / str "N/A"
 10. START_TEXT / GUIDE_TEXT — pre-escaped so they never cause BadRequest on send
 11. status_cmd — MarkdownV2-safe f-string escaping fixed
 12. Telegram message length guard — truncates to 4000 chars before sending

Setup:
  pip install python-telegram-bot requests python-dotenv
  # Python 3.11+

Usage:
  1. Create a bot via @BotFather -> get TOKEN
  2. Copy .env.example -> .env and fill values
  3. python auditgpt_bot.py
"""

import os
import re
import logging
import urllib.parse
import requests
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ContextTypes,
    filters,
)
from telegram.constants import ParseMode

# ─────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────
load_dotenv()
TELEGRAM_TOKEN: str = os.getenv("TELEGRAM_TOKEN", "YOUR_BOT_TOKEN_HERE")
API_BASE: str = os.getenv("AUDITGPT_API_URL", "http://localhost:8000").rstrip("/")

logging.basicConfig(
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger("AuditGPT-Bot")

# ─────────────────────────────────────────────────────────────
# Risk helpers
# ─────────────────────────────────────────────────────────────
RISK_EMOJI = {"Low": "🟢", "Medium": "🟡", "High": "🔴", "Critical": "💀"}

def risk_label(score: float) -> str:
    if score <= 25:  return "Low"
    if score <= 50:  return "Medium"
    if score <= 75:  return "High"
    return "Critical"

def risk_bar(score: float, width: int = 12) -> str:
    filled = max(0, min(width, round((score / 100) * width)))
    return f"[{'X' * filled}{'.' * (width - filled)}] {score:.1f}/100"

def safe_float(val, decimals: int = 2) -> str:
    """Safely format a numeric value; returns N/A for None/non-numeric."""
    try:
        return f"{float(val):.{decimals}f}"
    except (TypeError, ValueError):
        return "N/A"

# ─────────────────────────────────────────────────────────────
# API helpers
# ─────────────────────────────────────────────────────────────
def api_get(path: str, params: dict | None = None) -> dict | list | None:
    """
    GET  API_BASE + path.
    Returns parsed JSON on 2xx, None on network error or 4xx/5xx.
    """
    try:
        url = f"{API_BASE}{path}"
        r = requests.get(url, params=params, timeout=12)
        if r.status_code == 404:
            logger.info(f"404 -> {url}")
            return None
        r.raise_for_status()
        return r.json()
    except requests.exceptions.ConnectionError:
        logger.warning(f"Connection refused -> {API_BASE}")
        return None
    except requests.exceptions.JSONDecodeError as e:
        logger.error(f"JSON decode error {path}: {e}")
        return None
    except Exception as e:
        logger.error(f"API error {path}: {e}")
        return None

def api_sector(sector_name: str) -> list | None:
    """Fetch companies for a sector, URL-encoding the name correctly."""
    encoded = urllib.parse.quote(sector_name, safe="")
    return api_get(f"/api/sectors/{encoded}")

# ─────────────────────────────────────────────────────────────
# MarkdownV2 helpers
# ─────────────────────────────────────────────────────────────
# _MD2_RE = re.compile(r"([_*\[\]()~`>#+\-=|{}.!\\])")
# _MD2_RE = re.compile(r"([_*\[\]()~`>#+\-=|{}.!\\/])")
_MD2_RE = re.compile(r"([_*\[\]()~`>#+\-=|{}.!\\/])")

def esc(text: str) -> str:
    """Escape all MarkdownV2 special characters."""
    return _MD2_RE.sub(r"\\\1", str(text))

def trunc(text: str, limit: int = 4000) -> str:
    """Telegram max message length guard."""
    return text if len(text) <= limit else text[: limit - 3] + "..."

# ─────────────────────────────────────────────────────────────
# Score extraction — handles both flat and nested shapes
# ForensicReport may return scores at top level OR under "scores" key
# ─────────────────────────────────────────────────────────────
def extract_scores(data: dict) -> dict:
    """
    Returns a normalised score dict regardless of whether the API puts
    scores at top-level or nested under 'scores'.
    Field name aliases handled here.
    """
    raw = data.get("scores") or data  # prefer nested, fallback to flat

    composite = (
        raw.get("composite_score")
        or raw.get("composite")
        or 0.0
    )

    beneish = (
        raw.get("beneish_m_score")
        or raw.get("beneish_score")
        or raw.get("m_score")
    )

    altman = (
        raw.get("altman_z_score")
        or raw.get("altman_score")
        or raw.get("z_score")
    )

    adj_z = (
        raw.get("industry_adj_z")
        or raw.get("industry_adj_z_score")
        or raw.get("ind_adj_z")
    )

    trend = (
        raw.get("trend_break_score")
        or raw.get("trend_break_count")
        or raw.get("trend_breaks")
    )

    return {
        "composite": float(composite) if composite is not None else 0.0,
        "beneish":   beneish,
        "altman":    altman,
        "adj_z":     adj_z,
        "trend":     trend,
    }

# ─────────────────────────────────────────────────────────────
# /start  &  /help
# ─────────────────────────────────────────────────────────────
START_TEXT = (
    "🕵️ *AuditGPT — NSE Fraud Radar*\n"
    "_Powered by Beneish M\\-Score · Altman Z\\-Score · Quant Engine_\n\n"
    "I detect financial fraud patterns in NSE\\-listed companies\\.\n\n"
    "*Commands:*\n"
    "• `/search` — fuzzy company search\n"
    "• `/report` — full forensic report\n"
    "• `/score` — quick fraud score breakdown\n"
    "• `/sectors` — sector risk overview\n"
    "• `/top` — top 8 highest\\-risk companies\n"
    "• `/status` — backend health check\n"
    "• `/guide` — scoring formulas and run commands\n\n"
    "*Quick start:*\n"
    "`/search TCS`  then  `/report TCS`"
)

async def start(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(START_TEXT, parse_mode=ParseMode.MARKDOWN_V2)

async def help_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(START_TEXT, parse_mode=ParseMode.MARKDOWN_V2)

# ─────────────────────────────────────────────────────────────
# /search
# ─────────────────────────────────────────────────────────────
async def search_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    query = " ".join(ctx.args).strip() if ctx.args else ""
    if not query:
        await update.message.reply_text(
            "Usage: `/search <company name>`\nExample: `/search Infosys`",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    # msg = await update.message.reply_text(
    #     f"🔍 Searching for *{esc(query)}*...", parse_mode=ParseMode.MARKDOWN_V2
    # )
    # msg = await update.message.reply_text(
    #     f"🔍 Searching for {esc(query)}...",
    #     parse_mode=ParseMode.MARKDOWN_V2
    # )

    msg = await update.message.reply_text(
    f"🔍 Searching for `{esc(query)}`...",
    parse_mode=ParseMode.MARKDOWN_V2
)
    
    data = api_get("/api/search", {"q": query})

    if data is None:
        await msg.edit_text(
            "❌ Cannot reach AuditGPT backend\\.\n"
            "Start it: `cd backend && uvicorn main:app --reload --port 8000`",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    results: list = data if isinstance(data, list) else data.get("results", [])
    if not results:
        await msg.edit_text(
            f"No results for *{esc(query)}*\\. Try a shorter name\\.",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    # lines = [f"*Results for \"{esc(query)}\":*\n"]
    lines = [f"*Results for:* `{esc(query)}`\n"]
    buttons = []
    for c in results[:8]:
        cid   = c.get("company_id", "")
        cname = c.get("company_name", cid)
        sec   = c.get("sector", "")
        score = c.get("composite_score") or c.get("composite") or c.get("score")
        if score is not None:
            try:
                score = float(score)
                lbl   = risk_label(score)
                emj   = RISK_EMOJI.get(lbl, "⚪")
                lines.append(f"{emj} `{esc(cid)}` {esc(cname)} \\- *{score:.0f}* \\({esc(sec)}\\)")
            except (TypeError, ValueError):
                lines.append(f"⚪ `{esc(cid)}` {esc(cname)} \\({esc(sec)}\\)")
        else:
            lines.append(f"⚪ `{esc(cid)}` {esc(cname)} \\({esc(sec)}\\)")
        buttons.append([InlineKeyboardButton(f"📊 {cname[:30]}", callback_data=f"report:{cid}")])

    await msg.edit_text(
        trunc("\n".join(lines)),
        parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=InlineKeyboardMarkup(buttons),
    )

# ─────────────────────────────────────────────────────────────
# /score
# ─────────────────────────────────────────────────────────────
async def score_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    cid = " ".join(ctx.args).strip().upper() if ctx.args else ""
    if not cid:
        await update.message.reply_text(
            "Usage: `/score <company_id>`\nExample: `/score TCS`",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    msg = await update.message.reply_text(
        f"⚙️ Loading score for `{esc(cid)}`...", parse_mode=ParseMode.MARKDOWN_V2
    )
    data = api_get(f"/api/report/{cid}")
    if data is None:
        await msg.edit_text(
            f"❓ No report for `{esc(cid)}`\\.\n"
            "Check the company ID or run `python scripts/precompute.py`\\.",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    sc     = extract_scores(data)
    comp   = sc["composite"]
    lbl    = risk_label(comp)
    emj    = RISK_EMOJI.get(lbl, "⚪")
    bar    = risk_bar(comp)
    cname  = data.get("company_name", cid)
    sector = data.get("sector", "")

    # text = (
    #     f"{emj} `{esc(cname)}` \\({esc(sector)}\\)\n"
    #     f"`{esc(bar)}`\n"
    #     f"Risk: *{esc(lbl)}*\n\n"
    #     f"*Score Breakdown:*\n"
    #     f"• Beneish M\\-Score \\(35%\\): `{esc(safe_float(sc['beneish']))}`\n"
    #     f"• Altman Z\\-Score \\(30%\\): `{esc(safe_float(sc['altman']))}`\n"
    #     f"• Industry\\-Adj Z \\(25%\\): `{esc(safe_float(sc['adj_z']))}`\n"
    #     f"• Trend Breaks \\(10%\\): `{esc(safe_float(sc['trend']))}`\n"
    #     f"• *Composite*: `{comp:.1f} / 100`"
    # )
#     text = (
#     # f"{emj} `{esc(cname)}` ({esc(sector)})\n"
#     f"{emj} `{esc(cname)}` \\({esc(sector)}\\)\n"
#     f"`{esc(bar)}`\n"
#     f"Risk: `{esc(lbl)}`\n\n"
#     f"*Score Breakdown:*\n"
#     f"• Beneish: `{esc(safe_float(sc['beneish']))}`\n"
#     f"• Altman: `{esc(safe_float(sc['altman']))}`\n"
#     # f"• "Ind\\-Adj Z" `{esc(safe_float(sc['adj_z']))}`\n"
#     f"• Ind\\-Adj Z: `{esc(safe_float(sc['adj_z']))}`\n"
#     f"• Trend: `{esc(safe_float(sc['trend']))}`\n"
#     f"• Composite: `{comp:.1f}/100`"
# )
    text = (
    f"{emj} `{esc(cname)}` \\({esc(sector)}\\)\n"
    f"`{esc(bar)}`\n"
    f"Risk: `{esc(lbl)}`\n\n"
    f"*Score Breakdown:*\n"
    f"• Beneish: `{esc(safe_float(sc['beneish']))}`\n"
    f"• Altman: `{esc(safe_float(sc['altman']))}`\n"
    f"• Ind\\-Adj Z: `{esc(safe_float(sc['adj_z']))}`\n"
    f"• Trend: `{esc(safe_float(sc['trend']))}`\n"
    f"• Composite: `{comp:.1f}/100`"
    )
    await msg.edit_text(
        trunc(text),
        parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton("📋 Full Report", callback_data=f"report:{cid}"),
        ]]),
    )

# ─────────────────────────────────────────────────────────────
# _send_report  (shared by /report and inline buttons)
# ─────────────────────────────────────────────────────────────
# async def _send_report(message, cid: str) -> None:
#     msg = await message.reply_text(
#         f"📡 Fetching forensic report for `{esc(cid)}`...",
#         parse_mode=ParseMode.MARKDOWN_V2,
#     )
#     data = api_get(f"/api/report/{cid}")
#     if data is None:
#         await msg.edit_text(
#             f"❓ No report found for `{esc(cid)}`\\.\n"
#             "Run `python scripts/precompute.py` to generate reports\\.",
#             parse_mode=ParseMode.MARKDOWN_V2,
#         )
#         return

#     sc     = extract_scores(data)
#     comp   = sc["composite"]
#     lbl    = risk_label(comp)
#     emj    = RISK_EMOJI.get(lbl, "⚪")
#     bar    = risk_bar(comp)
#     cname  = data.get("company_name", cid)
#     sector = data.get("sector", "Unknown")

#     # ── Red flags ──────────────────────────────────────────
#     raw_flags = data.get("red_flags") or []
#     flag_lines = ""
#     for i, f in enumerate(raw_flags[:5], 1):
#         if isinstance(f, dict):
#             desc = (
#                 f.get("description")
#                 or f.get("message")
#                 or f.get("flag")
#                 or str(f)
#             )
#         else:
#             desc = str(f)
#         flag_lines += f"  {i}\\. {esc(desc[:100])}\n"
#     if not flag_lines:
#         flag_lines = "  ✅ No major red flags detected\n"

#     # ── Peer companies ─────────────────────────────────────
#     peers = data.get("peer_companies") or []
#     peer_lines = ""
#     for p in peers[:4]:
#         pid    = p.get("company_id", "")
#         pname  = p.get("company_name", pid)
#         pscore = p.get("composite_score") or p.get("composite") or 0.0
#         try:
#             pscore = float(pscore)
#         except (TypeError, ValueError):
#             pscore = 0.0
#         pemj = RISK_EMOJI.get(risk_label(pscore), "⚪")
#         peer_lines += f"  {pemj} `{esc(pname[:24])}`: `{pscore:.0f}`\n"
#         # peer_lines += f"  {pemj} {esc(pname[:24])}: *{pscore:.0f}*\n"
#     if not peer_lines:
#         peer_lines = "  _No peer data available_\n"

#     # text = (
#     #     f"{emj} *FORENSIC REPORT: {esc(cname)}*\n"
#     #     f"Sector: _{esc(sector)}_\n"
#     #     f"`{esc(bar)}`\n"
#     #     f"Risk: *{esc(lbl)}*\n\n"
#     #     f"*📊 Quant Scores:*\n"
#     #     f"• Beneish M\\-Score: `{esc(safe_float(sc['beneish']))}`\n"
#     #     f"• Altman Z\\-Score: `{esc(safe_float(sc['altman']))}`\n"
#     #     f"• Composite: `{comp:.1f} / 100`\n\n"
#     #     f"*🚩 Red Flags:*\n{flag_lines}\n"
#     #     f"*🏢 Sector Peers:*\n{peer_lines}\n"
#     #     f"_Dashboard: f"`http://localhost:5173/report/{esc(cid)}`"
#     # )
#     text = (
#     f"{emj} *FORENSIC REPORT*\n"
#     f"Company: `{esc(cname)}`\n"
#     f"Sector: `{esc(sector)}`\n"
#     f"`{esc(bar)}`\n"
#     f"Risk: `{esc(lbl)}`\n\n"
#     f"*Scores:*\n"
#     f"• Beneish: `{esc(safe_float(sc['beneish']))}`\n"
#     f"• Altman: `{esc(safe_float(sc['altman']))}`\n"
#     f"• Composite: `{comp:.1f}/100`\n\n"
#     f"*Red Flags:*\n{flag_lines}\n"
#     f"*Peers:*\n{peer_lines}\n"
#     # f"Dashboard: `http://localhost:5173/report/{esc(cid)}`"
#     url = esc(f"http://localhost:5173/report/{cid}")
#     f"Dashboard: `{url}`"
# )
#     await msg.edit_text(
#         trunc(text),
#         parse_mode=ParseMode.MARKDOWN_V2,
#         reply_markup=InlineKeyboardMarkup([[
#             InlineKeyboardButton("🔄 Refresh",    callback_data=f"report:{cid}"),
#             InlineKeyboardButton("🏭 Sector",     callback_data=f"sector:{sector}"),
#             InlineKeyboardButton("📈 Score Only", callback_data=f"score:{cid}"),
#         ]]),
#     )

# async def report_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
#     cid = " ".join(ctx.args).strip().upper() if ctx.args else ""
#     if not cid:
#         await update.message.reply_text(
#             "Usage: `/report <company_id>`\nExample: `/report TCS`",
#             parse_mode=ParseMode.MARKDOWN_V2,
#         )
#         return
#     await _send_report(update.message, cid)

async def report_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    cid = " ".join(ctx.args).strip().upper() if ctx.args else ""
    
    if not cid:
        await update.message.reply_text(
            "Usage: `/report <company_id>`\nExample: `/report TCS`",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    await _send_report(update.message, cid)

async def _send_report(message, cid: str) -> None:
    msg = await message.reply_text(
        f"📡 Fetching forensic report for `{esc(cid)}`...",
        parse_mode=ParseMode.MARKDOWN_V2,
    )

    data = api_get(f"/api/report/{cid}")
    if data is None:
        await msg.edit_text(
            f"❓ No report found for `{esc(cid)}`\\.\n"
            "Run `python scripts/precompute.py` to generate reports\\.",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    sc     = extract_scores(data)
    comp   = sc["composite"]
    lbl    = risk_label(comp)
    emj    = RISK_EMOJI.get(lbl, "⚪")
    bar    = risk_bar(comp)
    cname  = data.get("company_name", cid)
    sector = data.get("sector", "Unknown")

    # ── Red flags ──────────────────────────────────────────
    raw_flags = data.get("red_flags") or []
    flag_lines = ""
    for i, f in enumerate(raw_flags[:5], 1):
        if isinstance(f, dict):
            desc = (
                f.get("description")
                or f.get("message")
                or f.get("flag")
                or str(f)
            )
        else:
            desc = str(f)
        flag_lines += f"  {i}\\. {esc(desc[:100])}\n"

    if not flag_lines:
        flag_lines = "  ✅ No major red flags detected\n"

    # ── Peer companies ─────────────────────────────────────
    peers = data.get("peer_companies") or []
    peer_lines = ""
    for p in peers[:4]:
        pid    = p.get("company_id", "")
        pname  = p.get("company_name", pid)
        pscore = p.get("composite_score") or p.get("composite") or 0.0

        try:
            pscore = float(pscore)
        except (TypeError, ValueError):
            pscore = 0.0

        pemj = RISK_EMOJI.get(risk_label(pscore), "⚪")
        peer_lines += f"  {pemj} `{esc(pname[:24])}`: `{pscore:.0f}`\n"

    if not peer_lines:
        peer_lines = "  _No peer data available_\n"

    # ✅ FIX: define url OUTSIDE
    url = esc(f"http://localhost:5173/report/{cid}")

    text = (
        f"{emj} *FORENSIC REPORT*\n"
        f"Company: `{esc(cname)}`\n"
        f"Sector: `{esc(sector)}`\n"
        f"`{esc(bar)}`\n"
        f"Risk: `{esc(lbl)}`\n\n"
        f"*Scores:*\n"
        f"• Beneish: `{esc(safe_float(sc['beneish']))}`\n"
        f"• Altman: `{esc(safe_float(sc['altman']))}`\n"
        f"• Composite: `{comp:.1f}/100`\n\n"
        f"*Red Flags:*\n{flag_lines}\n"
        f"*Peers:*\n{peer_lines}\n"
        f"Dashboard: `{url}`"
    )

    await msg.edit_text(
        trunc(text),
        parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton("🔄 Refresh",    callback_data=f"report:{cid}"),
            InlineKeyboardButton("🏭 Sector",     callback_data=f"sector:{sector}"),
            InlineKeyboardButton("📈 Score Only", callback_data=f"score:{cid}"),
        ]]),
    )


# ─────────────────────────────────────────────────────────────
# /sectors
# ─────────────────────────────────────────────────────────────
async def sectors_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    msg = await update.message.reply_text("🏭 Loading sector risk overview...")
    data = api_get("/api/sectors")

    if data is None:
        await msg.edit_text(
            "❌ Backend unreachable\\.\n"
            "Start: `cd backend && uvicorn main:app --reload --port 8000`",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    sectors: list = data if isinstance(data, list) else data.get("sectors", [])
    if not sectors:
        await msg.edit_text(
            "No sector data\\. Run `python scripts/precompute.py` first\\.",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    lines   = ["*🏭 SECTOR RISK OVERVIEW*\n_sorted by avg risk_\n"]
    buttons = []
    for s in sectors[:12]:
        sname = s.get("sector", "Unknown")
        avg   = s.get("avg_composite_score") or s.get("avg_score") or 0.0
        try:
            avg = float(avg)
        except (TypeError, ValueError):
            avg = 0.0
        count = s.get("company_count") or s.get("count") or 0
        lbl   = risk_label(avg)
        emj   = RISK_EMOJI.get(lbl, "⚪")
        lines.append(f"{emj} *{esc(sname)}* — avg `{avg:.0f}` \\({count} co\\.\\)")
        buttons.append([InlineKeyboardButton(f"{emj} {sname}", callback_data=f"sector:{sname}")])

    await msg.edit_text(
        trunc("\n".join(lines)),
        parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=InlineKeyboardMarkup(buttons),
    )

# ─────────────────────────────────────────────────────────────
# /top  — reads per-sector companies, no extra report calls
# ─────────────────────────────────────────────────────────────
async def top_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    msg = await update.message.reply_text("⚠️ Gathering highest\\-risk companies...", parse_mode=ParseMode.MARKDOWN_V2)

    sectors_data = api_get("/api/sectors")
    if sectors_data is None:
        await msg.edit_text("❌ Backend unreachable\\.", parse_mode=ParseMode.MARKDOWN_V2)
        return

    sectors_list: list = (
        sectors_data if isinstance(sectors_data, list)
        else sectors_data.get("sectors", [])
    )

    all_cos: list = []
    for s in sectors_list:
        sname   = s.get("sector", "")
        sec_cos = api_sector(sname)
        if not sec_cos:
            continue
        cos_list: list = (
            sec_cos if isinstance(sec_cos, list)
            else sec_cos.get("companies", [])
        )
        for c in cos_list:
            c.setdefault("sector", sname)
            all_cos.append(c)

    if not all_cos:
        await msg.edit_text(
            "No company data found\\. Run `precompute\\.py` first\\.",
            parse_mode=ParseMode.MARKDOWN_V2,
        )
        return

    def _score(c: dict) -> float:
        v = c.get("composite_score") or c.get("composite") or c.get("score") or 0
        try:
            return float(v)
        except (TypeError, ValueError):
            return 0.0

    top8    = sorted(all_cos, key=_score, reverse=True)[:8]
    lines   = ["*💀 TOP HIGH\\-RISK COMPANIES*\n"]
    buttons = []
    for i, c in enumerate(top8, 1):
        cid   = c.get("company_id", "")
        cname = c.get("company_name", cid)
        score = _score(c)
        sect  = c.get("sector", "")
        lbl   = risk_label(score)
        emj   = RISK_EMOJI.get(lbl, "⚪")
        lines.append(f"{i}\\. {emj} *{esc(cname[:24])}* `{score:.0f}` — _{esc(sect)}_")
        buttons.append([InlineKeyboardButton(f"📊 {cname[:30]}", callback_data=f"report:{cid}")])

    await msg.edit_text(
        trunc("\n".join(lines)),
        parse_mode=ParseMode.MARKDOWN_V2,
        reply_markup=InlineKeyboardMarkup(buttons),
    )

# ─────────────────────────────────────────────────────────────
# Inline button callback handler
# ─────────────────────────────────────────────────────────────
async def callback_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    query   = update.callback_query
    await query.answer()
    payload = query.data or ""

    if payload.startswith("report:"):
        cid = payload.split(":", 1)[1]
        await _send_report(query.message, cid)

    elif payload.startswith("score:"):
        cid  = payload.split(":", 1)[1]
        data = api_get(f"/api/report/{cid}")
        if data is None:
            await query.message.reply_text(
                f"❓ No data for `{esc(cid)}`\\.", parse_mode=ParseMode.MARKDOWN_V2
            )
            return
        sc    = extract_scores(data)
        comp  = sc["composite"]
        lbl   = risk_label(comp)
        emj   = RISK_EMOJI.get(lbl, "⚪")
        bar   = risk_bar(comp)
        cname = data.get("company_name", cid)
        text  = (
            f"{emj} `{esc(cname)}`\n"
            f"`{esc(bar)}`\n"
            f"• Beneish: `{esc(safe_float(sc['beneish']))}`\n"
            f"• Altman: `{esc(safe_float(sc['altman']))}`\n"
            f"• Ind\\-Adj Z: `{esc(safe_float(sc['adj_z']))}`\n"
            f"• Trend: `{esc(safe_float(sc['trend']))}`\n"
            f"• *Composite*: `{comp:.1f}`"
        )
        await query.message.reply_text(trunc(text), parse_mode=ParseMode.MARKDOWN_V2)

    elif payload.startswith("sector:"):
        # Strip any leftover escape chars that may have leaked in
        raw_sname = payload.split(":", 1)[1]
        sname     = raw_sname.replace("\\", "")
        sec_data  = api_sector(sname)

        if not sec_data:
            await query.message.reply_text(
                f"❓ No data for sector *{esc(sname)}*",
                parse_mode=ParseMode.MARKDOWN_V2,
            )
            return

        cos_list: list = (
            sec_data if isinstance(sec_data, list)
            else sec_data.get("companies", [])
        )
        lines   = [f"*🏭 {esc(sname)} — Companies*\n"]
        buttons = []
        for c in cos_list[:10]:
            cid     = c.get("company_id", "")
            cname   = c.get("company_name", cid)
            score_v = c.get("composite_score") or c.get("composite") or 0.0
            try:
                score_v = float(score_v)
            except (TypeError, ValueError):
                score_v = 0.0
            lbl = risk_label(score_v)
            emj = RISK_EMOJI.get(lbl, "⚪")
            lines.append(f"{emj} `{esc(cid)}` {esc(cname[:24])} — *{score_v:.0f}*")
            buttons.append([InlineKeyboardButton(f"📊 {cname[:30]}", callback_data=f"report:{cid}")])

        await query.message.reply_text(
            trunc("\n".join(lines)),
            parse_mode=ParseMode.MARKDOWN_V2,
            reply_markup=InlineKeyboardMarkup(buttons),
        )

# ─────────────────────────────────────────────────────────────
# Plain-text fallback — try as company ID, then search
# ─────────────────────────────────────────────────────────────
async def text_handler(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    text = (update.message.text or "").strip()
    if not text or text.startswith("/"):
        return

    # Short alphanum -> try direct report lookup first
    if len(text) <= 14 and re.fullmatch(r"[A-Za-z0-9&\-]+", text):
        cid  = text.upper()
        data = api_get(f"/api/report/{cid}")
        if data is not None and "detail" not in data:
            await _send_report(update.message, cid)
            return

    # Fallback: fuzzy search
    ctx.args = text.split()
    await search_cmd(update, ctx)

# ─────────────────────────────────────────────────────────────
# /status — backend health check
# ─────────────────────────────────────────────────────────────
# async def status_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
#     sectors = api_get("/api/sectors")
#     if sectors is None:
#         text = (
#             "❌ *Backend:* OFFLINE\n\n"
#             "Start with:\n"
#             "`cd backend && uvicorn main:app --reload --port 8000`"
#         )
#     else:
#         s_list: list = sectors if isinstance(sectors, list) else sectors.get("sectors", [])
#         total = sum(
#             int(s.get("company_count") or s.get("count") or 0)
#             for s in s_list
#         )
#     text = (
#     f"✅ *Backend:* ONLINE\n"
#     f"API URL: `{esc(API_BASE)}`\n"
#     f"Sectors loaded: *{len(s_list)}*\n"
#     f"Companies indexed: *{total}*\n\n"
#     f"Dashboard: `http://localhost:5173`\n"
#     f"API Docs: `{esc(API_BASE)}/docs`"
#     )
#     await update.message.reply_text(trunc(text), parse_mode=ParseMode.MARKDOWN_V2)
async def status_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    sectors = api_get("/api/sectors")

    if sectors is None:
        text = (
            "❌ *Backend:* OFFLINE\n\n"
            "Start with:\n"
            "`cd backend && uvicorn main:app --reload --port 8000`"
        )
    else:
        s_list: list = (
            sectors if isinstance(sectors, list)
            else sectors.get("sectors", [])
        )

        total = sum(
            int(s.get("company_count") or s.get("count") or 0)
            for s in s_list
        )

        text = (
            f"✅ *Backend:* ONLINE\n"
            f"API URL: `{esc(API_BASE)}`\n"
            f"Sectors loaded: *{len(s_list)}*\n"
            f"Companies indexed: *{total}*\n\n"
            f"Dashboard: `http://localhost:5173`\n"
            f"API Docs: `{esc(API_BASE)}/docs`"
        )

    await update.message.reply_text(trunc(text), parse_mode=ParseMode.MARKDOWN_V2)


# ─────────────────────────────────────────────────────────────
# /guide — scoring reference card
# ─────────────────────────────────────────────────────────────
GUIDE_TEXT = (
    "*📖 AuditGPT — Scoring Reference*\n\n"
    "*Risk Thresholds:*\n"
    "🟢 0\\-25 — Low\n"
    "🟡 26\\-50 — Medium\n"
    "🔴 51\\-75 — High\n"
    "💀 76\\-100 — Critical\n\n"
    "*Composite Weights:*\n"
    "• Beneish M\\-Score — 35%\n"
    "• Altman Z\\-Score — 30%\n"
    "• Industry\\-Adj Z — 25%\n"
    "• Trend Breaks — 10%\n\n"
    "*Beneish:* M \\> \\-2\\.22 means possible manipulator\n"
    "_Vars: DSRI, GMI, AQI, SGI, DEPI, SGAI, LVGI, TATA_\n\n"
    "*Altman:* Z \\< 1\\.81 = distress zone \\| Z \\> 2\\.99 = safe\n\n"
    "*Run Commands:*\n"
    "`cd backend && uvicorn main:app --reload --port 8000`\n"
    "`cd frontend && npm run dev`\n"
    "`python scripts/precompute.py`\n\n"
    "*API Endpoints:*\n"
    "`GET /api/sectors`\n"
    "`GET /api/sectors/{name}`\n"
    "`GET /api/search?q=`\n"
    "`GET /api/report/{id}`\n"
    "`GET /api/stream/{id}` \\(SSE\\)\n\n"
    "*Theme Colors:*\n"
    "🟩 `#00ff88` Low  🟨 `#ffb020` Medium\n"
    "🟥 `#ff4455` High  🔵 `#06b6d4` Cyan\n"
    "⬛ `#070b12` Background"
)

async def guide_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(GUIDE_TEXT, parse_mode=ParseMode.MARKDOWN_V2)

# ─────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────
def main() -> None:
    if TELEGRAM_TOKEN == "YOUR_BOT_TOKEN_HERE":
        print("❌  Set TELEGRAM_TOKEN in your .env file.")
        print("    Get a token from @BotFather on Telegram.")
        return

    app = Application.builder().token(TELEGRAM_TOKEN).build()

    app.add_handler(CommandHandler("start",   start))
    app.add_handler(CommandHandler("help",    help_cmd))
    app.add_handler(CommandHandler("search",  search_cmd))
    app.add_handler(CommandHandler("report",  report_cmd))
    app.add_handler(CommandHandler("score",   score_cmd))
    app.add_handler(CommandHandler("sectors", sectors_cmd))
    app.add_handler(CommandHandler("top",     top_cmd))
    app.add_handler(CommandHandler("status",  status_cmd))
    app.add_handler(CommandHandler("guide",   guide_cmd))
    app.add_handler(CallbackQueryHandler(callback_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_handler))

    print(f"🕵️   AuditGPT Bot running  |  API -> {API_BASE}")
    print("    Commands: /search /report /score /sectors /top /status /guide")
    app.run_polling(drop_pending_updates=True)

if __name__ == "__main__":
    main()
