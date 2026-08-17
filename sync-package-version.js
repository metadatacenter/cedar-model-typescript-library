const fs = require('node:fs');
const path = require('node:path');

const rootPackagePath = path.join(__dirname, 'package.json');
const distPackagePath = path.join(__dirname, 'package-dist.json');

const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
const distPackageText = fs.readFileSync(distPackagePath, 'utf8');
const distPackage = JSON.parse(distPackageText);

// The licence is checked rather than synchronised, because a mismatch here is a
// mistake in one of two files and only a person knows which. This exists because the
// two did disagree: the root manifest was corrected to `BSD-2-Clause` while
// `package-dist.json` — the one that becomes `dist/package.json` and is therefore the
// one published — kept the `ISC` an `npm init` had left, so the fix reached
// development and not a single consumer.
if (distPackage.license !== rootPackage.license) {
  throw new Error(
    `licence mismatch: package.json says ${JSON.stringify(rootPackage.license)}, ` +
      `package-dist.json says ${JSON.stringify(distPackage.license)}.\n` +
      '  package-dist.json is the manifest that publishes. Correct whichever is wrong.',
  );
}

if (distPackage.version !== rootPackage.version) {
  const updatedDistPackageText = distPackageText.replace(
    /("version"\s*:\s*")[^"]+("\s*,)/,
    `$1${rootPackage.version}$2`,
  );

  if (updatedDistPackageText === distPackageText) {
    throw new Error('Could not locate the version property in package-dist.json');
  }

  fs.writeFileSync(distPackagePath, updatedDistPackageText);
  console.log(`Synchronized package-dist.json to ${rootPackage.version}`);
}
