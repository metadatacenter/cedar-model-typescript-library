import { generateAllJsonUsingJava } from './regenerate-functions';

generateAllJsonUsingJava().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
