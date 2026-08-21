# Releasing

The whole release, end to end. Every step is a command you can paste; the notes
explain why the order is what it is, because two of the steps went wrong in 1.0.1
and the order is what prevents them going wrong again.

Substitute the version you are cutting for `1.0.2` throughout.

## Before you start

You need to be logged in to npm as `metadatacenter`:

```shell
npm whoami
```

If that does not print `metadatacenter`, log in. 2FA makes an interactive login
awkward, so the usual route is a token:

1. `npm login` — opens a browser. Username `metadatacenter`, password from
   KeePassX, OTP from the `metadatacenter@gmail.com` inbox.
2. Generate a granular access token at
   <https://www.npmjs.com/settings/metadatacenter/tokens> with
   **Packages and scopes → Permissions → Read and Write** for all packages. A
   token bypasses the 2FA prompt on publish.
3. Put it in `~/.npmrc`:

   ```
   //registry.npmjs.org/:_authToken=<TOKEN_HERE>
   ```

Use the Node version `.nvmrc` names. CI pins it, and it is the runtime the
published tarball should be built on:

```shell
node -v          # must match .nvmrc
```

Node 24.19.0 is installed through Homebrew, but it is not the shell default —
`.zshrc` puts `node@26` first on `PATH`. Prefix it for the release:

```shell
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
```

Homebrew's other `node@NN` opt paths on this machine are symlinks to whatever
single `node` keg happens to be installed, so `node@25/bin/node` may well report
v26. Trust the version the binary prints, not the path it came from.

## Cut the release

### 1. Bump the version, on `develop`

```shell
git checkout develop
git pull
npm version 1.0.2 --no-git-tag-version
```

Use `npm version`, not an editor. It runs this repository's `version` script,
which propagates the number into `package-dist.json` — the manifest consumers
actually receive — and fails the build later if the two disagree on the licence.
`--no-git-tag-version` is deliberate: the tag is created at the end, on `main`,
against the commit that was really published.

### 2. Run the gate

```shell
npm test && npm run lint && npm run typecheck
npm run parity:yaml && npm run parity:json
npm run test:package
```

This is what CI runs, in the same order. `test:package` builds the real tarball,
installs it into a throwaway project and exercises CommonJS, ESM and the shipped
declarations, so it is the one that catches a packaging mistake.

If a YAML reference test fails with the fixture quoted (`type: "text-field"`) and
the output plain (`type: text-field`), the working tree is half-updated — `src/`
from one branch, `itest/resources/` fixtures from another. That is a stale tree,
not a real failure. Let any checkout or merge finish and run it again.

### 3. Commit and open the pull request

```shell
git commit -am 'Prepare release 1.0.2'
git push
gh pr create --base main --head develop --title "Release 1.0.2" --body "..."
```

### 4. Merge it, and confirm `main` actually moved

```shell
gh pr merge --merge
git checkout main
git pull
git log -1 --oneline
```

Confirm that last line is the merge commit you just made.

**This is where 1.0.1 went wrong.** Merging was a manual step with nothing after
it to check the result. When the merge had not happened, `git checkout main &&
git pull` still succeeded and quietly handed back the _previous_ release's
`main`; the tag in step 7 then landed on the 1.0.0 commit, and nothing
complained. Read the commit before you go on.

### 5. Publish, from `main`

```shell
npm run publish:package
```

Publish from `main`, after the merge — not from `develop` before it. That is what
makes the tarball on npm and the commit you tag in step 7 the same code.

`publish:package` publishes **the `dist` directory**, not the repository root.
Both succeed, and they produce different packages: the root `package.json`
declares `main: "dist/index.js"` and no `module`, while `dist/package.json` (a
copy of `package-dist.json`) declares `main: "index.js"` and `module:
"index.esm.js"`. 1.0.1 was published from the root — it works, but it reached
bundlers without its ESM entry point and could not be tree-shaken, and it carried
the development README and every devDependency into the consumer manifest. Use
the script and this cannot happen: there is no `cd` to lose.

Write the path as `./dist`, never a bare `dist`. npm 11 reads `npm publish dist`
as a _registry spec_ rather than a folder: it fetches the unrelated package named
`dist` from the registry and tries to publish that, failing with the baffling
`You cannot publish over the previously published versions: 0.1.2`. The `./` is
what makes npm treat it as a directory.

To see exactly what will go out before it does:

```shell
npm publish ./dist --access public --dry-run
```

Expect `cedar-model-typescript-library@1.0.2` and roughly 850 files. Any other
name means the manifest is wrong; `dist@0.1.2` means the `./` went missing.

### 6. Check what actually landed

```shell
npm view cedar-model-typescript-library@1.0.2 name version main module license
```

Expect the unscoped name, `main: index.js`, `module: index.esm.js`, and
`BSD-2-Clause`. A scoped name or a `dist/`-prefixed `main` means step 5 published
the wrong thing.

### 7. Tag and publish the release

```shell
git tag release-1.0.2
git push origin release-1.0.2
gh release create release-1.0.2 --title "Release 1.0.2" --notes "### What's New

- ..."
```

### 8. Put `develop` back in step with `main`

```shell
git checkout develop
git merge --ff-only main
git push
```

Do not skip this. Leaving it out is how `develop` and `main` came to be eighty
commits apart before 1.0.1, which is what made that release awkward to reason
about in the first place.

## The package name

This library publishes as **`cedar-model-typescript-library`**, unscoped. Every
release from 0.1.0 onward has. `package-dist.json` has twice been changed to
`@org.metadatacenter/cedar-model-typescript-library`, which does not exist on the
registry; a release published under it would be invisible to everyone already
depending on the unscoped name. The smoke test reads the name out of that same
manifest, so it cannot catch the switch — only step 6 can.
