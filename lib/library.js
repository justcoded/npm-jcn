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
  lib.emoji.get = () => '';
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

function readConfigFiles() {
  return new Promise((resolve, reject) => {
    try {
      // Uncomment me
      // config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
      // Delete me
      config = {
        "delete": {
          "dependencies": [
            "normalize.css"
          ],
          "vendorJs": [
            "./node_modules/EXAMPLE1",
            "./node_modules/EXAMPLE2"
          ],
          "vendorScss": [
            "@import '../../node_modules/normalize.css/normalize';"
          ]
        },
        "add": {
          "dependencies": {
            "jquery": "~2.2.4",
            "bootstrap-sass": "^3.3.7"
          },
          "vendorJs": [
            "./node_modules/bootstrap-sass/assets/javascripts/bootstrap.min.js"
          ],
          "vendorScss": [
            "@import '../scss/abstracts/_bootstrap-variables.scss';",
            "@import '../../node_modules/bootstrap-sass/assets/stylesheets/_bootstrap.scss';"
          ]
        }
      };
      del.sync(['./config.json']);
      resolve();
    } catch (e) {
      console.log(e);
      reject();
    };
  });
}

function configurePackageJson() {
  return new Promise((resolve, reject) => {
    let packageFile;

    try {
      // Uncomment me
      // packageFile = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      // Delete me
      packageFile = {
        "name": "web-starter-jc",
        "version": "1.0.0",
        "description": "Starter kit for markup projects",
        "repository": {
          "type": "git",
          "url": "git+https://github.com/justcoded/web-starter-kit"
        },
        "keywords": [
          "starter",
          "markup",
          "JustCoded",
          "jc"
        ],
        "author": "JustCoded",
        "license": "MIT",
        "bugs": {
          "url": "https://github.com/justcoded/web-starter-kit/issues"
        },
        "homepage": "https://github.com/justcoded/web-starter-kit",
        "devDependencies": {
          "babel-preset-es2015": "^6.24.0",
          "babelify": "^7.3.0",
          "browser-sync": "^2.18.0",
          "browserify": "^14.0.0",
          "del": "^2.2.2",
          "files-exist": "^1.0.2",
          "gulp": "^3.9.1",
          "gulp-autoprefixer": "^3.1.1",
          "gulp-concat": "^2.6.1",
          "gulp-cssimport": "^5.0.0",
          "gulp-cssnano": "^2.1.2",
          "gulp-debug": "^3.1.0",
          "gulp-group-css-media-queries": "^1.2.0",
          "gulp-htmlhint": "^0.3.1",
          "gulp-imagemin": "^3.1.1",
          "gulp-jshint": "^2.0.4",
          "gulp-newer": "^1.3.0",
          "gulp-notify": "^3.0.0",
          "gulp-rename": "^1.2.2",
          "gulp-sass": "^3.1.0",
          "gulp-sourcemaps": "^2.4.1",
          "gulp-uglify": "^2.1.0",
          "gulp-util": "^3.0.8",
          "gulp-watch": "^4.3.11",
          "htmlhint-stylish": "^1.0.3",
          "imagemin-pngquant": "^5.0.0",
          "jshint": "^2.9.4",
          "node-notifier": "^5.0.2",
          "path": "^0.12.7",
          "run-sequence": "^1.2.2",
          "vinyl-buffer": "^1.0.0",
          "vinyl-source-stream": "^1.1.0"
        },
        "engines": {
          "node": ">=4.0.0"
        },
        "scripts": {
          "test": "gulp production",
          "start": "gulp"
        },
        "dependencies": {
          "include-media": "~1.4.9",
          "jquery": "~2.2.4",
          "normalize.css": "~5.0.0"
        }
      };
    } catch (e) {
      console.error('There was an error reading the file!');
    }

    if ('delete' in config) {
      if (typeof packageFile === 'undefined') {
        console.log('package.json was not loaded!');
        reject();
      }
      // Change dependencies in package.json file
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
        // Change to object
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
        // Change to object
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
            let lastChar = vendorScss[4].substr(vendorScss[4].length - 1),
              index;
            if (lastChar === '\n') {
              index = vendorScss.indexOf(item + '\n');
            } else {
              index = vendorScss.indexOf(item);
            }

            if (index > 1) {
              vendorScss.splice(index, 1);
              try {
                fs.writeFileSync(path, vendorScss.join().replace(/,/g, ''), 'utf8');
                resolve();
              } catch (e) {
                console.log(e);
                reject();
              }
            }
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

function changeVendorJs() {
  return new Promise((resolve, reject) => {
    let path = './src/vendor_entries/vendor.js',
      vendorJs,
      addVendor,
      deleteVendor;

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
          for (let item of config.add.vendorJs) {
            vendorJs.splice(vendorJs.length - 1, 0, `  '${item}'`);
          }
          for (let i = 0; i < vendorJs.length; i++) {
            if (vendorJs[i].indexOf('.js\'') > 0) {
              vendorJs[i] += '|';
            }
            vendorJs[i] += '\n';
          }
          try {
            fs.writeFileSync(path, vendorJs.join().replace(/,/g, '').replace(/\|/g, ','), 'utf8');
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
          .then(readConfigFiles)
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