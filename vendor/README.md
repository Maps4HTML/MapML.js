# Vendored dependencies

These packages are build-time (dev) dependencies that are bundled into
`dist/` by Rollup. They are kept here because `media-query-solver` was
unpublished from the npm registry on 2026-09-30, which broke `npm ci`.
`media-query-parser` is by the same author and is vendored pre-emptively.

| Package | Version | Original npm tarball integrity | Source |
|---|---|---|---|
| `media-query-parser` | 3.0.2 | `sha512-3WLXSFQZVuo1d9xpt72Ul0khXy72qgtz1KqDBO6KbmyvMsBsQRcePhYYR2U5QBSOz/u5pb5zj2s2FmgJe8jaTw==` | [prushforth/media-query-parser](https://github.com/prushforth/media-query-parser) (fork of `tmgldn/media-query-parser`) |
| `media-query-solver` | 0.1.3 | `sha512-OkL4tpvexcAOG09rNdbAO1MebJzRa2s0RK7hTO9gVAL1jefbm6rLG9jcRYbwO1M3N8UGhHymMtOXK2ciDy3r8w==` | [prushforth/media-query-solver](https://github.com/prushforth/media-query-solver) (fork of `tmgldn/media-query-solver`) |

Each directory is the unmodified contents of the published npm tarball
(verified against the integrity hashes above), except that the
development-only fields (`scripts`, `devDependencies`, `simple-git-hooks`,
`prettier`, `lint-time`, `jest`) were removed from `package.json`. Without
that, npm would install the packages' own dev tooling and run their
`prepare` script when resolving the `file:` dependencies.

Both packages are MIT licensed; see the `LICENSE` file in each directory, and the entry in the MapML.js LICENSE.md file.
