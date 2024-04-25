import { generateJsonUsingJava } from './regenerate-json-files-with-java-lib';
import { generateYamlUsingJava } from './regenerate-yaml-files-with-java-lib';
import { generateJsonUsingTypeScript } from './regenerate-json-files-with-ts-lib';
import { generateYamlUsingTypeScript } from './regenerate-yaml-files-with-ts-lib';

generateJsonUsingJava().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

generateYamlUsingJava().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

generateJsonUsingTypeScript();

generateYamlUsingTypeScript();
