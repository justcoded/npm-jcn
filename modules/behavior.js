'use strict';

const colors = require('colors'),
  shell = require('shelljs/global'),
  fs = require('fs'),
  emoji = require('node-emoji'),
  del = require('del'),
  copydir = require('copy-dir'),
  noEmoji = /^win/.test(process.platform);

if (noEmoji) {
  emoji.get = () => '';
}

let config = {},
  configClass = require('./config')({
    fs: fs,
    del: del
  }),
  git = require('./git')({
    folderExists: folderExists,
    logComplete: logComplete,
    del: del,
    emoji: emoji
  }),
  dependencies = require('./dependencies')({
    errorMessage: errorMessage,
    logComplete: logComplete,
    fs: fs
  }),
  vendor = require('./vendor')({
    errorMessage: errorMessage,
    fs: fs
  });

/**
 * Output "Complete" message
 * @function
 */
function logComplete(task) {
  console.log('['.green + task.green + ' ' + emoji.get('white_check_mark') + ' ]\n'.green);
}

/**
 * Output "Error" message
 * @function
 */
function errorMessage(e) {
  console.log(`Error: ${e}`.red);
}

/**
 * Check if the folder exists
 * @function
 */
function folderExists(src) {
  return fs.existsSync(src);
}

/**
 * Delete files
 * @function
 * @param {string[]} deleteArray - Array of paths
 */
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

/**
 * Copy files from temporary folder to root folder
 * @function
 */
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

/**
 * Output successfully message and run gulp
 * @function
 */
function finish() {
  console.log('Starter has been successfully installed. Good luck '.green +
    emoji.get('wink') + ' \n\u00A9 JustCoded'.green);
  if (Array.prototype.indexOf.call(process.argv, '-d') < 0) {
    exec('gulp');
  }
}


/**
 * Execute all functions synchronically
 * @function
 * @param {Object} conf - Information about git repositary and paths to files to delete
 */
function build(conf, isWPforPug) {
  return new Promise((resolve, reject) => {

    // define source path for WordPress projects or clean frontend projects (isWP_Path)
    let isWP_Path = isWPforPug == 'WordPress-With-Pug' ? 'assets' : 'src';

    let chain = Promise.resolve();

    for (var i = 0; i < conf.length; i++) {
      // Always delete files from repositories[i].filesToDelete
      // create temporary folder and clone into it
      // move cloned files from temporary folder to root folder
      chain = chain
        .then(deleteFiles.bind(null, conf[i].filesToDelete || null)).catch(e => {
          errorMessage(e);
        })
        .then(git.createTmpFolder).catch(e => {
          errorMessage(e);
        })
        .then(git.gitClone.bind(null, conf[i])).catch(e => {
          errorMessage(e);
        })
        .then(moveFiles).catch(e => {
          errorMessage(e);
        });

      // If not the first call read config file and configure package.json
      if (i !== 0) {
        chain = chain
          .then(() => {
            return new Promise((resolve, reject) => {
              configClass.readConfigFile()
                .then(res => {
                  config = res;
                  resolve();
                }).catch(e => {
                  errorMessage(e);
                  reject();
                });
            });
          }).catch(e => {
            errorMessage(e);
          })
          .then(() => {
            return new Promise((resolve, reject) => {
              dependencies.configurePackageJson(config)
                .then(resolve).catch(e => {
                  errorMessage(e);
                });
            });
          }).catch(e => {
            errorMessage(e);
          })
          .then(() => {
            return new Promise((resolve, reject) => {
              vendor.changeVendor({
                  config: config,
                  path: './'+isWP_Path+'/vendor_entries/vendor.scss',
                  addVendor: vendor.addVendorScss,
                  deleteVendor: vendor.deleteVendorScss
                })
                .then(resolve);
            });
          }).catch(e => {
            errorMessage(e);
          })
          .then(() => {
            return new Promise((resolve, reject) => {
              vendor.changeVendor({
                  config: config,
                  path: './'+isWP_Path+'/vendor_entries/vendor.js',
                  addVendor: vendor.addVendorJs,
                  deleteVendor: vendor.deleteVendorJs
                })
                .then(resolve);
            });
          }).catch(e => {
            errorMessage(e);
          });
      }

      // If the last call install node modules and run gulp
      if (i == conf.length - 1) {
        chain = chain
          .then(dependencies.installDependencies).catch(e => {
            errorMessage(e);
          })
          .then(finish).catch(e => {
            errorMessage(e);
          });
      }
    }

    resolve();
  });
}

/**
 * Export init function and emoji module
 * @module
 * @param {Object} module.init - Build function
 * @param {Object} module.emoji - Emoji module
 */
module.exports = {
  init: function (conf, isWPforPug) {
    console.log('\nGetting starter files... ' + emoji.get('runner'));
    build(conf, isWPforPug);
  },
  emoji: emoji
}