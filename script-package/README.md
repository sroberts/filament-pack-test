# A Filament script package

Copy this folder to write a script transform: JavaScript that Filament runs
in its own sandbox, on the analyst's machine, reaching only the hosts its
manifest declares (spec §5.2). This one asks Verisign's RDAP service which
registrar a `.com` or `.net` domain is registered through.

## What is here

- `filament-package.json`: the package: its id, publisher, license, the
  sources it cites, and for each transform its manifest, module, and
  golden fixtures.
- `manifests/registrar.json`: the transform's contract. `capabilities`
  lists every host it may reach, and every secret with the hosts and the
  one header or auth scheme it goes in; Filament refuses everything else.
- `transforms/registrar.js`: `export default async function run(input,
  ctx)`. Requests go through `ctx.http`, results through
  `ctx.results()`; there is no `fetch`, no timers, and no imports outside
  the package.
- `fixtures/`: inputs and recorded responses in, expected entities and
  links out. They run offline.

## Making and checking it

From the Filament repository:

```sh
pnpm package -- test templates/script-package       # run the fixtures, offline
pnpm package -- keygen acme                         # acme.key (private) and acme.pub
pnpm package -- sign templates/script-package --key acme.key
pnpm package -- verify templates/script-package --public-key acme.pub
```

`verify` is the check the engine runs before it installs anything. Keep the
`.key` file out of the repository (`.gitignore` here does) and off any
machine that installs packages. Signing writes `SHA256SUMS` and
`SHA256SUMS.sig`; change any file afterwards and sign again.

For an unsigned package, which installs only in developer mode and marks
everything it produces, `pnpm package -- sums <dir>` writes `SHA256SUMS`
alone.

## Publishing it on GitHub

Commit the signed folder, tag the commit (`v1.0.0`), and push the tag. An
analyst adds your public key to their trust store once, then installs
`owner/repo@v1.0.0` (with the folder, if the package is not at the root)
from Filament's Packages settings. They see every host and secret it asks
for before it installs, and a newer tag reaches them only when they review
it and apply it.
