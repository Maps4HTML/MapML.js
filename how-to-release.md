# Release Guide
**Publishing packages to npmjs.com / NPM**

In `package.json` verify the name and update the version.

```json
{
    "name": "@maps4html/mapml",
    "version":  "X.X.X",
    ...
    "files": [
      "dist",
      "LICENSE.md",
      "README.md",
      "CONTRIBUTING.md",
      "RELEASE-NOTES-0.18.0.md"
    ]
}
```

Keep the `files` array as an explicit allowlist. Do **not** delete it: with no
`files` field, npm publishes the entire repo minus standard ignores (`src/`,
`test/`, configs, etc.), which bloats the package and leaks dev files. Avoid
globs like `"*.md"` here — they can sweep in transient files (e.g. per-release
notes) you did not intend to ship. Add a new entry only when a file genuinely
needs to ship, and prefer stable filenames over version-specific ones.

Release notes are **not** shipped in the npm tarball — they live on the GitHub
release (see "Preparing release notes" below), so there is nothing to add here
for them.

Note that when releasing on npm, you are distributing leaflet, proj4 etc., so 
you need to distribute the text of their licenses with the dist folder.

Verify the exact contents of the tarball before publishing:
```bash
npm pack --dry-run
```

Open the command prompt and cd into the MapML.js project directory.

Type in –
```bash
npm login
```
– fill in your NPM credentials, then publish using:
```bash
npm publish --access=public
```
When it publishes successfully you should see:
```bash
+@maps4html/mapml@X.X.X
```

**Preparing release notes**

Release notes live on the GitHub release, not in the repo or the npm package.
To write them ahead of time and still be able to edit before publishing, draft
them in a local, **uncommitted** scratch file (any name, e.g.
`RELEASE-NOTES-X.Y.Z.md`). Seed the file from the commit history since the last tag, 
replacing `<previous-tag>` with the actual prior release tag (e.g. `v0.18.0`):

```bash
git log <previous-tag>..HEAD --pretty=format:'- %s (%h, %an)'
```

**GitHub release procedure**

Create the release from the canonical `Maps4HTML/MapML.js` repository so the tag
and release are authoritative. Two options:

_Via the web UI:_ visit the [release page](https://github.com/Maps4HTML/MapML.js/releases)
and click `Draft a new release`. In the `Choose a tag` dropdown, type the new
`vX.Y.Z` tag (GitHub creates it on publish), set the target to the merged
release commit on `main`, paste in your notes, and publish.

**Publishing packages to GitHub**

Create a personal access (classic) token on [GitHub](https://github.com/settings/tokens/new)
and check `write:packages` and `delete:packages`.

Open the command prompt and cd into the MapML.js project directory. Enter:
```bash
npm login --scope=@Maps4HTML --registry=https://npm.pkg.github.com
``` 
For the credentials, enter:
```bash
Username: GitHub username
Password: Personal access token
Email: GitHub email
```
In `package.json`, add: 
```json
"publishConfig": {
  "registry":"https://npm.pkg.github.com"
},
```
Publish to GitHub using:
```bash
npm publish
```
When it publishes successfully you should see:
```bash
+@maps4html/mapml@X.X.X
```
Now `"publishConfig"` can be removed from `package.json`.