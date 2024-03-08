import { JSONTemplateReader } from './org/metadatacenter/io/reader/JSONTemplateReader';
import * as fs from 'fs';
import * as path from 'path';
import { CedarWriters } from './org/metadatacenter/io/writer/CedarWriters';
import { JSONTemplateWriter } from './org/metadatacenter/io/writer/JSONTemplateWriter';
import { YAMLTemplateWriter } from './org/metadatacenter/io/writer/YAMLTemplateWriter';

const filePath004 = path.join(__dirname, '../test/resources/templates/004/template-004.json');

const templateSource004 = fs.readFileSync(filePath004, 'utf8');

// console.log('--------------------- original JSON file content:');
// console.log(templateSource004);

const reader: JSONTemplateReader = JSONTemplateReader.getStrict();
const jsonTemplateReaderResult = reader.readFromString(templateSource004);

const writers: CedarWriters = CedarWriters.getStrict();
const jsonWriter: JSONTemplateWriter = writers.getJSONTemplateWriter();
const yamlWriter: YAMLTemplateWriter = writers.getYAMLTemplateWriter();

console.log('--------------------- parsed object:');
console.log(jsonTemplateReaderResult.template);

console.log('--------------------- serialized object as JsonNode tree:');
console.log(jsonWriter.getAsJsonNode(jsonTemplateReaderResult.template));

console.log('--------------------- serialized JSON string:');
console.log(jsonWriter.getAsJsonString(jsonTemplateReaderResult.template));

console.log('--------------------- serialized YAML json:');
console.log(yamlWriter.getAsYamlNode(jsonTemplateReaderResult.template));

console.log('--------------------- serialized YAML json:');
console.log(yamlWriter.getAsYamlString(jsonTemplateReaderResult.template));
