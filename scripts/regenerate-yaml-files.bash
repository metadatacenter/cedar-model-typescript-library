#!/bin/bash
pushd ${CEDAR_HOME}/cedar-artifact-library

for i in {1..7}; do
  num=$(printf "%03d" $i)
  mvn exec:java@artifact2yaml -Dexec.args="-fsf ../cedar-test-artifacts/artifacts/fields/${num}/field-${num}.json -y ../cedar-test-artifacts/artifacts/fields/${num}/field-${num}-java-artifact-lib.yaml"
done

for i in {1..5}; do
  num=$(printf "%03d" $i)
  mvn exec:java@artifact2yaml -Dexec.args="-esf ../cedar-test-artifacts/artifacts/elements/${num}/element-${num}.json -y ../cedar-test-artifacts/artifacts/elements/${num}/element-${num}-java-artifact-lib.yaml"
done

for i in {1..31}; do
  num=$(printf "%03d" $i)
  mvn exec:java@artifact2yaml -Dexec.args="-tsf ../cedar-test-artifacts/artifacts/templates/${num}/template-${num}.json -y ../cedar-test-artifacts/artifacts/templates/${num}/template-${num}-java-artifact-lib.yaml"
done

popd
