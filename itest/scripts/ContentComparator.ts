import { CedarArtifactType, JsonArtifactParsingResult, JsonObjectComparator, JsonPath } from '../../src';
import { CompareFileSource } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileSource';
import { CompareFileFormat } from '../../src/org/metadatacenter/model/cedar/types/helper-types/CompareFileFormat';
import { TestResource } from '../TestResource';
import { TestUtil } from '../TestUtil';
import { JsonWriterBehavior } from '../../src/org/metadatacenter/behavior/JsonWriterBehavior';
import * as console from 'console';

export class ContentComparator {
  compare(
    testNumbers: number[],
    artifactType: CedarArtifactType,
    leftSource: CompareFileSource,
    rightSource: CompareFileSource,
    format: CompareFileFormat,
  ) {
    for (const testNumber of testNumbers) {
      try {
        const testResource: TestResource = TestResource.artifact(testNumber, artifactType);
        const artifactLeftSource: string = TestUtil.readArtifact(testResource, leftSource, format);
        const artifactRightSource: string = TestUtil.readArtifact(testResource, rightSource, format);

        if (format === CompareFileFormat.JSON) {
          const leftObject = JSON.parse(artifactLeftSource);
          const rightObject = JSON.parse(artifactRightSource);
          const compareResult = new JsonArtifactParsingResult();
          JsonObjectComparator.compareBothWays(compareResult, leftObject, rightObject, new JsonPath(), JsonWriterBehavior.STRICT);
          if (!compareResult.wasSuccessful()) {
            console.log('DIFF FOUND: ' + testResource);
            const comparisonErrors = compareResult.getBlueprintComparisonErrors();
            //TestUtil.p(comparisonErrors);
          }
        }
      } catch (error) {
        console.error(`Failed to process ${artifactType.getYamlValue()} ${testNumber}!`, error);
      }
    }
  }
}
