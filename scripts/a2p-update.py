#!/usr/bin/env python3
"""
Sets the four A2P campaign fields that the Twilio console will not keep.

opt_in_keywords, opt_in_message, help_message and opt_out_message have saved as
null or stale on all three submissions to date. message_flow and description are
long free text and have always persisted from the console, so they are not
touched here.

The message strings are parsed out of src/lib/sms/auto-replies.ts rather than
copied, because what the campaign claims the number replies has to equal what the
number actually replies. One source of truth, no drift.

Usage, from the repo root:

    python3 scripts/a2p-update.py --check     read the stored values, change nothing
    python3 scripts/a2p-update.py             write the four fields

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
ENV_FILE = os.path.join(REPO_ROOT, ".env.local")

WATCHED = ["opt_in_keywords", "opt_in_message", "help_keywords",
           "help_message", "opt_out_keywords", "opt_out_message"]


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
        flag = "  <-- EMPTY" if not value else ""
        print(f"  {key}: {value!r}{flag}")


def main() -> None:
    sid, token = credentials()

    if "--check" in sys.argv:
        show(request(sid, token, None)["compliance"][0])
        return

    source = open(AUTO_REPLIES).read()

    fields = [
        ("OptInMessage", ts_const(source, "OPT_IN_MESSAGE")),
        ("HelpMessage", ts_const(source, "HELP_MESSAGE")),
        ("OptOutMessage", ts_const(source, "OPT_OUT_MESSAGE")),
    ]
    for keyword in ts_list(source, "OPT_IN_KEYWORDS"):
        fields.append(("OptInKeywords", keyword))
    for keyword in ts_list(source, "HELP_KEYWORDS"):
        fields.append(("HelpKeywords", keyword))
    for keyword in ts_list(source, "OPT_OUT_KEYWORDS"):
        fields.append(("OptOutKeywords", keyword))

    print("About to write these to campaign " + CAMPAIGN_SID + ":\n")
    for name, value in fields:
        print(f"  {name} = {value!r}")
    print("\nThis resubmits the campaign for carrier review.")
    if input("Type 'yes' to continue: ").strip() != "yes":
        sys.exit("Nothing sent.")

    show(request(sid, token, fields))
    print("\nAnything above marked EMPTY did not save. Do not assume it did.")


if __name__ == "__main__":
    main()
