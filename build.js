const fs = require('fs-extra');

process.chdir(__dirname);

async function rmAndMkdir() {
  await fs.remove('dest');
  await fs.mkdir('dest');
}

(async function () {
  await rmAndMkdir();
})();
