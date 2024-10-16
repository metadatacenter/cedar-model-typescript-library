import {
  generateAllJsonUsingJava,
  generateAllJsonUsingTypeScript,
  generateAllYamlUsingJava,
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

generateAllJsonUsingTypeScript();

generateAllYamlUsingTypeScript();
