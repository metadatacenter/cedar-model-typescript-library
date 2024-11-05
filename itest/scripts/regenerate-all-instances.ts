import {
  generateInstanceJsonUsingJava,
  generateInstanceJsonUsingTypeScript,
  generateInstanceYamlUsingJava,
  generateInstanceYamlUsingTypeScript,
} from './regenerate-functions';

const generateInstanceNumbers: number[] = [];
generateInstanceJsonUsingJava(generateInstanceNumbers).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

generateInstanceYamlUsingJava(generateInstanceNumbers, false).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

generateInstanceYamlUsingJava(generateInstanceNumbers, true).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

generateInstanceJsonUsingTypeScript(generateInstanceNumbers);

generateInstanceYamlUsingTypeScript(generateInstanceNumbers, false);

generateInstanceYamlUsingTypeScript(generateInstanceNumbers, true);
