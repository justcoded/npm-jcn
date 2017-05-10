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

function readConfigFiles(index) {
  return new Promise((resolve, reject) => {
    let packageFile, config;

    if (index === 0) resolve();

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

    try {
      config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
      del.sync(['./config.json']);
      if (typeof packageFile === 'undefined') {
        console.log('package.json was not loaded!');
        reject();
      } else {
        if ('delete' in config) {
          changeDependencies(packageFile, config.delete, 'delete')
            .then(() => {
              if ('add' in config) {
                changeDependencies(packageFile, config.add, 'add')
                  .then(() => {
                    try {
                      fs.writeFileSync('./package.json', JSON.stringify(packageFile, null, 2), 'utf8');
                    } catch (e) {
                      console.log(e);
                    }

                    resolve();
                  });
              }
            })
            .catch(e => {
              console.log(e);
              reject();
            });
        }
      }
    } catch (e) {
      console.log('No config file. Continue...');
      reject();
    }

    resolve();
  });
}

function changeDependencies(packageFile, config, method) {
  return new Promise((resolve, reject) => {
    let instructions;
    // Delete me
    let object = {
      "delete": {
        "dependencies": [
          "normalize.css"
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

    if (method === 'delete') {
      instructions = (object1, field) => {
        // Change to object
        return new Promise((resolve, reject) => {
          for (let item of object['delete'][field]) {
            if (field in packageFile && item in packageFile[field]) {
              delete packageFile[field][item];
            }
          }

          resolve();
        });
      };
    } else {
      instructions = (object1, field) => {
        // Change to object
        return new Promise((resolve, reject) => {
          for (let item in object['add'][field]) {
            packageFile[field][item] = object['add'][field][item];
          }

          resolve();
        });
      }
    }

    if ('dependencies' in config) {
      instructions(config, 'dependencies')
        .then(() => {
          if ('devDependencies' in config) {
            instructions(config, 'devDependencies');
          }
        });
    }

    // if ('vendorJs' in config) {
    //   instructions(config['vendorJs']);
    // }
    // if ('vendorScss' in config) {
    //   instructions(config['vendorScss']);
    // }
    resolve();
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
        .then(moveFiles)
        .then(readConfigFiles.bind(null, i))

      if (i == repositories.length - 1) {
        chain = chain
          .then(installDependencies)
          .then(finish);
      }
    }

    resolve();
  });
}

exports.init = function (repositories) {
  console.log('\nGetting starter files... ' + emoji.get('runner'));

  build(repositories);
};