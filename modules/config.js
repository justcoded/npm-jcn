'use strict';

module.exports = function (options) {
  return {
    /**
     * Read config.json file and set it to global 'config' variable
     * @function
     */
    readConfigFile: function () {
      return new Promise((resolve, reject) => {
        try {
          let config = JSON.parse(options.fs.readFileSync('./config.json', 'utf8'));
          resolve(config);
          return config;
        } catch (e) {
          console.log('No config file.');
          resolve();
        };
      });
    }
  }
};