import { parseFile } from './parser.js';

const testCode = `
import { Router } from 'express';
import { hashPassword } from './utils';
export function validateToken(token) { return true; }
export const createUser = (name) => {};
export default class AuthService {}
`;

const result = parseFile('src/auth.ts', testCode);
console.log(JSON.stringify(result, null, 2));
