import { JSONTemplateReader } from './org/metadatacenter/reader/JSONTemplateReader';
import * as fs from 'fs';
import * as path from 'path';

const filePath04 = path.join(__dirname, '../test/templates/template-004.json');

const templateSource004 = fs.readFileSync(filePath04, 'utf8');

console.log('--------------------- original JSON file content:');
console.log(templateSource004);

const jsonTemplateReaderResult = JSONTemplateReader.readFromString(templateSource004);

console.log('--------------------- parsed JSON string:');
console.log(jsonTemplateReaderResult.template.asCedarTemplateString());
