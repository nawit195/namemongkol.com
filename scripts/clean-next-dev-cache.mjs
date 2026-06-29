import { rm } from 'node:fs/promises';
import { join } from 'node:path';

const target = join(process.cwd(), '.next', 'dev');

try {
  await rm(target, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 500,
  });
  console.log(`Removed ${target}`);
} catch (error) {
  console.error(`Failed to remove ${target}`);
  console.error(error);
  process.exitCode = 1;
}
