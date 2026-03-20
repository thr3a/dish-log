import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const filePath = process.argv[2];
if (!filePath) {
  console.error('使い方: node --import tsx ./src/scripts/encode-firebase-json.ts <jsonファイルパス>');
  process.exit(1);
}

const json = readFileSync(resolve(filePath), 'utf-8');
const base64 = Buffer.from(json).toString('base64');
console.log(base64);
