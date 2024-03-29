#!/bin/bash
pushd ${CEDAR_HOME}/cedar-artifact-library

for i in {1..4}; do
  num=$(printf "%03d" $i)
  mvn exec:java@artifact2yaml -Dexec.args="-fsf ../cedar-model-typescript-library/test/resources/fields/${num}/field-${num}-input.json -y ../cedar-model-typescript-library/test/resources/fields/${num}/field-${num}-ref-java-lib.yaml"
done

for i in {1..4}; do
  num=$(printf "%03d" $i)
  mvn exec:java@artifact2yaml -Dexec.args="-esf ../cedar-model-typescript-library/test/resources/elements/${num}/element-${num}-input.json -y ../cedar-model-typescript-library/test/resources/elements/${num}/element-${num}-ref-java-lib.yaml"
done

for i in {1..30}; do
  num=$(printf "%03d" $i)
  mvn exec:java@artifact2yaml -Dexec.args="-tsf ../cedar-model-typescript-library/test/resources/templates/${num}/template-${num}-input.json -y ../cedar-model-typescript-library/test/resources/templates/${num}/template-${num}-ref-java-lib.yaml"
done

mvn exec:java@artifact2yaml -Dexec.args="-tsf ../cedar-model-typescript-library/test/resources/templates/101/template-101-input.json -y ../cedar-model-typescript-library/test/resources/templates/101/template-101-ref-java-lib.yaml"

popd
