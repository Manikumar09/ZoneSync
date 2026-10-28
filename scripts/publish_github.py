#!/usr/bin/env python3
"""Publish this application to Manikumar09/zonesync and enable GitHub Pages.

Run from a terminal with internet access after signing in with gh auth login.
The repository and website will be public. This script never reads token files.
"""

import json
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OWNER = "Manikumar09"
REPOSITORY = f"{OWNER}/zonesync"
REPOSITORY_URL = f"https://github.com/{REPOSITORY}"
SITE_URL = f"https://{OWNER.lower()}.github.io/zonesync/"


def run(*arguments, capture=False, check=True):
    """Run commands without a shell; fail immediately on unexpected errors."""
    return subprocess.run(
        arguments, cwd=ROOT, text=True, capture_output=capture, check=check
    )


def output(*arguments):
    return run(*arguments, capture=True).stdout.strip()


def main():
    for command in ("git", "gh", "npm"):
        if not shutil.which(command):
            raise SystemExit(f"Install {command} before publishing.")

    # Confirm the account before creating any remote resources.
    profile = json.loads(output("gh", "api", "user"))
    if profile["login"].lower() != OWNER.lower():
        raise SystemExit(f"Sign in to {OWNER} with gh auth switch or gh auth login.")
    if output("git", "branch", "--show-current") != "main":
        raise SystemExit("Switch to the main branch before publishing.")
    if output("git", "status", "--porcelain"):
        raise SystemExit("Commit your source changes before publishing.")
    run("git", "rev-parse", "--verify", "HEAD", capture=True)

    for command in (("npm", "run", "check"), ("npm", "test"), ("npm", "run", "build")):
        run(*command)

    remote = run("git", "remote", "get-url", "origin", capture=True, check=False)
    if remote.returncode == 0:
        allowed = {REPOSITORY_URL, REPOSITORY_URL + ".git", f"git@github.com:{REPOSITORY}.git"}
        if remote.stdout.strip() not in allowed:
            raise SystemExit("The origin remote points elsewhere. It was left unchanged.")
    else:
        existing = run("gh", "repo", "view", REPOSITORY, capture=True, check=False)
        if existing.returncode == 0:
            raise SystemExit(
                f"{REPOSITORY} already exists. Check it before adding its URL as origin."
            )
        run(
            "gh", "repo", "create", REPOSITORY, "--public", "--source", str(ROOT),
            "--remote", "origin", "--description",
            "ZoneSync: world clocks, an interactive timezone map, and time planning tools."
        )

    # No force push: existing remote history is protected from replacement.
    run("git", "push", "--set-upstream", "origin", "main")
    pages = run("gh", "api", f"repos/{REPOSITORY}/pages", capture=True, check=False)
    if pages.returncode == 0:
        run("gh", "api", "--method", "PUT", f"repos/{REPOSITORY}/pages", "-f", "build_type=workflow")
    else:
        run("gh", "api", "--method", "POST", f"repos/{REPOSITORY}/pages", "-f", "build_type=workflow")
    run("gh", "repo", "edit", REPOSITORY, "--homepage", SITE_URL)
    # Start a fresh run in case the first push arrived before Pages was enabled.
    run("gh", "workflow", "run", "pages.yml", "--repo", REPOSITORY, "--ref", "main")
    print(f"Repository: {REPOSITORY_URL}")
    print(f"Deployment progress: {REPOSITORY_URL}/actions")
    print(f"Website after a successful deployment: {SITE_URL}")
    print("Check the Actions result before treating the website as live.")


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as error:
        if error.stderr:
            print(error.stderr.strip(), file=sys.stderr)
        raise SystemExit("Publishing stopped. Fix the reported error and run the script again.")
