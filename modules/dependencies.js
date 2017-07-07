'use strict';

module.exports = function (options) {
  return {
    /**
     * Read and configure a package.json file
     * @function
     */
    configurePackageJson: function (config) {
      return new Promise((resolve, reject) => {
        let packageFile;

        try {
          packageFile = JSON.parse(options.fs.readFileSync('./package.json', 'utf8'));
        } catch (e) {
          console.error('There was an error reading the file!');
          reject();
        }

        if (typeof config === 'undefined') {
          return resolve();
        }

        if ('delete' in config) {
          if (typeof packageFile === 'undefined') {
            return reject();
          }
          this._changeDependencies(packageFile, config.delete, 'delete')
            .catch(e => {
              console.log(e);
            })
            .then(() => {
              if ('add' in config) {
                this._changeDependencies(packageFile, config.add, 'add')
                  .then(() => {
                    try {
                      options.fs.writeFileSync('./package.json', JSON.stringify(packageFile, null, 2), 'utf8');
                      resolve();
                    } catch (e) {
                      console.log(e);
                      reject();
                    }
                  }).catch(e => {
                    console.log(e);
                  });
              }
            }).catch(e => {
              console.log(e);
              reject();
            });
        }
      });
    },
    /**
     * Add and delete dependencies in package.json file
     * @function
     * @param {string} packageFile - Content of the package.json file
     * @param {Object} config - Content of the subobject of a global object 'config'
     * @param {string} method - Delete or Add method
     */
    _changeDependencies: function (packageFile, config, method) {
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
            options.errorMessage(e);
          })
          .then(instructions.bind(null, config, 'devDependencies'))
          .catch(e => {
            options.errorMessage(e);
          })
          .then(resolve);
      });
    },
    /**
     * Run npm install
     * @function
     */
    installDependencies: function () {
      return new Promise((resolve, reject) => {
        if (Array.prototype.indexOf.call(process.argv, '-d') < 0) {
          console.log('Installing npm dependencies...');
          exec('npm install');
          options.logComplete('Dependencies have been installed');
        }

        resolve();
      });
    }
  }
};