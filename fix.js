import fs from 'fs';
let c = '';
c += import axios from 'axios';
;
c += import { parseFile } from '../src/parser/parser.js';
;
fs.writeFileSync('api/github.js', c);
console.log('done');
