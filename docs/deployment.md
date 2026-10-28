# GitHub deployment

## Current setup

The local codebase includes a GitHub Pages workflow. The intended repository is `Manikumar09/zonesync`. Repository creation, pushing, and live deployment must be verified on GitHub; having the workflow file locally does not make the site live.

The planned site address is:

```text
https://manikumar09.github.io/zonesync/
```

GitHub Pages serves the built website. GitHub Actions checks and publishes updates. The app does not need an Actions job running all day or your computer staying on. Access still depends on GitHub Pages, the visitor's internet connection, and the external map and search providers. No service guarantees uninterrupted access.

## Requirements

- Git, Node.js 22 or newer, npm, and Python 3.
- GitHub CLI (`gh`) signed in to `Manikumar09`.
- Internet access from the terminal.
- Permission to create repositories, push source, write Actions workflows, and configure Pages.
- A public repository for GitHub Pages on GitHub Free. The publishing script creates a public source repository and a public website.

No application API keys or repository secrets are required. The workflow uses GitHub's automatic token and a short-lived identity token for Pages.

## First publication

From the application directory, run:

```sh
gh auth login --hostname github.com
gh auth status
npm run check
npm test
npm run build
```

Use the browser or device login offered by GitHub CLI. Never paste tokens into the repository or a chat. If an existing CLI token cannot publish workflow files, refresh its authorization with the `workflow` scope using `gh auth refresh -h github.com -s workflow`.

Ensure your changes are committed on `main`. Configure your own Git commit name and email if they are not already set. Then run:

```sh
python3 scripts/publish_github.py
```

The script checks the account, branch, clean working tree, and source checks. It creates `Manikumar09/zonesync`, adds `origin`, pushes `main`, enables Pages with GitHub Actions as its source, sets the homepage, and starts the workflow. It refuses an unrelated origin and never force-pushes.

If a repository with that name already exists and no local origin has been set, the script stops so it cannot publish over an unrelated project. Inspect the existing repository before manually attaching its URL. If a prior attempt created the correct empty repository but stopped, add it as origin and run the script again:

```sh
git remote add origin https://github.com/Manikumar09/zonesync.git
python3 scripts/publish_github.py
```

Open the repository's Actions tab. Wait for **Check and deploy ZoneSync** to finish successfully, then follow the deployment URL. The planned address is not proof of successful publication.

## Manual alternative

Create a new public repository named `zonesync` under `Manikumar09`, without an initial README, license, or gitignore. From this folder run:

```sh
git remote add origin https://github.com/Manikumar09/zonesync.git
git push -u origin main
```

In the repository, open **Settings > Pages > Build and deployment**, and set **Source** to **GitHub Actions**. Then open **Actions > Check and deploy ZoneSync > Run workflow** on `main`. If the first push ran before Pages was enabled, this new run publishes the site.

## Later updates

Edit `src/` or the documentation. Run the checks, commit the changes, and push `main`:

```sh
npm run check
npm test
npm run build
git add src scripts tests docs README.md package.json .github launch.py .gitignore .editorconfig
git commit -m "Describe the change"
git push
```

Every push to `main` runs source checks, tests, and the build, then deploys `dist/`. Pull requests run the checks and build without deploying. You can also start a deployment with Run workflow. Failed checks prevent deployment. The existing live site remains available while a new build is checked.

The workflow grants source read access to the check job. Only the deployment job receives `pages: write` and `id-token: write`. It uploads only `dist/`, not the repository, local hosting files, or credentials.

## Verify a deployment

```sh
gh run list --repo Manikumar09/zonesync --workflow pages.yml
gh run view RUN_ID --repo Manikumar09/zonesync
gh api repos/Manikumar09/zonesync/pages --jq .html_url
```

Replace `RUN_ID` with an actual run ID from the list. Open the returned site URL and check city search, map selection, saved clocks, calculator output, timeline controls, and themes. A passed source check does not verify external map availability.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Cannot resolve or connect to github.com | Use a terminal with internet access; authentication changes will not fix blocked network access. |
| CLI authentication fails | Run `gh auth login --hostname github.com` and check `gh auth status`. |
| Push of workflow is rejected | Ensure the CLI authorization can write workflow files. |
| Pages configuration returns 404 | Enable Pages with Actions as the source, then run the workflow again. |
| Workflow deployment is denied | Check repository Actions policies, Pages availability, and github-pages environment rules. |
| Public URL returns 404 | Wait for a successful deployment and confirm the repository path and capitalization. |
| Map is blank but the page opens | Check the provider connection and browser console; this may be unrelated to Pages. |
| Changes do not appear | Check the latest Actions run, then hard-refresh the page. |

## Custom domain

No custom domain is configured for ZoneSync. Domain ownership, DNS configuration, a Pages custom-domain setting, and HTTPS verification are separate tasks. Use the GitHub Pages URL after deployment succeeds.

## References

- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Configure a Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
