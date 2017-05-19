'use strict';

module.exports = function (options) {
  const fs = options.fs;

  return {
    /**
     * Read vendor file and execute callback
     * @function
     * @param {Object} settings - Information about vendor
     * @param {string} settings.path - Path to vendor file
     * @param {callback} settings.deleteVendor - Function wich deletes vendors
     * @param {callback} settings.addVendor - Function wich adds vendors
     */
    changeVendor: function (settings) {
      return new Promise((resolve, reject) => {
        let vendor;

        if (typeof settings.config === 'undefined') {
          return resolve();
        }

        try {
          vendor = fs.readFileSync(settings.path, 'utf8').toString().split('\n');
        } catch (e) {
          options.errorMessage(e);
          return reject();
        }

        settings.addVendor(vendor, settings.path, settings.config)
          .then(settings.deleteVendor.bind(null, vendor, settings.path, settings.config))
          .then(resolve);
      });
    },
    /**
     * Add vendors to scss vendor file
     * @function
     * @param {Object} vendorScss - Content of the scss vendor file
     * @param {string} path - Path to scss vendor file
     */
    addVendorScss: function (vendorScss, path, config) {
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
            options.errorMessage(e);
            reject();
          }
        }
      });
    },
    /**
     * Delete vendors from scss vendor file
     * @function
     * @param {Object} vendorScss - Content of the scss vendor file
     * @param {string} path - Path to scss vendor file
     */
    deleteVendorScss: function (vendorScss, path, config) {
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
            options.errorMessage(e);
            reject();
          }
        }
      });
    },
    /**
     * Add vendors to js vendors file
     * @function
     * @param {Object} vendorJs - Content of the js vendor file
     * @param {string} path - Path to js vendor file
     */
    addVendorJs: function (vendorJs, path, config) {
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
            options.errorMessage(e);
            reject();
          }

          resolve();
        }
      });
    },
    /**
     * Delete vendors from js vendors file
     * @function
     * @param {Object} vendorJs - Content of the js vendor file
     * @param {string} path - Path to js vendor file
     */
    deleteVendorJs: function (vendorJs, path, config) {
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
            options.errorMessage(e);
            reject();
          }
          resolve();
        }
      });
    }
  }
};