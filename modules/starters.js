'use strict';

const lib = require('../lib/library'),
  inquirer = require('inquirer'),
  noEmoji = /^win/.test(process.platform),
  defaultGit = 'https://github.com/justcoded/web-starter-kit.git';

let config = [];

if (noEmoji) {
  emoji.get = () => '';
}

module.exports = () => {
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
        console.log(answers.value);
        switch (answers.value) {
          case 'Gulp':
            // Gulp git
            config.push({
              url: defaultGit,
              branch: 'master'
            });
            break;
          case 'Webpack':
            console.log('In maintenance, sorry '.red + emoji.get('hourglass'));
            return;
          default:
            console.log('Something went wrong!'.red);
        }
        resolve();
      });
    });
  }

  projectType().then(() => {
    let questions = [{
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
          if (answers.value === 'Without-SCSS-Map') {
            config.push({
              // Without-SCSS-Map git branch
              url: defaultGit,
              branch: 'Without-SCSS-Map'
            });
          }
          return answers.value;
        },
        message: 'Would you like to use Bootstrap?',
        type: 'list',
        name: 'value',
        choices: [{
          name: 'Yes',
          // With-Bootstrap git branch
          value: 'With-Bootstrap',
          delete: [
            'src/scss/abstracts',
            'src/scss/base'
          ]
        }, {
          name: 'No',
          value: 'default'
        }]
      }
    ];

    inquirer.prompt(questions).then(answers => {
      if (answers.value !== 'default') {
        config.push({
          url: defaultGit,
          branch: answers.value
        });
      }

      lib.init(config);
    });
  });
};