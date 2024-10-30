import {
  generateAllJsonUsingJava,
  generateAllJsonUsingTypeScript,
  generateAllYamlUsingJava,
  generateAllCompactYamlUsingJava,
  generateAllYamlUsingTypeScript,
} from './regenerate-functions';

generateAllJsonUsingJava().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

generateAllYamlUsingJava().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

generateAllCompactYamlUsingJava().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

generateAllJsonUsingTypeScript();

generateAllYamlUsingTypeScript();
