#!/usr/bin/env python3
"""Serve ZoneSync locally. No Python packages are needed."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Timer
import webbrowser


def main():
    """Start a local server and optionally open the default browser."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=0, help="Port number; 0 picks a free port.")
    parser.add_argument("--no-browser", action="store_true", help="Do not open a browser.")
    args = parser.parse_args()

    # Serve source so edits appear after refreshing, without a build step.
    source = Path(__file__).resolve().parent / "src"
    handler = partial(SimpleHTTPRequestHandler, directory=str(source))
    with ThreadingHTTPServer(("127.0.0.1", args.port), handler) as server:
        url = f"http://127.0.0.1:{server.server_port}/"
        print(f"ZoneSync is running at {url}\nPress Ctrl+C to stop.", flush=True)
        if not args.no_browser:
            timer = Timer(0.5, lambda: webbrowser.open(url))
            timer.daemon = True
            timer.start()
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
