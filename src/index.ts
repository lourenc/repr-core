import 'dotenv/config'
import { bootstrapApp } from './app';

async function main() {
  await bootstrapApp();
}

main().catch((error) => {
  console.error(error);

  process.exit(1);
});
