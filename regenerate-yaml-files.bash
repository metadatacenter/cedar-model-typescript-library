#!/bin/bash
pushd ${CEDAR_HOME}/cedar-artifact-library

for i in {1..4}; do
  num=$(printf "%03d" $i)
  mvn exec:java@artifact2yaml -Dexec.args="-x -fsf ../cedar-model-typescript-library/test/resources/fields/${num}/field-${num}.json -y ../cedar-model-typescript-library/test/resources/fields/${num}/field-${num}-java-lib.yaml"
done

for i in {1..4}; do
  num=$(printf "%03d" $i)
  mvn exec:java@artifact2yaml -Dexec.args="-x -esf ../cedar-model-typescript-library/test/resources/elements/${num}/element-${num}.json -y ../cedar-model-typescript-library/test/resources/elements/${num}/element-${num}-java-lib.yaml"
done

for i in {1..30}; do
  num=$(printf "%03d" $i)
  mvn exec:java@artifact2yaml -Dexec.args="-x -tsf ../cedar-model-typescript-library/test/resources/templates/${num}/template-${num}.json -y ../cedar-model-typescript-library/test/resources/templates/${num}/template-${num}-java-lib.yaml"
done

mvn exec:java@artifact2yaml -Dexec.args="-x -tsf ../cedar-model-typescript-library/test/resources/templates/101/template-101.json -y ../cedar-model-typescript-library/test/resources/templates/101/template-101-java-lib.yaml"

popd
