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
npx ts-node ./itest/scripts/compare-verbatim-ts-java-yaml-files.ts
npx ts-node ./itest/scripts/compare-verbatim-ref-java-yaml-files.ts
npx ts-node ./itest/scripts/compare-verbatim-ref-ts-yaml-files.ts

npx ts-node ./itest/scripts/compare-content-ref-ts-json-files.ts
npx ts-node ./itest/scripts/compare-content-ref-java-json-files.ts
```

## Development
During development, you might want to use this library in a client project.
To do so, execute this:
```shell
npm run build
npm run link 
```

To check the globally installed packages, and check if this library is linked properly, execute:
```shell
npm ls -g --depth=0
```

You should see something similar:
```shell
/opt/homebrew/lib
├── @angular/cli@17.3.0
├── cedar-model-typescript-library@0.8.0 -> ./../../../Users/egyedia/CEDAR/cedar-model-typescript-library/dist
├── ember-cli@5.7.0
├── gulp@4.0.2
├── npm@10.5.0
├── ts-node@10.9.2
└── typescript@5.4.2
```

## See it in action
Check out the README at the companion [demo repo](https://github.com/metadatacenter/cedar-model-typescript-library-demo)
