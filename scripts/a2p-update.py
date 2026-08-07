#!/usr/bin/env python3
"""
Writes the whole A2P campaign over the API, because the console loses fields.

opt_in_keywords, opt_in_message, help_message and opt_out_message saved as null
or stale on all three submissions to date. description and message_flow did
persist from the console, but they are set here too: the copy quotes three
strings that live in the app, and typing them by hand is how they drift.

Nothing in this file holds its own copy of any consumer-facing wording. It is
all parsed out of the source that produces it:

    CONSENT_TEXT          src/lib/validators/sms-opt-in.ts   the checkbox label
    OPT_IN_MESSAGE        src/lib/sms/auto-replies.ts        the START reply
    HELP_MESSAGE          src/lib/sms/auto-replies.ts        the HELP reply
    OPT_OUT_MESSAGE       src/lib/sms/auto-replies.ts        the STOP reply
    VOICE_CONSENT_SCRIPT  src/lib/voice/agent.ts             what the assistant says

So what the campaign claims happens is what actually happens. Change one of those
constants and rerun this, that is the only supported way to change the copy.

Usage, from the repo root:

    python3 scripts/a2p-update.py --check     read the stored values, change nothing
    python3 scripts/a2p-update.py --diff      render the copy locally, send nothing
    python3 scripts/a2p-update.py             write every field

Writing puts the campaign back into carrier review. Deploy the site first.
See docs/twilio-a2p-campaign.txt.
"""

import base64
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

MESSAGING_SERVICE_SID = "MGe358a0bc7abeb3d1d9785543fc713cdc"
CAMPAIGN_SID = "QE2c6890da8086d771620e9b13fadeba0b"

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUTO_REPLIES = os.path.join(REPO_ROOT, "src", "lib", "sms", "auto-replies.ts")
CONSENT_SRC = os.path.join(REPO_ROOT, "src", "lib", "validators", "sms-opt-in.ts")
VOICE_SRC = os.path.join(REPO_ROOT, "src", "lib", "voice", "agent.ts")
PORTFOLIO_SRC = os.path.join(REPO_ROOT, "src", "lib", "voice", "portfolio.ts")
CALLS_SRC = os.path.join(REPO_ROOT, "src", "lib", "services", "voice-calls.ts")
ENV_FILE = os.path.join(REPO_ROOT, ".env.local")

WATCHED = ["opt_in_keywords", "opt_in_message", "help_keywords",
           "help_message", "opt_out_keywords", "opt_out_message",
           "description", "message_flow"]

# Confirmed against the API 2026-08-03. Exceeding one of these is a 400, and the
# console silently truncates instead, which is worse.
LIMITS = {"Description": 4096, "MessageFlow": 2049, "OptInMessage": 320,
          "HelpMessage": 320, "OptOutMessage": 320}

# Three opt-in methods are ticked on the application profile, so three are
# described, each to the same depth. Describing the keyword path in one sentence
# beside two paragraphs is what drew 30917 on the third attempt.
DESCRIPTION = (
    "Alexander Grant is a software development consultancy. Prospective clients request examples "
    "of our previous work and we text them links to three portfolio websites. They request this in "
    "one of three ways: submitting the opt-in form at https://alexandergrant.app/sms, texting START "
    "to our published business number, or calling that number, where an automated assistant states "
    "the message terms and proceeds only if the caller agrees. Only people who supply their own "
    "number and actively agree are messaged, once per request. The same links are also printed on "
    "the opt-in page itself and can be emailed instead, so nobody has to accept text messages to "
    "get them. We separately send internal operational alerts to the business owner's own mobile "
    "number, which the owner configured himself."
)

# {consent}, {opt_in} and {voice} are filled from the app, never typed here.
MESSAGE_FLOW = """Consumers opt in in one of three ways. All three are described in full.

(1) Web form. At https://alexandergrant.app/sms, a public page with no login, the consumer enters their own mobile number and ticks a consent checkbox, unchecked by default, covering text messaging only. It reads: "{consent}" No message is sent unless it is ticked. Consent is optional: the same links are printed on that page and can be emailed instead, so nobody has to agree to messaging to get them.

(2) Text keyword. The consumer texts START to +1 771 253 3190. The keyword and number are published on that page. They immediately receive: "{opt_in}" The portfolio message follows. Texting the keyword is itself the consent.

(3) By phone. The consumer calls +1 771 253 3190. Before any number is taken the automated assistant says: "{voice}" It proceeds only if the caller agrees after hearing that, then reads the number back to confirm. Calls open with a recorded-call disclosure and the recording is the consent record.

Terms: https://alexandergrant.app/terms. Privacy: https://alexandergrant.app/privacy, which states mobile numbers are never sold, rented or shared with third parties for marketing. We store the consent wording, timestamp and origin of every opt-in. No numbers are purchased, rented or scraped."""


def ts_const(source: str, name: str) -> str:
    """Reassemble a single- or multi-line quoted string constant from the TS file."""
    match = re.search(rf"export const {name} =\s*(.+?)\n\n", source, re.S)
    if not match:
        sys.exit(f"Could not find {name} in {AUTO_REPLIES}. Has the file been reformatted?")
    parts = re.findall(r"'([^']*)'|\"([^\"]*)\"", match.group(1))
    value = "".join(single or double for single, double in parts)
    if not value:
        sys.exit(f"Parsed {name} as empty. Check the format of {AUTO_REPLIES}.")
    return value


def message_samples() -> list[str]:
    """
    Rebuild the two registered samples from the code that sends them.

    Carriers compare live traffic against these, so a sample that drifts from the
    sender is worse than no sample. Both templates are asserted rather than
    assumed: if either is edited, this stops instead of registering copy the
    number no longer sends. "Gregory" is the placeholder recipient in both.
    """
    portfolio = open(PORTFOLIO_SRC).read()
    template = (
        "`${greeting}here are a few things I've built:"
        "\\n\\n${links}\\n\\nAlex will follow up personally."
        "\\n\\nAlexander Grant\\nReply STOP to opt out.`"
    )
    if template not in portfolio:
        sys.exit(f"portfolioSms() in {PORTFOLIO_SRC} no longer matches sample #1. Update this script.")

    links = "\n".join(
        f"{label}: {url}"
        for label, url in re.findall(r"label: '([^']+)',\s*\n\s*url: '([^']+)'", portfolio)
    )
    if links.count("\n") != 2:
        sys.exit("Expected three portfolio items. Sample #1 would not match what is sent.")

    alert = "`Alexander Grant: new call from ${who}${business}${what}. Reply STOP to opt out.`"
    if alert not in open(CALLS_SRC).read():
        sys.exit(f"callAlertSms() in {CALLS_SRC} no longer matches sample #2. Update this script.")

    return [
        f"Hi Gregory, here are a few things I've built:\n\n{links}\n\n"
        "Alex will follow up personally.\n\nAlexander Grant\nReply STOP to opt out.",
        "Alexander Grant: new call from Gregory (children's art classes), "
        "wants an app for children's art classes. Reply STOP to opt out.",
    ]


def ts_list(source: str, name: str) -> list[str]:
    match = re.search(rf"export const {name} = \[(.+?)\]", source, re.S)
    if not match:
        sys.exit(f"Could not find {name} in {AUTO_REPLIES}.")
    return re.findall(r"'([^']+)'", match.group(1))


def credentials() -> tuple[str, str]:
    sid = os.environ.get("TWILIO_ACCOUNT_SID")
    token = os.environ.get("TWILIO_AUTH_TOKEN")
    if sid and token:
        return sid, token

    if not os.path.exists(ENV_FILE):
        sys.exit("Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN, or run from a checkout with .env.local")

    values = {}
    with open(ENV_FILE) as handle:
        for line in handle:
            if line.startswith(("TWILIO_ACCOUNT_SID=", "TWILIO_AUTH_TOKEN=")):
                key, _, value = line.partition("=")
                values[key] = value.strip().strip("\"'")

    try:
        return values["TWILIO_ACCOUNT_SID"], values["TWILIO_AUTH_TOKEN"]
    except KeyError as missing:
        sys.exit(f"{missing} not found in .env.local")


def request(sid: str, token: str, fields: list[tuple[str, str]] | None):
    url = f"https://messaging.twilio.com/v1/Services/{MESSAGING_SERVICE_SID}/Compliance/Usa2p"
    if fields is not None:
        url = f"{url}/{CAMPAIGN_SID}"

    req = urllib.request.Request(
        url,
        data=urllib.parse.urlencode(fields).encode() if fields is not None else None,
        headers={
            "Authorization": "Basic " + base64.b64encode(f"{sid}:{token}".encode()).decode(),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST" if fields is not None else "GET",
    )

    try:
        with urllib.request.urlopen(req) as response:
            return json.load(response)
    except urllib.error.HTTPError as err:
        body = err.read().decode()
        print(f"\nTwilio returned {err.code}:\n{body}\n", file=sys.stderr)
        if fields is not None:
            print(
                "If this says the campaign cannot be updated in its current state, STOP.\n"
                "Do not delete the campaign and create a new one, the vetting fee is charged\n"
                "once per campaign. Open a support ticket quoting " + CAMPAIGN_SID + " and the\n"
                "fact that opt_in_message and opt_in_keywords have failed to persist three times.",
                file=sys.stderr,
            )
        sys.exit(1)


def show(campaign: dict) -> None:
    print(f"campaign_status: {campaign.get('campaign_status')}")
    for key in WATCHED:
        value = campaign.get(key)
        shown = repr(value) if not value or len(repr(value)) <= 110 else repr(value)[:107] + "..."
        flag = "  <-- EMPTY" if not value else ""
        print(f"  {key}: {shown}{flag}")

    flow = campaign.get("message_flow") or ""
    if "alexandergrant.app/sms" not in flow:
        print("\n  <-- message_flow does not mention the opt-in page. That is a rejection.")

    for error in campaign.get("errors") or []:
        print(f"\n  error {error['error_code']} on {','.join(error['fields'])}: {error['description']}")


def build() -> list[tuple[str, str]]:
    """Assemble every field from the app's own constants."""
    source = open(AUTO_REPLIES).read()
    opt_in = ts_const(source, "OPT_IN_MESSAGE")

    message_flow = MESSAGE_FLOW.format(
        consent=ts_const(open(CONSENT_SRC).read(), "CONSENT_TEXT"),
        opt_in=opt_in,
        voice=ts_const(open(VOICE_SRC).read(), "VOICE_CONSENT_SCRIPT"),
    )

    fields = [
        # The four content flags are required on every update, not just at
        # creation: omitting them is a 400, and the API will not carry over the
        # stored values. Links is true because sample #1 carries three URLs.
        ("HasEmbeddedLinks", "true"),
        ("HasEmbeddedPhone", "false"),
        ("AgeGated", "false"),
        ("DirectLending", "false"),
        ("Description", DESCRIPTION),
        ("MessageFlow", message_flow),
        ("OptInMessage", opt_in),
        *[("MessageSamples", sample) for sample in message_samples()],
        ("HelpMessage", ts_const(source, "HELP_MESSAGE")),
        ("OptOutMessage", ts_const(source, "OPT_OUT_MESSAGE")),
    ]
    for keyword in ts_list(source, "OPT_IN_KEYWORDS"):
        fields.append(("OptInKeywords", keyword))
    for keyword in ts_list(source, "HELP_KEYWORDS"):
        fields.append(("HelpKeywords", keyword))
    for keyword in ts_list(source, "OPT_OUT_KEYWORDS"):
        fields.append(("OptOutKeywords", keyword))

    over = [f"{name} is {len(value)} characters, limit {LIMITS[name]}"
            for name, value in fields
            if name in LIMITS and len(value) > LIMITS[name]]
    if over:
        sys.exit("Too long to send:\n  " + "\n  ".join(over))

    return fields


def main() -> None:
    if "--check" in sys.argv:
        sid, token = credentials()
        show(request(sid, token, None)["compliance"][0])
        return

    fields = build()

    print("Campaign " + CAMPAIGN_SID + "\n")
    for name, value in fields:
        room = f"  [{len(value)}/{LIMITS[name]}]" if name in LIMITS else ""
        print(f"  {name}{room}\n    {value}\n")

    if "--diff" in sys.argv:
        print("Rendered only. Nothing sent.")
        return

    sid, token = credentials()
    print("This resubmits the campaign for carrier review.")
    if input("Type 'yes' to continue: ").strip() != "yes":
        sys.exit("Nothing sent.")

    show(request(sid, token, fields))
    print("\nAnything above marked EMPTY did not save. Do not assume it did.")


if __name__ == "__main__":
    main()
