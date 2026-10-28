#!/usr/bin/env python3
"""Push this application to the existing Manikumar09/ZoneSync repository.

Run from a terminal with internet access after signing in with gh auth login.
The repository already exists. This script never creates repositories or reads
token files. GitHub Pages will serve the application publicly.
"""

import json
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OWNER = "Manikumar09"
REPOSITORY = f"{OWNER}/ZoneSync"
REPOSITORY_URL = f"https://github.com/{REPOSITORY}"
SITE_URL = f"https://{OWNER.lower()}.github.io/ZoneSync/"


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

    # Verify the account and existing repository before changing local remotes.
    profile = json.loads(output("gh", "api", "user"))
    if profile["login"].lower() != OWNER.lower():
        raise SystemExit(f"Sign in to {OWNER} with gh auth switch or gh auth login.")
    repository = json.loads(output("gh", "api", f"repos/{REPOSITORY}"))
    if repository["full_name"].lower() != REPOSITORY.lower():
        raise SystemExit("GitHub returned a different repository. Publishing stopped.")
    if repository.get("archived") or not repository.get("permissions", {}).get("push"):
        raise SystemExit(f"You need write access to the active {REPOSITORY} repository.")
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
        if remote.stdout.strip().lower() not in {url.lower() for url in allowed}:
            raise SystemExit("The origin remote points elsewhere. It was left unchanged.")
    else:
        run("git", "remote", "add", "origin", REPOSITORY_URL + ".git")

    # No force push: existing remote history is protected from replacement.
    run("git", "push", "--set-upstream", "origin", "main")
    pages = run("gh", "api", f"repos/{REPOSITORY}/pages", capture=True, check=False)
    if pages.returncode == 0:
        run("gh", "api", "--method", "PUT", f"repos/{REPOSITORY}/pages", "-f", "build_type=workflow")
    elif "HTTP 404" in pages.stderr:
        run("gh", "api", "--method", "POST", f"repos/{REPOSITORY}/pages", "-f", "build_type=workflow")
    else:
        raise SystemExit(pages.stderr.strip() or "Could not read the GitHub Pages settings.")
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
