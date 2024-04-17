const fs = require('fs').promises;
const path = require('path');
const fieldsTestFolderPath = '../cedar-test-artifacts/artifacts/fields';
const elementsTestFolderPath = '../cedar-test-artifacts/artifacts/elements';
const templatesTestFolderPath = '../cedar-test-artifacts/artifacts/templates'; // Add the templates folder path

async function generateTestCases() {
  let fieldTestCases = [];
  let fieldTestNumbers = [];
  let elementTestCases = [];
  let elementTestNumbers = [];
  let templateTestCases = []; // Add a new array for template test cases

  const subfoldersInFields = await fs.readdir(fieldsTestFolderPath, { withFileTypes: true });
  for (const dirent of subfoldersInFields) {
    if (dirent.isDirectory()) {
      const folderPath = path.join(fieldsTestFolderPath, dirent.name);
      const sourcePath = path.join(folderPath, `field-${dirent.name}.json`);
      fieldTestCases.push(sourcePath);
      fieldTestNumbers.push(parseInt(dirent.name, 10));
    }
  }

  const subfoldersInElements = await fs.readdir(elementsTestFolderPath, { withFileTypes: true });
  for (const dirent of subfoldersInElements) {
    if (dirent.isDirectory()) {
      const folderPath = path.join(elementsTestFolderPath, dirent.name);
      const sourcePath = path.join(folderPath, `element-${dirent.name}.json`);
      elementTestCases.push(sourcePath);
      elementTestNumbers.push(parseInt(dirent.name, 10));
    }
  }

  // Process the templates directory similarly
  const subfoldersInTemplates = await fs.readdir(templatesTestFolderPath, { withFileTypes: true });
  for (const dirent of subfoldersInTemplates) {
    if (dirent.isDirectory()) {
      //      if (dirent.name === '005') {
      const folderPath = path.join(templatesTestFolderPath, dirent.name);
      const sourcePath = path.join(folderPath, `template-${dirent.name}.json`); // Note the prefix change to "template-"
      templateTestCases.push(sourcePath);
      //      }
    }
  }

  function arrayToString(arr) {
    return '[\n  ' + arr.map((item) => `'${item}'`).join(',\n  ') + ',\n]';
  }

  function numberArrayToString(arr) {
    return '[\n  ' + arr.map((item) => `${item}`).join(',\n  ') + ',\n]';
  }

  // Use the arrayToString function for each test case type
  const content =
    `export const fieldTestCases: string[] = ${arrayToString(fieldTestCases)};\n` +
    `export const fieldTestNumbers: number[] = ${numberArrayToString(fieldTestNumbers)};\n` +
    `export const elementTestCases: string[] = ${arrayToString(elementTestCases)};\n` +
    `export const elementTestNumbers: number[] = ${numberArrayToString(elementTestNumbers)};\n` +
    `export const templateTestCases: string[] = ${arrayToString(templateTestCases)};\n`;
  await fs.writeFile('itest/resources/generatedTestCases.ts', content, { encoding: 'utf8' });
}

generateTestCases();
