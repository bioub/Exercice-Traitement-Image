const fs = require('fs-extra');
const path = require('path');
const globby = require('globby');
const _ = require('lodash');
const sharp = require('sharp');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');

process.chdir(__dirname);

async function rmAndMkdir() {
  await fs.remove('dest');
  await fs.mkdir('dest');
}

async function copyOrResizeImage(srcImgPath, destImgPath, maxWidth) {
  let image = sharp(srcImgPath);

  const { width } = await image.metadata();

  if (width > maxWidth) {
    image = image.resize({ width: maxWidth });
  }

  await image.toFile(destImgPath);
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

    if (ext === '.svg') {
      await fs.copy(srcImgPath, destImgPath);
    } else {
      await copyOrResizeImage(srcImgPath, destImgPath, 300);
    }

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

async function reduceImagesSize() {
  await imagemin(['dest/*.{png,svg}'], {
    destination: 'dest',
    plugins: [imageminPngquant(), imageminSvgo()],
  });
}

(async function () {
  await rmAndMkdir();
  await copyImages();
  await reduceImagesSize();
})();
