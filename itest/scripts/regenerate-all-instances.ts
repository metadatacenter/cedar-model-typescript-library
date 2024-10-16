import {
  generateInstanceJsonUsingJava,
  generateInstanceJsonUsingTypeScript,
  generateInstanceYamlUsingJava,
  generateInstanceYamlUsingTypeScript,
} from './regenerate-functions';

const generateInstanceNumbers: number[] = [13];
generateInstanceJsonUsingJava(generateInstanceNumbers).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

generateInstanceYamlUsingJava(generateInstanceNumbers).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

generateInstanceJsonUsingTypeScript(generateInstanceNumbers);

generateInstanceYamlUsingTypeScript(generateInstanceNumbers);
