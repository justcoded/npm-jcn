'use strict';

const colors = require('colors'),
  shell = require('shelljs/global'),
  fs = require('fs'),
  emoji = require('node-emoji'),
  del = require('del'),
  copydir = require('copy-dir'),
  noEmoji = /^win/.test(process.platform);

let config;

if (noEmoji) {
  emoji.get = () => '';
}

function logComplete(task) {
  console.log('['.green + task.green + ' ' + emoji.get('white_check_mark') + ' ]\n'.green);
}

function folderExists(src) {
  return fs.existsSync(src);
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

function readConfigFile() {
  return new Promise((resolve, reject) => {
    try {
      config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
      del.sync(['./config.json']);
      resolve();
    } catch (e) {
      console.log('No config file.');
      resolve();
    };
  });
}

function configurePackageJson() {
  return new Promise((resolve, reject) => {
    let packageFile;

    try {
      packageFile = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    } catch (e) {
      console.error('There was an error reading the file!');
      reject();
    }

    if (typeof config === 'undefined') {
      resolve();
    }

    if ('delete' in config) {
      if (typeof packageFile === 'undefined') {
        console.log('package.json was not loaded!');
        reject();
      }
      changeDependencies(packageFile, config.delete, 'delete')
        .then(() => {
          if ('add' in config) {
            changeDependencies(packageFile, config.add, 'add')
              .then(() => {
                try {
                  fs.writeFileSync('./package.json', JSON.stringify(packageFile, null, 2), 'utf8');
                  resolve();
                } catch (e) {
                  console.log(e);
                  reject();
                }
              });
          }
        })
        .catch(e => {
          console.log(e);
          reject();
        });
    }
  });
}

function changeDependencies(packageFile, config, method) {
  return new Promise((resolve, reject) => {
    let instructions;

    if (method === 'delete') {
      instructions = (object, field) => {
        return new Promise((resolve, reject) => {
          if (typeof object[field] === 'undefined') {
            resolve();
          } else {
            for (let item of object[field]) {
              if (field in packageFile && item in packageFile[field]) {
                delete packageFile[field][item];
              }
            }

            resolve();
          }
        });
      };
    } else {
      instructions = (object, field) => {
        return new Promise((resolve, reject) => {
          if (typeof object[field] === 'undefined') {
            resolve();
          } else {
            for (let item in object[field]) {
              packageFile[field][item] = object[field][item];
            }

            resolve();
          }
        });
      }
    }

    instructions(config, 'dependencies')
      .then(instructions.bind(null, config, 'devDependencies'))
      .then(resolve);
  });
}

function changeVendorScss() {
  return new Promise((resolve, reject) => {
    let path = './src/vendor_entries/vendor.scss',
      vendorScss,
      addVendor,
      deleteVendor;

    if (typeof config === 'undefined') {
      resolve();
    }

    try {
      vendorScss = fs.readFileSync(path, 'utf8').toString().split('\n');
    } catch (e) {
      console.log(e)
      reject();
    }

    addVendor = () => {
      return new Promise((resolve, reject) => {
        if (typeof config.add.vendorScss === 'undefined') {
          resolve();
        } else {
          for (let item of config.add.vendorScss) {
            vendorScss.push(item);
          }
          for (let i = 0; i < vendorScss.length; i++) {
            vendorScss[i] += '\n';
          }

          try {
            fs.writeFileSync(path, vendorScss.join().replace(/,/g, ''), 'utf8');
            resolve();
          } catch (e) {
            console.log(e);
            reject();
          }
        }
      });
    }

    deleteVendor = () => {
      return new Promise((resolve, reject) => {
        if (typeof config.delete.vendorScss === 'undefined') {
          resolve();
        } else {
          for (let item of config.delete.vendorScss) {
            let index;

            for (let i of vendorScss) {
              index = vendorScss.indexOf(item + '\n');

              if (index < 0) {
                index = vendorScss.indexOf(item);
              }

              if (index > 1) {
                vendorScss.splice(index, 1);
              }
            }
          }
          try {
            fs.writeFileSync(path, vendorScss.join().replace(/,/g, ''), 'utf8');
            resolve();
          } catch (e) {
            console.log(e);
            reject();
          }
        }
      });
    };

    addVendor()
      .then(deleteVendor)
      .then(resolve);
  });
}

function changeVendorJs() {
  return new Promise((resolve, reject) => {
    let path = './src/vendor_entries/vendor.js',
      vendorJs,
      addVendor,
      deleteVendor;

    if (typeof config === 'undefined') {
      resolve();
    }

    try {
      vendorJs = fs.readFileSync(path, 'utf8').toString().split('\n');
    } catch (e) {
      console.log(e)
      reject();
    }

    addVendor = () => {
      return new Promise((resolve, reject) => {
        if (typeof config.add.vendorJs === 'undefined') {
          resolve();
        } else {
          let copyVendorJs = vendorJs.slice();
          for (let item of config.add.vendorJs) {
            copyVendorJs.splice(copyVendorJs.length - 1, 0, `  '${item}'`);
          }
          for (let i = 0; i < copyVendorJs.length; i++) {
            if (copyVendorJs[i].indexOf('.js\'') > 0) {
              copyVendorJs[i] += '|';
            }
            copyVendorJs[i] += '\n';
          }
          try {
            vendorJs = copyVendorJs.join().replace(/,/g, '').replace(/\|/g, ',');
            fs.writeFileSync(path, vendorJs, 'utf8');
            resolve();
          } catch (e) {
            console.log(e);
            reject();
          }

          resolve();
        }
      });
    }

    deleteVendor = () => {
      return new Promise((resolve, reject) => {
        if (typeof config.delete.vendorJs === 'undefined') {
          resolve();
        } else {
          vendorJs = vendorJs.split('\n');
          for (let item of config.delete.vendorJs) {
            for (let i = 0; i < vendorJs.length; i++) {
              let index = vendorJs[i].replace(/'|\s/g, '').indexOf(item);
              if (index !== -1) {
                vendorJs.splice(i, 1);
              }
            }
          }
          for (let i = 0; i < vendorJs.length; i++) {
            if (vendorJs[i].indexOf('.js\'') > 0) {
              vendorJs[i] += '|';
            }
            vendorJs[i] += '\n';
          }

          try {
            vendorJs = vendorJs.join().replace(/,/g, '').replace(/\|/g, ',');
            fs.writeFileSync(path, vendorJs, 'utf8');
            resolve();
          } catch (e) {
            console.log(e);
            reject();
          }
          resolve();
        }
      });
    };

    addVendor()
      .then(deleteVendor)
      .then(resolve);
  });
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
    logComplete('Git cloning has been completed');

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

function installDependencies() {
  return new Promise((resolve, reject) => {
    console.log('Installing npm dependencies...');
    exec('npm install');
    logComplete('Dependencies have been installed');

    resolve();
  });
}

function finish() {
  console.log('Starter has been successfully installed. Good luck '.green +
    emoji.get('wink') + ' \n\u00A9 JustCoded'.green);
  exec('gulp');
}

function build(repositories) {
  return new Promise((resolve, reject) => {

    let chain = Promise.resolve();

    for (var i = 0; i < repositories.length; i++) {
      chain = chain
        .then(deleteFiles.bind(null, repositories[i].filesToDelete || null))
        .then(createTmpFolder)
        .then(gitClone.bind(null, repositories[i]))
        .then(moveFiles);

      if (i !== 0) {
        chain = chain
          .then(readConfigFile)
          .then(configurePackageJson)
          .then(changeVendorScss)
          .then(changeVendorJs);
      }

      if (i == repositories.length - 1) {
        chain = chain
          .then(installDependencies)
          .then(finish);
      }
    }

    resolve();
  });
}

module.exports = {
  init: function (conf) {
    console.log('\nGetting starter files... ' + emoji.get('runner'));

    build(conf);
  },
  emoji: emoji
}