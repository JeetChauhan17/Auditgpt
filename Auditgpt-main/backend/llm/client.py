"""
Gemini 1.5 Flash client for forensic narrative generation.
Uses in-context fraud knowledge base (no RAG needed — fits in 1M context).
"""

import json
import os

from google import genai
from dotenv import load_dotenv

load_dotenv()

# Knowledge base loaded once at module level
KNOWLEDGE_BASE_DIR = os.path.join(os.path.dirname(__file__), "knowledge_base")


def load_knowledge_base() -> str:
    """Load all fraud knowledge base documents into a single context string."""
    kb_parts = []
    if os.path.exists(KNOWLEDGE_BASE_DIR):
        for fname in sorted(os.listdir(KNOWLEDGE_BASE_DIR)):
            if fname.endswith((".txt", ".md")):
                with open(os.path.join(KNOWLEDGE_BASE_DIR, fname)) as f:
                    kb_parts.append(f"--- {fname} ---\n{f.read()}")
    return "\n\n".join(kb_parts)


KNOWLEDGE_BASE = load_knowledge_base()


def get_client():
    """Get configured Gemini client."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    return genai.Client(api_key=api_key)


def build_forensic_prompt(company_data: dict, scores: dict) -> str:
    """Build the prompt for forensic narrative generation."""
    company_name = company_data.get("company_name", "Unknown")
    sector = company_data.get("sector", "Unknown")
    composite = scores.get("composite_score", 0)
    risk_level = scores.get("risk_level", "Unknown")
    beneish = scores.get("beneish", {})
    altman = scores.get("altman", {})
    red_flags = scores.get("red_flags", [])
    breakdown = scores.get("breakdown", {})

    # Format red flags
    flags_text = ""
    for i, flag in enumerate(red_flags[:10], 1):
        flags_text += f"\n{i}. [{flag['severity']}] {flag['flag_type']}"
        if flag.get("evolution"):
            flags_text += f" — {flag['evolution'][0]}"

    # Format financial summary
    pl = company_data.get("profit_loss", {})
    revenue_data = pl.get("Sales", {})
    np_data = pl.get("Net Profit", {})

    prompt = f"""You are AuditGPT, an AI forensic accounting analyst. Generate a detailed forensic narrative report for the following company.

## FRAUD KNOWLEDGE BASE
{KNOWLEDGE_BASE if KNOWLEDGE_BASE else "No knowledge base loaded."}

## COMPANY ANALYSIS

**Company:** {company_name}
**Sector:** {sector}
**Composite Fraud Risk Score:** {composite}/100 ({risk_level})

### Quantitative Findings

**Beneish M-Score:** {beneish.get('m_score', 'N/A')}
- Manipulation likely: {beneish.get('manipulation_likely', 'N/A')}
- Components: {json.dumps(beneish.get('components', {}), indent=2)}

**Altman Z-Score:** {altman.get('z_score', 'N/A')}
- Zone: {altman.get('zone', 'N/A')}

**Score Breakdown:**
- Beneish normalized: {breakdown.get('beneish_normalized', 'N/A')}
- Altman normalized: {breakdown.get('altman_normalized', 'N/A')}
- Industry Z normalized: {breakdown.get('industry_z_normalized', 'N/A')}
- Trend break normalized: {breakdown.get('trend_break_normalized', 'N/A')}

**Red Flags ({len(red_flags)} detected):**{flags_text}

**Revenue Trend:** {json.dumps(dict(sorted(revenue_data.items())[-5:]), indent=2) if revenue_data else 'N/A'}
**Net Profit Trend:** {json.dumps(dict(sorted(np_data.items())[-5:]), indent=2) if np_data else 'N/A'}

## INSTRUCTIONS

Write a forensic narrative that:
1. Opens with a 1-sentence risk assessment summary
2. Explains each quantitative finding in plain language, citing specific years and values
3. Compares patterns to known fraud cases (especially Satyam if relevant)
4. Provides industry-specific context for each anomaly — DO NOT use generic thresholds
5. Identifies the most concerning pattern and explains WHY it's concerning
6. Concludes with a risk outlook and what to watch for

CRITICAL: Every anomaly MUST be benchmarked against {sector} industry norms. Generic alerts are unacceptable.

Write in a professional, analytical tone. Use specific numbers. Be direct about concerns but avoid sensationalism. If the company appears healthy, say so clearly.

Maximum length: 800 words.
"""
    return prompt


def generate_narrative(company_data: dict, scores: dict) -> str:
    """Generate forensic narrative using Gemini."""
    client = get_client()
    if not client:
        return _fallback_narrative(company_data, scores)

    prompt = build_forensic_prompt(company_data, scores)

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return response.text
    except Exception as e:
        print(f"Gemini API error: {e}")
        return _fallback_narrative(company_data, scores)


def generate_narrative_stream(company_data: dict, scores: dict):
    """Generate forensic narrative with streaming. Yields text chunks."""
    client = get_client()
    if not client:
        yield _fallback_narrative(company_data, scores)
        return

    prompt = build_forensic_prompt(company_data, scores)

    try:
        for chunk in client.models.generate_content_stream(
            model="gemini-1.5-flash",
            contents=prompt,
        ):
            if chunk.text:
                yield chunk.text
    except Exception as e:
        print(f"Gemini streaming error: {e}")
        yield _fallback_narrative(company_data, scores)


def _fallback_narrative(company_data: dict, scores: dict) -> str:
    """Generate a basic narrative without LLM when API is unavailable."""
    name = company_data.get("company_name", "This company")
    sector = company_data.get("sector", "its sector")
    composite = scores.get("composite_score", 0)
    risk = scores.get("risk_level", "Unknown")
    beneish = scores.get("beneish", {})
    altman = scores.get("altman", {})
    flags = scores.get("red_flags", [])

    parts = [f"**{name}** receives a composite fraud risk score of {composite}/100 ({risk})."]

    m = beneish.get("m_score")
    if m is not None:
        if beneish.get("manipulation_likely"):
            parts.append(f"The Beneish M-Score of {m} exceeds the -1.78 threshold, suggesting potential earnings manipulation.")
        else:
            parts.append(f"The Beneish M-Score of {m} is below the -1.78 threshold, indicating no strong evidence of earnings manipulation.")

    z = altman.get("z_score")
    if z is not None:
        parts.append(f"The Altman Z-Score of {z} places the company in the {altman.get('zone', 'unknown')} zone.")

    if flags:
        parts.append(f"\n{len(flags)} red flags were detected:")
        for flag in flags[:5]:
            parts.append(f"- [{flag['severity']}] {flag['flag_type']}")

    parts.append(f"\nAll findings are benchmarked against {sector} industry peers.")

    return "\n\n".join(parts)
