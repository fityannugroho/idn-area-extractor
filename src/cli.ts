#!/usr/bin/env node
import meow from 'meow';
import idnxtr, { DataEntity } from './index.js';

const cli = meow(`
  Usage
    $ idnxtr [regencies|districts|islands|villages] </path/to/pdf>

  Options
    --destination, -d     Set the folder destination. The default is the current directory.
    --output, -o          Set a specific output file name without a file extension.
    --range, -r           Set the specific PDF page range to be extracted (example: 1-2,5,7-9).
    --save-raw, -R        If 'true', save the extracted raw data into .txt file
`, {
  importMeta: import.meta,
  description: 'Extract Indonesia area data from PDF',
  flags: {
    destination: {
      shortFlag: 'd',
      type: 'string',
    },
    output: {
      shortFlag: 'o',
      type: 'string',
    },
    range: {
      shortFlag: 'r',
      type: 'string',
    },
    saveRaw: {
      shortFlag: 'R',
      type: 'boolean',
    },
  },
});

interface Flags {
  destination?: string
  output?: string
  range?: string
  saveRaw?: boolean
}

const [data, filePath] = cli.input;
const { ...flags } = cli.flags as Flags;

idnxtr({
  data: data as DataEntity,
  filePath,
  ...flags,
}).then(() => {
  console.log('\nDone!');
}).catch((err: Error) => {
  console.error(`${err.name}: ${err.message}`);
  process.exit(1);
});
