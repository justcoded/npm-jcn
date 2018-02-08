'use strict';

const behavior = require('./behavior'),
  inquirer = require('inquirer'),
  isWindows = /^win/.test(process.platform),
  defaultGit = 'https://github.com/justcoded/web-starter-kit.git';

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
          name: 'Gulp',
          value: 'Gulp'
        }, {
          name: 'Webpack',
          value: 'Webpack'
        }]
      }];

      inquirer.prompt(questions).then(answers => {
        switch (answers.value) {
          case 'Gulp':
            // Push the additional information to config
            config.push({
              url: defaultGit,
              branch: 'master' // Gulp branch
            });
            break;
          case 'Webpack':
            console.log('In maintenance, sorry '.red + behavior.emoji.get('hourglass'));
            return;
          default:
            console.log('Something went wrong!'.red);
            return;
        }
        resolve();
      });
    });
  }

  projectType()
    .then(() => {
      let questions = [{
          message: 'Would you like to use RequireJS module loader?',
          type: 'list',
          name: 'value',
          choices: [{
            name: 'Yes',
            // With-Require git branch
            value: 'With-Require'
          }, {
            name: 'No',
            value: 'default'
          }],
        }, {
          when: function (answers) {
            if (answers.value === 'With-Require') {
              // Push the additional information to config
              config[0] = {
                url: defaultGit,
                branch: 'With-Require'
              };

              return false;
            }

            return true;
          },
          message: 'Would you like to use Pug?',
          type: 'list',
          name: 'value',
          choices: [{
            name: 'Yes',
            // With-Pug git branch
            value: 'With-Pug'
          }, {
            name: 'No',
            value: 'default'
          }],
        },
        {
          when: function (answers) {
            if (answers.value === 'With-Require') {
              return false;
            }

            if (answers.value === 'With-Pug') {
              // Push the additional information to config
              config.push({
                url: defaultGit,
                branch: 'With-Pug'
              });
            }

            return true;
          },
          message: 'Would you like to use CSS Framework?',
          type: 'list',
          name: 'value',
          choices: [{
            name: 'Yes',
            value: 'CssFramework-Yes'
          }, {
            name: 'No',
            value: 'CssFramework-No'
          }],
        },
        {
          when: function (answers) {
            return answers.value === 'CssFramework-No' ? true : false;
          },
          // This question will appear only if user doesn't want to use CSS Frameworks
          message: 'Would you like to use SCSS maps?',
          type: 'list',
          name: 'value',
          choices: [{
            name: 'Yes',
            value: 'default'
          }, {
            name: 'No',
            value: 'Without-SCSS-Map'
          }]
        },
        {
          when: function (answers) {
            return answers.value === 'CssFramework-Yes' ? true : false;
          },
          // This question will appear onlu if user wantsto use CSS Frameworks
          message: 'Which Framework do you want to use?',
          type: 'list',
          name: 'value',
          choices: [{
            name: 'Bootstrap',
            // With-Bootstrap git branch
            value: 'With-Bootstrap'
          }, {
            name: 'Materialize',
            // With-Materialize git branch
            value: 'With-Materialize'
          }]
        }
      ];

      inquirer.prompt(questions)
        .then(answers => {
          switch (answers.value) {
            case 'Without-SCSS-Map':
            case 'With-Bootstrap':
            case 'With-Materialize':
              // Push the additional information to config
              config.push({
                url: defaultGit,
                branch: answers.value
              });
              break;
          }

          behavior.init(config);
        })
        .catch(e => {
          console.log(e);
        });
    })
    .catch(e => {
      console.log(e);
    });;
};