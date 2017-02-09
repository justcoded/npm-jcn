var inquirer = require('inquirer'),
  colors = require('colors'),
  shell = require('shelljs/global');

colors.setTheme({
  info: ['white', 'bgBlack'],
  success: ['green', 'bgBlack'],
  warn: ['orange', 'bgBlack'],
  error: ['red', 'bgBlack']
});

function logComplete() {
  console.log('[Complete]'.success);
  console.log('\n\n');
}

module.exports = function() {
  var qTypes = [{
      message: 'Do you need markup starter?',
      type: 'list',
      name: 'isMarkup',
      choices: [{
        name: 'Yes',
        value: true
      }, {
        name: 'No',
        value: false
      }]
    }, {
      message: 'Type new project repository url (Default: no repository)',
      type: 'input',
      name: 'repo',
      when: function(answers) {
        return !answers.isMarkup;
      }
    }, {
      message: function(answers) {
        return 'Type your branch (default: master)';
      },
      when: function(answers) {
        return answers.repo;
      },
      type: 'input',
      name: 'branch'
    }

  ];

  var prompt = inquirer.createPromptModule();

  // inquirer.prompt(qTypes, commands);
  prompt(qTypes).then(function (answers) {
    commands(answers)
});

  function commands(info) {
    console.log(info);
    info.type = {
        repo: 'https://github.com/justcoded/web-starter-kit.git',
        branch: 'master',
        exec: function() {
          console.log('Installing Npm and Bower dependencies'.info);
          exec('npm install');
          logComplete();
        }
    };

    if (!info.type) {
      console.log('Still in maintenance, sorry :('.red);
      return;
    }
    if (info.isMarkup) {
      exec('mkdir markup');
      cd('markup');
    }
    console.log('Getting starter files'.info);
    exec('git clone ' + info.type.repo + ' ./');
    logComplete();
    exec('rm -rf .git');
    if (info.repo) {
      info.branch = info.branch || 'master';
      console.log('Create initial commit and push it into repository'.info);
      exec('git init && git add . && git commit -m "Init Starter Kit"');
      logComplete();
      exec('git remote add origin ' + info.repo);
      console.log('Pushing the code to the repository'.info);
      exec('git push origin ' + info.branch);
      logComplete();
    }
    info.type.exec && info.type.exec();
    console.log('Starter was successfully installed. Good luck :)'.success);
  }
};
