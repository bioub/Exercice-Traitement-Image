const fs = require('fs-extra');
const path = require('path');
const globby = require('globby');
const _ = require('lodash');

process.chdir(__dirname);

async function rmAndMkdir() {
  await fs.remove('dest');
  await fs.mkdir('dest');
}

async function copyImages() {
  const srcImgPaths = await globby('src/**/*.{png,svg}');

  for (const srcImgPath of srcImgPaths) {
    const { name, ext } = path.parse(srcImgPath);

    const destName = _.kebabCase(_.deburr(name));
    const destImgPath = path.resolve('dest', destName) + ext;

    await fs.copy(srcImgPath, destImgPath);
  }
}

(async function() {
  await rmAndMkdir();
  await copyImages();
}());
