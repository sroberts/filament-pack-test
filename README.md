# A Filament transform pack on GitHub

Copy this folder into a new repository to publish transforms that a class
transform server loads straight from GitHub (spec §5.7). The server pins one
commit, checks every file at each load, and moves to a newer version only
when the instructor reviews it and applies it.

## What is here

- `filament-pack.json`: the file the server looks for. It names the module
  that exports `pack`, and the TypeScript to build it from.
- `src/pack.ts`: the pack: its sources, the provider keys it reads, and its
  transforms. Edit the manifest and the handler; keep the `pack` export.
- `package.json` and `package-lock.json`: the server builds only with a
  lockfile, and installs exactly what it pins, with install scripts off.
- `.github/workflows/build.yml`: builds the pack on every push the way the
  server will, so a broken build shows here first.

## Publishing a version

Tag a commit, for example `v1.0.0`, and push the tag. The instructor adds
the repository as `owner/repo@v1.0.0` on the admin page's Repositories
section, or with `filament-transforms repos add owner/repo@v1.0.0`. For the
next release, tag again: the instructor sees the new tag under **Check for
updates**, reviews what changes for students, and applies it.

Tags are compared as versions, so `v1.10.0` comes after `v1.9.0`.

## Building it yourself instead

The server builds `src/pack.ts` when `dist/pack.mjs` is not in the commit.
To ship a build instead, run the workflow's two commands, commit
`dist/pack.mjs` (remove `dist/` from `.gitignore`), and the server loads it
as committed. Either way the code runs on the class server with the provider
keys the pack declares: keep dependencies few and read what you add.

## Private repositories

The instructor gives the server a fine-grained GitHub token with read-only
**Contents** access to this repository alone. The server keeps it with its
provider keys, under a name starting `GITHUB_TOKEN`, which no pack can
declare.
