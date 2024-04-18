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
./scripts/regenerate-yaml-files.bash

# Using CEDAR Model TypeScript Library
npx ts-node ./itest/scripts/regenerate-yaml-files.ts
```

## See it in action
Check out the README at the companion [demo repo](https://github.com/metadatacenter/cedar-model-typescript-library-demo)
