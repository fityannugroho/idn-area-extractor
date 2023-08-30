#!/usr/bin/env node
import { confirm, input, select } from '@inquirer/prompts';
import { existsSync, lstatSync } from 'fs';
import meow from 'meow';
import idnxtr, { DataEntity, dataEntities, isFilePdf } from './index.js';

const cli = meow(`
  USAGE
    $ idnxtr [regencies|districts|islands|villages] </path/to/file.[pdf|txt]> [OPTIONS]

  OPTIONS
    -c, --compare             Compare the extracted data with the latest data
    -d, --destination=<path>  Set the folder destination
    -o, --output=<filename>   Set a specific output file name without the file extension
    -r, --range=<range>       Extract specific PDF pages (e.g. 1-2,5,7-10)
    -R, --save-raw            Save the extracted raw data into .txt file (only works with PDF data)
        --silent              Disable all logs

  EXAMPLE
    $ idnxtr
    $ idnxtr regencies ~/data/regencies.pdf
    $ idnxtr regencies ~/data/regencies.pdf -r 1-2,5,7-10 -R
    $ idnxtr regencies ~/data/regencies.pdf --range 1-2,5,7-10 --save-raw
    $ idnxtr regencies ~/data/raw-regencies.txt
`, {
  importMeta: import.meta,
  description: 'Extract Indonesia area data from PDF',
  booleanDefault: undefined,
  flags: {
    compare: {
      shortFlag: 'c',
      type: 'boolean',
    },
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

async function main() {
  let [data, filePath] = cli.input;
  const { flags } = cli;

  // Use interactive UI if no args are given
  if (!data && !filePath && !Object.keys(flags).length) {
    data = await select<DataEntity>({
      message: 'Which kind of data to extract?',
      choices: dataEntities.map((d) => ({ value: d })),
    });

    filePath = await input({
      message: 'Enter the file path:',
      validate(value) {
        if (!value.trim()) return 'The file path cannot be empty';
        if (!existsSync(value) || !lstatSync(value).isFile()) {
          return 'The file path does not exists';
        }
        return true;
      },
    });

    if (await isFilePdf(filePath)) {
      flags.range = await input({
        message: 'Set specific pages range to extract? (e.g. 1-2,5,7-10)',
      });

      if (flags.range === '') {
        flags.range = undefined;
      }

      flags.saveRaw = await confirm({
        message: 'Save the extracted raw data?',
        default: false,
      });
    }

    flags.destination = await input({
      message: 'Enter the destination folder:',
      default: process.cwd(),
    });

    flags.output = await input({
      message: 'What the output file name would you like to use?',
      default: data,
    });

    flags.compare = await confirm({
      message: 'Compare for data changes?',
      default: false,
    });

    flags.silent = await confirm({
      message: 'Disable all logs?',
      default: false,
    });
  }

  await idnxtr({
    data: data as DataEntity,
    filePath,
    ...flags,
  });

  if (!flags.silent) {
    console.log('\nDone!');
  }
}

main().catch((err: Error) => {
  console.error(`${err.name}: ${err.message}`);
  process.exit(1);
});
