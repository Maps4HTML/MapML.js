# Release Guide
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
– fill in your credentials, then publish using:
```bash
npm publish --access=public
```
When it publishes successfully you should see:
```bash
+@maps4html/web-map-custom-element@X.X.X
```

