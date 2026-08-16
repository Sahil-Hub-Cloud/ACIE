#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init';
import { indexCommand } from './commands/index';
import { analyzeCommand } from './commands/analyze';
import { serveCommand } from './commands/serve';

const program = new Command();

program
  .name('acie')
  .description('⚡ ACIE — AI Change Impact Engine. Google Maps for your codebase.')
  .version('2.0.0');

program.addCommand(initCommand);
program.addCommand(indexCommand);
program.addCommand(analyzeCommand);
program.addCommand(serveCommand);

program.parse(process.argv);
