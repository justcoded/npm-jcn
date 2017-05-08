'use strict';

const colors = require('colors'),
  shell = require('shelljs/global'),
  fs = require('fs'),
  emoji = require('node-emoji'),
  del = require('del'),
  copydir = require('copy-dir');

function logComplete(task) {
  console.log('['.green + task.green + ' ' + emoji.get('white_check_mark') + ' ]\n'.green);
}

function folderExists(src) {
  return fs.existsSync(src);
}

function createTmpFolder() {
  return new Promise((resolve, reject) => {
    if (folderExists('tmp')) {
      console.log('Destination path already exists and is not an empty directory. '.red + emoji.get('cry'));
      return;
    }
    exec('mkdir tmp');
    cd('tmp');

    resolve();
  });
}

function deleteFiles(deleteArray) {
  return new Promise((resolve, reject) => {
    if (deleteArray === null) {
      resolve()
    } else {
      console.log(`Deleting files ${deleteArray}...`);
      del.sync(deleteArray);

      resolve();
    }
  });
}

function gitClone(repo) {
  return new Promise((resolve, reject) => {
    console.log('Clone from ' + repo.url + ' ' + repo.branch);
    exec('git clone ' + repo.url + ' ./ -b ' + repo.branch);
    del.sync(['.git']);
    logComplete('Git cloning has been completed');

    resolve();
  });
}

function installDependencies() {
  return new Promise((resolve, reject) => {
    console.log('Installing npm dependencies...');
    exec('npm install');
    logComplete('Dependencies have been installed');

    resolve();
  });
}

function moveFiles() {
  return new Promise((resolve, reject) => {
    console.log('Copying files...');
    copydir('../tmp', '../', (err) => {
      if (err) {
        console.log(err);
        return;
      }
      cd('..');
      del.sync(['tmp']);
      logComplete('Copying files has been completed');

      resolve();
    });
  });
}

function build(repositories) {
  return new Promise((resolve, reject) => {

    let chain = Promise.resolve();

    for (var i = 0; i < repositories.length; i++) {
      chain = chain
        .then(deleteFiles.bind(null, repositories[i].delete || null))
        .then(createTmpFolder)
        .then(gitClone.bind(null, repositories[i]))
        .then(moveFiles);

      if (i == repositories.length - 1) {
        chain = chain
          .then(installDependencies)
          .then(finish);
      }
    }

    resolve();
  });
}

function finish() {
  console.log('Starter has been successfully installed. Good luck '.green +
    emoji.get('wink') + ' \n\u00A9 JustCoded'.green);
  exec('gulp');
}

exports.init = function (repositories) {
  console.log('\nGetting starter files... ' + emoji.get('runner'));

  build(repositories);
};