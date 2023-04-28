# Release Guide
** Licenses

Copy the LICENSE.md file to dist
Replace the URLs to dependency license text files with the text in those files
(There should be a grunt task to do this automatically, but it's not there yet)

**Publishing packages to NPM**

In `package.json` verify the name and update the version. Add additional files
if needed.

```json
{
    "name": "@maps4html/web-map-custom-element",
    "version":  "X.X.X",
    ...
    "files": [
      "dist",
      "*.md",
      "Add more here if needed"
    ]
}
```
Open the command prompt and cd into the Web-Map-Custom-Element project directory.

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
+@maps4html/web-map-custom-element@X.X.X
```

**GitHub release procedure**

To create a new release on GitHub, visit the [release page](https://github.com/Maps4HTML/Web-Map-Custom-Element/releases),
then click `Draft a new release`.

Enter the new release version in the `Choose a tag` dropdown, fill in the title and description 
if needed, and then publish the release.

**Publishing packages to GitHub**

Create a personal access token on [GitHub](https://github.com/settings/tokens/new)
and check `write:packages` and `delete:packages`.

Open the command prompt and cd into the Web-Map-Custom-Element project directory. Enter:
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
+@maps4html/web-map-custom-element@X.X.X
```
Now `"publishConfig"` can be removed from `package.json`.