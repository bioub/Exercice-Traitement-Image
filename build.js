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
  const report = {};

  for (const srcImgPath of srcImgPaths) {
    const { name, ext, dir } = path.parse(srcImgPath);
    
    const segments = dir.split(path.sep);
    const parentSegment = segments[segments.length - 1];

    const destName = _.kebabCase(_.deburr(name));
    const destImgPath = path.resolve('dest', destName) + ext;

    await fs.copy(srcImgPath, destImgPath);

    if (!report[parentSegment]) {
      report[parentSegment] = [];
    }

    report[parentSegment].push({
      name: name,
      imgPath: destName + ext,
    });
  }

  await fs.writeJson(path.resolve(__dirname, 'report.json'), report);
}

(async function() {
  await rmAndMkdir();
  await copyImages();
}());
