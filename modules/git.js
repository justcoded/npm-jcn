'use strict';

module.exports = function (options) {
  return {
    /**
     * Clone git repository with specific branch
     * @function
     * @param {Object} repo - Repository information
     * @param {string} repo.url - Repository url
     * @param {string} repo.branch - Repository branch
     */
    gitClone: function (repo) {
      return new Promise((resolve, reject) => {
        console.log('Clone from ' + repo.url + ' ' + repo.branch);
        exec('git clone ' + repo.url + ' ./ -b ' + repo.branch);
        options.del.sync(['.git', '.travis.yml']);
        options.logComplete('Git cloning has been completed');

        resolve();
      });
    },
    /**
     * Create buffer (temporary folder) for git cloning
     * @function
     */
    createTmpFolder: function () {
      return new Promise((resolve, reject) => {
        if (options.folderExists('tmp')) {
          console.log('Destination path already exists and is not an empty directory. '.red + options.emoji.get('cry'));
          return;
        }
        exec('mkdir tmp');
        cd('tmp');

        resolve();
      });
    }
  }
};