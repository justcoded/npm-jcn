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

/**
 * Output complete message
 * @function
 */
function logComplete(task) {
  console.log('['.green + task.green + ' ' + emoji.get('white_check_mark') + ' ]\n'.green);
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
 * Read config.json file and set it to global 'config' variable
 * @function
 */
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

/**
 * Read and configure a package.json file
 * @function
 */
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
      return resolve();
    }

    if ('delete' in config) {
      if (typeof packageFile === 'undefined') {
        reject();
      }
      changeDependencies(packageFile, config.delete, 'delete')
        .catch(e => {
          console.log(e);
        })
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
              })
              .catch(e => {
                console.log(e);
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

/**
 * Add and delete dependencies in package.json file
 * @function
 * @param {string} packageFile - Content of the package.json file
 * @param {Object} config - Content of the subobject of a global object 'config'
 * @param {string} method - Delete or Add method
 */
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
      .catch(e => {
        console.log(e);
      })
      .then(instructions.bind(null, config, 'devDependencies'))
      .catch(e => {
        console.log(e);
      })
      .then(resolve);
  });
}

/**
 * Read vendor file and execute callback
 * @function
 * @param {Object} options - Information about vendor
 * @param {string} options.path - Path to vendor file
 * @param {callback} options.deleteVendor - Function wich deletes vendors
 * @param {callback} options.addVendor - Function wich adds vendors
 */
function changeVendor(options) {
  return new Promise((resolve, reject) => {
    let vendor;

    if (typeof config === 'undefined') {
      return resolve();
    }

    try {
      vendor = fs.readFileSync(options.path, 'utf8').toString().split('\n');
    } catch (e) {
      console.log(e)
      return reject();
    }

    options.addVendor(vendor, options.path)
      .then(options.deleteVendor.bind(null, vendor, options.path))
      .then(resolve);
  });
}

/**
 * Add vendors to scss vendor file
 * @function
 * @param {Object} vendorScss - Content of the scss vendor file
 * @param {string} path - Path to scss vendor file
 */
function addVendorScss(vendorScss, path) {
  return new Promise((resolve, reject) => {
    if (typeof config.add.vendorScss === 'undefined') {
      return resolve();
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

/**
 * Delete vendors from scss vendor file
 * @function
 * @param {Object} vendorScss - Content of the scss vendor file
 * @param {string} path - Path to scss vendor file
 */
function deleteVendorScss(vendorScss, path) {
  return new Promise((resolve, reject) => {
    if (typeof config.delete.vendorScss === 'undefined') {
      return resolve();
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
}

/**
 * Add vendors to js vendors file
 * @function
 * @param {Object} vendorJs - Content of the js vendor file
 * @param {string} path - Path to js vendor file
 */
function addVendorJs(vendorJs, path) {
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

/**
 * Delete vendors from js vendors file
 * @function
 * @param {Object} vendorJs - Content of the js vendor file
 * @param {string} path - Path to js vendor file
 */
function deleteVendorJs(vendorJs, path) {
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

/**
 * Create buffer (temporary folder) for git cloning
 * @function
 */
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

/**
 * Clone git repository with specific branch
 * @function
 * @param {Object} repo - Repository information
 * @param {string} repo.url - Repository url
 * @param {string} repo.branch - Repository branch
 */
function gitClone(repo) {
  return new Promise((resolve, reject) => {
    console.log('Clone from ' + repo.url + ' ' + repo.branch);
    exec('git clone ' + repo.url + ' ./ -b ' + repo.branch);
    del.sync(['.git', '.travis.yml']);
    logComplete('Git cloning has been completed');

    resolve();
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
 * Run npm install
 * @function
 */
function installDependencies() {
  return new Promise((resolve, reject) => {
    console.log('Installing npm dependencies...');
    exec('npm install');
    logComplete('Dependencies have been installed');

    resolve();
  });
}

/**
 * Output successfully message and run gulp
 * @function
 */
function finish() {
  console.log('Starter has been successfully installed. Good luck '.green +
    emoji.get('wink') + ' \n\u00A9 JustCoded'.green);
  exec('gulp');
}


/**
 * Execute all functions synchronically
 * @function
 * @param {Object} conf - Information about git repositary and paths to files to delete
 */
function build(conf) {
  return new Promise((resolve, reject) => {

    let chain = Promise.resolve();

    for (var i = 0; i < conf.length; i++) {
      // Always delete files from repositories[i].filesToDelete
      // create temporary folder and clone into it
      // move cloned files from temporary folder to root folder
      chain = chain
        .then(deleteFiles.bind(null, conf[i].filesToDelete || null))
        .catch(e => {
          console.log(e);
        })
        .then(createTmpFolder)
        .catch(e => {
          console.log(e);
        })
        .then(gitClone.bind(null, conf[i]))
        .catch(e => {
          console.log(e);
        })
        .then(moveFiles)
        .catch(e => {
          console.log(e);
        });

      // If not the first call read config file and configure package.json
      if (i !== 0) {
        chain = chain
          .then(readConfigFile)
          .catch(e => {
            console.log(e);
          })
          .then(configurePackageJson)
          .catch(e => {
            console.log(e);
          })
          .then(changeVendor.bind(null, {
            path: './src/vendor_entries/vendor.scss',
            addVendor: addVendorScss,
            deleteVendor: deleteVendorScss
          }))
          .catch(e => {
            console.log(e);
          })
          .then(changeVendor.bind(null, {
            path: './src/vendor_entries/vendor.js',
            addVendor: addVendorJs,
            deleteVendor: deleteVendorJs
          }))
          .catch(e => {
            console.log(e);
          });
      }

      // If the last call install node modules and run gulp
      if (i == conf.length - 1) {
        chain = chain
          .then(installDependencies)
          .catch(e => {
            console.log(e);
          })
          .then(finish)
          .catch(e => {
            console.log(e);
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
  init: function (conf) {
    console.log('\nGetting starter files... ' + emoji.get('runner'));

    build(conf);
  },
  emoji: emoji
}