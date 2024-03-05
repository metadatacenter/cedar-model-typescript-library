import { JSONTemplateReader } from './org/metadatacenter/reader/JSONTemplateReader';
import * as fs from 'fs';
import * as path from 'path';
import { ParsingResult } from './org/metadatacenter/model/cedar/util/compare/ParsingResult';
import { ObjectComparator } from './org/metadatacenter/model/cedar/util/compare/ObjectComparator';
import { Node } from './org/metadatacenter/model/cedar/util/types/Node';
import { CedarJsonPath } from './org/metadatacenter/model/cedar/util/path/CedarJsonPath';
import { Util } from './org/metadatacenter/model/cedar/util/Util';

const filePath004 = path.join(__dirname, '../test/templates/template-004.json');

const templateSource004 = fs.readFileSync(filePath004, 'utf8');
const templateObject004 = JSON.parse(templateSource004);

console.log('--------------------- original JSON file content:');
// console.log(templateSource009);

const jsonTemplateReaderResult = JSONTemplateReader.readFromObject(templateObject004);
console.log('--------------------- parsed JSON string:');
console.log(jsonTemplateReaderResult.template.asCedarTemplateJSONString());

const parsed = jsonTemplateReaderResult.template.asCedarTemplateJSONObject();

const parsingResult = new ParsingResult();
ObjectComparator.compareBothWays(parsingResult, templateObject004, parsed as Node, new CedarJsonPath());
Util.p(parsingResult);
// console.log(JSON.stringify(parsingResult, null, 2));
