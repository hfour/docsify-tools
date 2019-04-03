#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';

let ignores = /node_modules|^\.|_sidebar|_docsify/;
let isDoc = /.md$/;

type Entry = {
  name: string;
  path: string;
  children?: Entry[];
};

function niceName(name: string) {
  let splitName = name.split('-');
  if (Number.isNaN(Number(splitName[0]))) return name;
  return splitName.slice(1).join(' ');
}
function buildTree(location: string, name = '', tPath = ''): Entry {
  let children: Entry[] = [];
  for (let item of fs.readdirSync(location)) {
    if (ignores.test(item)) continue;

    let iPath = tPath + '/' + item;
    let iLocation = path.join(location, item);
    if (fs.statSync(iLocation).isDirectory()) {
      let sub = buildTree(iLocation, item, iPath);
      if (sub.children != null && sub.children.length > 0)
        children.push(buildTree(iLocation, item, iPath));
    } else if (isDoc.test(item)) {
      children.push({ name: item, path: iPath });
    }
  }

  return { name, children, path: tPath };
}

function renderToMd(tree: Entry, linkDir = false): string {
  if (!tree.children) {
    return `- [${niceName(path.basename(tree.name, '.md'))}](${tree.path.replace(/ /g, '%20')})`;
  } else {
    let fileNames = new Set(tree.children.filter(c => !c.children).map(c => c.name));
    let dirNames = new Set(tree.children.filter(c => c.children).map(c => c.name + '.md'));

    let content = tree.children
      .filter(c => !fileNames.has(c.name) || !dirNames.has(c.name))
      .map(c => renderToMd(c, dirNames.has(c.name + '.md') && fileNames.has(c.name + '.md')))
      .join('\n')
      .split('\n')
      .map(item => '  ' + item)
      .join('\n');
    let prefix = '';
    if (tree.name) {
      if (linkDir)
        prefix = `- [${niceName(path.basename(tree.name, '.md'))}](${tree.path.replace(
          / /g,
          '%20'
        )})\n`;
      else prefix = `- ${niceName(tree.name)}\n`;
    }

    return prefix + content;
  }
}

let args = yargs
  .wrap(yargs.terminalWidth() - 1)
  .usage('$0 [-d docsDir] ')
  .options({
    docsDir: {
      alias: 'd',
      type: 'string',
      describe: 'Where to look for the documentation (defaults to docs subdir of repo directory)'
    }
  }).argv;

let dir = path.resolve(process.cwd(), args.docsDir || './docs');

try {
  let root = buildTree(dir);
  fs.writeFileSync(path.join(dir, '_sidebar.md'), renderToMd(root));
} catch (e) {
  console.error('Unable to generate sidebar for directory', dir);
  console.error('Reason:', e.message);
  process.exit(1);
}
