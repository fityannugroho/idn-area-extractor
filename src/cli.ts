#!/usr/bin/env node
import meow from 'meow';
import idnxtr, { DataEntity } from './index.js';

const cli = meow(`
  USAGE
    $ idnxtr [regencies|districts|islands|villages] </path/to/pdf> [OPTIONS]

  OPTIONS
    -d, --destination=<path>  Set the folder destination
    -o, --output=<filename>   Set a specific output file name without the file extension
    -r, --range=<range>       Extract specific PDF pages (e.g. 1-2,5,7-10)
    -R, --save-raw            Save the extracted raw data into .txt file
        --silent              Disable all logs

  EXAMPLE
    $ idnxtr regencies ~/data/regencies.pdf
    $ idnxtr regencies ~/data/regencies.pdf -r 1-2,5,7-10 -R
    $ idnxtr regencies ~/data/regencies.pdf --range 1-2,5,7-10 --save-raw
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
    silent: {
      type: 'boolean',
    },
  },
});

interface Flags {
  destination?: string
  output?: string
  range?: string
  saveRaw?: boolean
  silent?: boolean
}

const [data, filePath] = cli.input;
const { ...flags } = cli.flags as Flags;

idnxtr({
  data: data as DataEntity,
  filePath,
  ...flags,
}).then(() => {
  if (!flags.silent) {
    console.log('\nDone!');
  }
}).catch((err: Error) => {
  console.error(`${err.name}: ${err.message}`);
  process.exit(1);
});