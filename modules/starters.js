'use strict';

const lib = require('../lib/library'),
  inquirer = require('inquirer'),
  noEmoji = /^win/.test(process.platform);

if (noEmoji) {
  emoji.get = () => '';
}

module.exports = function () {
  let qTypes = [{
    message: 'Select project type:',
    type: 'list',
    name: 'value',
    choices: [{
      name: 'Markup',
      // Branch name
      value: true
    }, {
      name: 'JavaScript',
      // Branch name
      value: false
    }]
  },
  {
    when: function (response) {
      return response.value;
    },
    message: 'Would you like to use SCSS maps?',
    type: 'list',
    name: 'value',
    choices: [{
      name: 'Yes',
      // Branch name
      value: 'master'
    }, {
      name: 'No',
      // Branch name
      value: 'Without-SCSS-Map'
    }]
  },
  ];

  console.log('\n*****************************************\n*\tWelcome to JustCoded Starter\t*\n*****************************************\n'.green);

  let prompt = inquirer.createPromptModule();

  prompt(qTypes).then((answers) => {
    commands(answers);
  });

  function commands(info) {
    if (!info.value) {
      console.log('In maintenance, sorry '.red + emoji.get('hourglass'));
      return;
    }

    lib.init({
      url: 'https://github.com/justcoded/web-starter-kit.git',
      branch: info.value
    });
  }
};