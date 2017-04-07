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
    console.log('\n');
}

module.exports = function() {
    var qTypes = [{
        message: '\n********************************************\n\n* Welcome to JustCoded Starter. *\n\n********************************************\n \n Select project type:',
        type: 'list',
        name: 'isMarkup',
        choices: [{
            name: 'Markup',
            value: true
        }, {
            name: 'JS',
            value: false
        }]
    }
    ];

    var prompt = inquirer.createPromptModule();

    prompt(qTypes).then(function (answers) {
        commands(answers)
    });

    function commands(info) {
        console.log(info);
        info.type = {
            repo: 'https://github.com/justcoded/web-starter-kit.git',
            branch: 'master',
            exec: function() {
                console.log('Installing Npm dependencies'.info);
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
        if (!info.isMarkup) {
            console.log('In maintenance, sorry :('.red);
            return;
        }
        console.log('Getting starter files'.info);
        exec('git clone ' + info.type.repo + ' ./');
        logComplete();
        exec('rm -rf .git');
        info.type.exec && info.type.exec();
        console.log('Starter was successfully installed. Good luck :) JustCoded'.success);
    }
};
