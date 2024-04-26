# CEDAR Model Typescript Library
A library to work with CEDAR templates and instances - implemented in TypeScript

## Build
```shell
npm install
npm run build
```

## Run the tests
```shell
npm test
```

## To regenerate reference file outputs
```shell
# Using CEDAR Artifact Library
npx ts-node ./itest/scripts/regenerate-json-files-with-java-lib.ts
npx ts-node ./itest/scripts/regenerate-yaml-files-with-java-lib.ts

# Using CEDAR Model TypeScript Library
npx ts-node ./itest/scripts/regenerate-json-files-with-ts-lib.ts
npx ts-node ./itest/scripts/regenerate-yaml-files-with-ts-lib.ts

# All files
npx ts-node ./itest/scripts/regenerate-all-files.ts
```

## Compare generated files
```shell
npx ts-node ./itest/scripts/compare-ts-java-yaml-files.ts
npx ts-node ./itest/scripts/compare-ref-java-yaml-files.ts
npx ts-node ./itest/scripts/compare-ref-ts-yaml-files.ts

npx ts-node ./itest/scripts/compare-content-ref-ts-json-files.ts
npx ts-node ./itest/scripts/compare-content-ref-java-json-files.ts
```

## See it in action
Check out the README at the companion [demo repo](https://github.com/metadatacenter/cedar-model-typescript-library-demo)
