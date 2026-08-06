const fs = require('node:fs');
const path = require('node:path');

const rootPackagePath = path.join(__dirname, 'package.json');
const distPackagePath = path.join(__dirname, 'package-dist.json');

const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
const distPackageText = fs.readFileSync(distPackagePath, 'utf8');
const distPackage = JSON.parse(distPackageText);

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
