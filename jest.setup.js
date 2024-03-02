const fs = require('fs');
const path = require('path');

const filePath01 = path.join(__dirname, 'test/templates/template-001.json');
const filePath02 = path.join(__dirname, 'test/templates/template-002.json');
const filePath03 = path.join(__dirname, 'test/templates/template-003.json');
const filePath04 = path.join(__dirname, 'test/templates/template-004.json');
const filePath05 = path.join(__dirname, 'test/templates/template-005.json');
const filePath06 = path.join(__dirname, 'test/templates/template-006.json');
const filePath07 = path.join(__dirname, 'test/templates/template-007.json');
const filePath08 = path.join(__dirname, 'test/templates/template-008.json');

module.exports = async () => {
  global.templateSource001 = fs.readFileSync(filePath01, 'utf8');
  global.templateObject001 = JSON.parse(global.templateSource001);

  const templateSource002 = fs.readFileSync(filePath02, 'utf8');
  global.templateObject002 = JSON.parse(templateSource002);

  const templateSource003 = fs.readFileSync(filePath03, 'utf8');
  global.templateObject003 = JSON.parse(templateSource003);

  const templateSource004 = fs.readFileSync(filePath04, 'utf8');
  global.templateObject004 = JSON.parse(templateSource004);

  const templateSource005 = fs.readFileSync(filePath05, 'utf8');
  global.templateObject005 = JSON.parse(templateSource005);

  const templateSource006 = fs.readFileSync(filePath06, 'utf8');
  global.templateObject006 = JSON.parse(templateSource006);

  const templateSource007 = fs.readFileSync(filePath07, 'utf8');
  global.templateObject007 = JSON.parse(templateSource007);

  const templateSource008 = fs.readFileSync(filePath08, 'utf8');
  global.templateObject008 = JSON.parse(templateSource008);
};
