const fs = require('fs');
const path = require('path');

const filePath01 = path.join(__dirname, 'test/templates/template-001.json');
const filePath02 = path.join(__dirname, 'test/templates/template-002.json');
const filePath03 = path.join(__dirname, 'test/templates/template-003.json');

module.exports = async () => {
  global.templateSource001 = fs.readFileSync(filePath01, 'utf8');
  global.templateObject001 = JSON.parse(global.templateSource001);

  const templateSource002 = fs.readFileSync(filePath02, 'utf8');
  global.templateObject002 = JSON.parse(templateSource002);

  const templateSource003 = fs.readFileSync(filePath03, 'utf8');
  global.templateObject003 = JSON.parse(templateSource003);
};
