const fs = require('fs').promises;
const path = require('path');
const fieldsTestFolderPath = '../cedar-test-artifacts/artifacts/fields';
const elementsTestFolderPath = '../cedar-test-artifacts/artifacts/elements';
const templatesTestFolderPath = '../cedar-test-artifacts/artifacts/templates';
const ceeSuiteTestFolderPath = '../cedar-test-artifacts/artifacts/cee-suite';

async function generateTestCases() {
  let fieldTestNumbers = [];
  let elementTestNumbers = [];
  let templateTestNumbers = [];
  let ceeSuiteTestMap = {};

  const subfoldersInFields = await fs.readdir(fieldsTestFolderPath, { withFileTypes: true });
  for (const dirent of subfoldersInFields) {
    if (dirent.isDirectory()) {
      fieldTestNumbers.push(parseInt(dirent.name, 10));
    }
  }

  const subfoldersInElements = await fs.readdir(elementsTestFolderPath, { withFileTypes: true });
  for (const dirent of subfoldersInElements) {
    if (dirent.isDirectory()) {
      elementTestNumbers.push(parseInt(dirent.name, 10));
    }
  }

  // Process the templates directory similarly
  const subfoldersInTemplates = await fs.readdir(templatesTestFolderPath, { withFileTypes: true });
  for (const dirent of subfoldersInTemplates) {
    if (dirent.isDirectory()) {
      templateTestNumbers.push(parseInt(dirent.name, 10));
    }
  }

  const subfoldersInCEESuite = await fs.readdir(ceeSuiteTestFolderPath, { withFileTypes: true });
  for (const dirent of subfoldersInCEESuite) {
    if (dirent.isDirectory()) {
      const dirName = dirent.name;
      const map = {
        template: false,
        instance: false,
      };

      const subfolderPath = path.join(ceeSuiteTestFolderPath, dirName);
      const filesInSubfolder = await fs.readdir(subfolderPath);

      const expectedTemplateFile = `template-${dirName}.json`;
      const expectedInstanceFile = `instance-${dirName}.json`;

      map.template = filesInSubfolder.includes(expectedTemplateFile);
      map.instance = filesInSubfolder.includes(expectedInstanceFile);

      ceeSuiteTestMap[parseInt(dirName, 10)] = map;
    }
  }
  function numberArrayToString(arr) {
    return '[\n  ' + arr.map((item) => `${item}`).join(',\n  ') + ',\n]';
  }

  let ceeJsonString = JSON.stringify(ceeSuiteTestMap, null, 2);
  ceeJsonString = ceeJsonString.replace(/\"/g, "'");
  ceeJsonString = ceeJsonString.replace(/\'template\'/g, 'template');
  ceeJsonString = ceeJsonString.replace(/\'instance\'/g, 'instance');
  ceeJsonString = ceeJsonString.replace(/true\n/g, 'true,\n');
  ceeJsonString = ceeJsonString.replace(/false\n/g, 'false,\n');
  ceeJsonString = ceeJsonString.replace(/\}\n/g, '},\n');

  // Use the arrayToString function for each test case type
  const content =
    `export const fieldTestNumbers: number[] = ${numberArrayToString(fieldTestNumbers)};\n` +
    `export const elementTestNumbers: number[] = ${numberArrayToString(elementTestNumbers)};\n` +
    `export const templateTestNumbers: number[] = ${numberArrayToString(templateTestNumbers)};\n` +
    `export const ceeSuiteTestMap = ${ceeJsonString};\n`;
  await fs.writeFile('itest/resources/generatedTestCases.ts', content, { encoding: 'utf8' });
}

generateTestCases();
