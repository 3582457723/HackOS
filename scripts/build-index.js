import fs from 'fs';
import path from 'path';

const rootIndexPath = path.resolve('index.html');
const publicIndexPath = path.resolve('public', 'index.html');

const html = fs.readFileSync(rootIndexPath, 'utf8');
const rewritten = html.replace(/public\//g, '');

fs.writeFileSync(publicIndexPath, rewritten, 'utf8');
console.log('Built public/index.html from root index.html');
