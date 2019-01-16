'use strict';

const behavior = require('./behavior'),
  inquirer = require('inquirer'),
  isWindows = /^win/.test(process.platform),
  defaultGit = 'https://github.com/justcoded/web-starter-kit.git';

let config = [];
let isWPforPug = '';
let isWpGulp = '';

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
            
            isWPforPug = 'With-Pug';

            break;
          case 'WordPress':
            config.push({
              url: defaultGit,
              branch: 'WordPress-Gulp' // Gulp+WP branch
            });

            isWpGulp = 'WordPress-Gulp-';
            isWPforPug = 'WordPress-With-Pug';

            break;
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
          message: 'Would you like to use Pug?',
          type: 'list',
          name: 'value',
          choices: [{
            name: 'Yes',
            // With-Pug git branch
            value: 'With-Pug'
          }, {
            name: 'No',
            value: 'Markup-Gulp'
          }],
        },
        {
          when: function (answers) {
            if (answers.value === 'With-Pug') {
              // Push the additional information to config
              config.push({
                url: defaultGit,
                branch: isWPforPug
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
                branch: isWpGulp + answers.value
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
