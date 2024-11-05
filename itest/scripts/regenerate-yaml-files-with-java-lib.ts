import { generateAllCompactYamlUsingJava, generateAllYamlUsingJava } from './regenerate-functions';

generateAllYamlUsingJava().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

generateAllCompactYamlUsingJava().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
