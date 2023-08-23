#!/usr/bin/env node
import meow from 'meow';
import idnxtr, { DataEntity } from './index.js';

const cli = meow(`
  Usage
    $ idnxtr [regency|district|island|village] </path/to/pdf>

  Options
    --compare, -c         Compare the extracted data with old data (from idn-area-data).
    --destination, -d     Set the folder destination. The default is the current directory.
    --output, -o          Set a specific output file name without a file extension.
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
  },
});

interface Flags {
  destination?: string
  output?: string
}

const [data, filePath] = cli.input;
const { ...flags } = cli.flags as Flags;

idnxtr({
  data: data as DataEntity,
  filePath,
  ...flags,
}).then(() => {
  console.log('Done!');
}).catch((err: Error) => {
  console.error(err.message, err);
  process.exit(1);
});
