import { generateAllYamlUsingJava } from './regenerate-functions';

generateAllYamlUsingJava().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
