'use strict';

const inquirer = require('inquirer'),
      colors   = require('colors'),
      shell    = require('shelljs/global'),
      fs       = require('fs'),
      copydir  = require('copy-dir'),
      emoji    = require('node-emoji'),
      del      = require('del'),
      noEmoji  = /^win/.test(process.platform);

if(noEmoji) {
  emoji.get = () => '';
}

function logComplete(task) {
  console.log('['.green + task.green + ' ' + emoji.get('white_check_mark') + ' ]\n'.green);
}

function folderExists(src) {
  return fs.existsSync(src);
}

function createTmpFolder() {
  return new Promise((resolve, reject) => {
    if( folderExists('tmp') ) {
      console.log('Destination path already exists and is not an empty directory. '.red + emoji.get('cry'));
      return;
    }
    exec('mkdir tmp');
    cd('tmp');

    resolve();
  });
}

function gitClone(repo) {
  return new Promise((resolve, reject) => {
    exec('git clone ' + repo + ' ./');
    del.sync(['.git']);
    logComplete('Git cloning has been completed')

    resolve();
  });
}

function installDependencies() {
  return new Promise((resolve, reject) => {
    console.log('Installing npm dependencies...');
    exec('npm install');
    logComplete('Dependencies have been installed');

    resolve();
  });
}

function moveFiles() {
  return new Promise((resolve, reject) => {
    console.log('Copying files...');
    copydir('../tmp', '../', (err) => {
      if(err) {
        console.log(err);
        return;
      }
      cd('..');
      del.sync(['tmp']);
      logComplete('Copying files has been completed');

      resolve();
    });
  });
}

function init(repo) {
  createTmpFolder().then(
    () => {
      console.log('\nGetting starter files... ' + emoji.get('runner'));
      gitClone(repo).then(
        () => {
          moveFiles().then(
            () => {
              installDependencies().then(
                () => {
                  console.log('Starter has been successfully installed. Good luck '.green +
                    emoji.get('wink') + ' \n\u00A9 JustCoded'.green);
                }
              )
            }
          )
        }
      )
    }
  );
}

module.exports = function() {
  let qTypes = [
    {
      message: 'Select project type:',
      type: 'list',
      name: 'answer',
      choices: [
        {
          name: 'Markup ' + emoji.get('spiral_note_pad'),
          value: 'markup'
        }, {
          name: 'JS ' + emoji.get('hammer_and_wrench'),
          value: 'js'
        }
      ]
    }
  ];

  console.log('\n*****************************************\n*\tWelcome to JustCoded Starter\t*\n*****************************************\n'.green);

  let prompt = inquirer.createPromptModule();

  prompt(qTypes).then((answers) => {
    commands(answers)
  });

  function commands(info) {
    info.type = {
      repo: 'https://github.com/justcoded/web-starter-kit.git'
    };

    if (!info.type) {
      console.log('Still in maintenance, sorry '.red + emoji.get('hourglass'));
      return;
    }

    switch(info.answer) {
      case 'markup':
        init(info.type.repo);
        break;
      case 'js':
        console.log('In maintenance, sorry '.red + emoji.get('hourglass'));
        return;
      default:
        console.log('Wrong answer '.red + emoji.get('crab'));
    };
  }
};
