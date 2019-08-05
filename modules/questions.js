'use strict';

const inquirer = require('inquirer'),
  isWindows = /^win/.test(process.platform),
  defaultGit = 'https://github.com/vladimirpikul/web-starter-kit.git';

let config = [];

module.exports = () => {
  // Check the jcn version (currently doesn't work on Windows)
  if (!isWindows) {
    let remoteVersion,
      localVersion;

    console.log('Local version: ');
    localVersion = exec('npm list jcn -g | grep jcn@ | egrep -o "([0-9]{1,}\.)+[0-9]{1,}"');
    console.log('Latest version: ');
    remoteVersion = exec('npm view jcn version');

    if (localVersion < remoteVersion) {
      console.log('You should update the jcn:\nsudo npm install jcn -g'.red);
    }
  }

  console.log('\n*****************************************\n*\tWelcome to JustCoded Starter\t*\n*****************************************\n'.green);

  function projectType() {
    return new Promise(function (resolve, reject) {

      let questions = [{
        message: 'Select project type:',
        type: 'list',
        name: 'value',
        choices: [{
          name: 'Front-end',
          value: 'Front-end'
        }, {
          name: 'WordPress',
          value: 'WordPress'
        }]
      }];



      inquirer.prompt(questions).then(answers => {

        switch (answers.value) {
          case 'Front-end':
            // Push the additional information to config
            config.push({
              url: defaultGit,
              branch: 'master' // Gulp branch
            });

            break;
          case 'WordPress':
            config.push({
              url: defaultGit,
              branch: 'WordPress-Gulp' // Gulp+WP branch
            });

            break;
          default:
            console.log('Something went wrong!'.red);
            return;
        }
        resolve();
      });
    });
  }

};
