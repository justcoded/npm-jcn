const colors = require('colors'),
  shell = require('shelljs/global'),
  fs = require('fs'),
  del = require('del'),
  emoji = require('node-emoji'),
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

function gitClone(repo) {
  return new Promise((resolve, reject) => {
    console.log('Clone from ' + repo.url + ' ' + repo.branch);
    exec('git clone ' + repo.url + ' ./ -b ' + repo.branch);
    del.sync(['.git']);
    logComplete('Git cloning has been completed')

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

function finish() {
  console.log('Starter has been successfully installed. Good luck '.green +
    emoji.get('wink') + ' \n\u00A9 JustCoded'.green);
  exec('gulp');
}

exports.init = function (repo) {
  createTmpFolder().then(
    () => {
      console.log('\nGetting starter files... ' + emoji.get('runner'));
      gitClone(repo)
        .then(moveFiles)
        .then(installDependencies)
        .then(finish);
    }
  );
};