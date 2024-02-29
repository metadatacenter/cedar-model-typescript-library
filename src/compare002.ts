import { JSONTemplateReader } from './org/metadatacenter/reader/JSONTemplateReader';
import * as fs from 'fs';
import * as path from 'path';
import { ObjectComparator } from './org/metadatacenter/model/cedar/compare/ObjectComparator';
import { ParsingResult } from './org/metadatacenter/model/cedar/compare/ParsingResult';
import { CedarJsonPath } from './org/metadatacenter/model/cedar/path/CedarJsonPath';
import { Node } from './org/metadatacenter/model/cedar/types/Node';

const filePath02 = path.join(__dirname, '../test/templates/template-002.json');

const templateSource002 = fs.readFileSync(filePath02, 'utf8');
const templateObject002 = JSON.parse(templateSource002);

const jsonTemplateReaderResult = JSONTemplateReader.readFromObject(templateObject002);

const parsed = jsonTemplateReaderResult.template.asCedarTemplateJSONObject();

const parsingResult = new ParsingResult();
ObjectComparator.compare(parsingResult, templateObject002, parsed as Node, new CedarJsonPath());
console.log(JSON.stringify(parsingResult, null, 2));
