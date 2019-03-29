#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

let ignores = /node_modules|^\.|_sidebar|_docsify/;
let isDoc = /.md$/;

type Entry = {
  name: string;
  path: string;
  children?: Entry[];
};
function buildTree(location: string, name = '', tPath = ''): Entry {
  let children: Entry[] = [];
  for (let item of fs.readdirSync(location)) {
    if (ignores.test(item)) continue;

    let iPath = tPath + '/' + item;
    let iLocation = path.join(location, item);
    if (fs.statSync(iPath).isDirectory()) {
      children.push(buildTree(iLocation, item, iPath));
    } else if (isDoc.test(item)) {
      children.push({ name: item, path: iPath });
    }
  }

  return { name, children, path: tPath };
}

function renderToMd(tree: Entry): string {
  if (!tree.children) return `- [${tree.name.split('.')[0]}](${tree.path.replace(/ /g, '%20')})`;
  else {
    let content = tree.children
      .map(c => renderToMd(c))
      .join('\n')
      .split('\n')
      .map(item => '  ' + item)
      .join('\n');
    let prefix = tree.name ? `- ${tree.name}\n` : '';
    return prefix + content;
  }
}

let dir = process.env['DOCS_DIR'] || path.join(process.cwd(), 'docs');

try {
  let root = buildTree(dir);
  fs.writeFileSync(path.join(dir, '_sidebar.md'), renderToMd(root));
} catch (e) {
  console.error('Unable to generate sidebar for directory', dir);
  console.error('Reason:', e.message);
  process.exit(1);
}
