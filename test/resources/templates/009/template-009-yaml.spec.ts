import { CedarWriters, JSONTemplateReader, YAMLTemplateWriter } from '../../../../src';
import { TestUtil } from '../../../TestUtil';

describe('YAMLTemplateWriter - template-009', () => {
  test('read a JSON template, and writes it as YAML', () => {
    const artifactSource = TestUtil.readTestResourceAsString('templates/009', 'template-009.json');
    const reader: JSONTemplateReader = JSONTemplateReader.getStrict();
    const jsonTemplateReaderResult = reader.readFromString(artifactSource);
    expect(jsonTemplateReaderResult).not.toBeNull();
    const parsingResult = jsonTemplateReaderResult.parsingResult;
    expect(parsingResult.wasSuccessful()).toBe(true);

    const writers: CedarWriters = CedarWriters.getStrict();
    const yamlWriter: YAMLTemplateWriter = writers.getYAMLTemplateWriter();

    const stringified = yamlWriter.getAsYamlString(jsonTemplateReaderResult.template);
    // console.log(stringified);
    const expectedSerialization = `
type: template
id: https://repo.metadatacenter.org/templates/8ebf7294-7ae0-457c-b9c0-99df809176f8
name: Template with Static Fields
status: bibo:draft
version: 0.0.1
modelVersion: 1.6.0
createdOn: 2024-03-04T12:05:45-08:00
createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
lastUpdatedOn: 2024-03-04T12:26:33-08:00
modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
children:
  - type: staticTemplateField
    id: https://repo.metadatacenter.org/template-fields/61882375-7659-49e9-8c07-33f40d6fe4a5
    name: Page break field
    description: Help text
    modelVersion: 1.6.0
    label: Preferred label
    inputType: page-break
    createdOn: 2024-03-04T12:26:33-08:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-04T12:26:33-08:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
  - type: staticTemplateField
    id: https://repo.metadatacenter.org/template-fields/66d294ce-bdf5-4fa9-b3bb-424d972acd4f
    name: Section break
    description: Help Text
    modelVersion: 1.6.0
    label: Preferred label
    inputType: section-break
    createdOn: 2024-03-04T12:26:33-08:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-04T12:26:33-08:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
  - type: staticTemplateField
    id: https://repo.metadatacenter.org/template-fields/6d3e4f87-13cd-4c50-bee9-96c269d9f60e
    name: Image field
    description: Help Text
    modelVersion: 1.6.0
    label: Preferred label
    inputType: image
    content: https://cedar.metadatacenter.org/img/close_modal.png
    createdOn: 2024-03-04T12:26:33-08:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-04T12:26:33-08:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
  - type: staticTemplateField
    id: https://repo.metadatacenter.org/template-fields/adc5e2fe-a9ba-46b8-aa38-64501fda73e8
    name: Rich text
    description: Help Text
    modelVersion: 1.6.0
    label: Preferred label
    inputType: richtext
    content: |-
      <p><a class="share workspace ng-scope active" href="https://cedar.metadatacenter.org/#" ng-class="{active: dc.isHomeMode()}" ng-click="dc.goToMyWorkspace()" style="background-color: rgb(232, 232, 232); opacity: 1; margin: 10px 0px; display: block; font-size: 16px; font-weight: bold;" translate="">Workspace</a><a class="share shared ng-scope" href="https://cedar.metadatacenter.org/#" ng-class="{active: dc.isSharedWithMeMode()}" ng-click="dc.goToSharedWithMe()" style="background-color: rgb(232, 232, 232); outline: 0px; margin: 10px 0px; display: block; font-size: 16px;" translate="">Shared with Me</a></p>

    createdOn: 2024-03-04T12:26:33-08:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-04T12:26:33-08:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
  - type: staticTemplateField
    id: https://repo.metadatacenter.org/template-fields/adc5e2fe-a9ba-46b8-aa38-64501fda8888
    name: Video name
    description: Help Text
    modelVersion: 1.6.0
    inputType: youtube
    content: qf6-_JLZ3lw
    width: 192
    height: 108
    createdOn: 2024-03-04T12:26:33-08:00
    createdBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
    lastUpdatedOn: 2024-03-04T12:26:33-08:00
    modifiedBy: https://metadatacenter.org/users/c7dcc3ca-55fe-4ca8-b448-ab110bfe4c95
`.trim();
    expect(stringified).toEqual(expectedSerialization);
  });
});
