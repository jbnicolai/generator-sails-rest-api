var crypto = require('crypto'),
    chalk = require('chalk'),
    printMessage = require('print-message'),
    updateNotifier = require('update-notifier'),
    yeoman = require('yeoman-generator'),
    yosay = require('yosay'),
    inquirer = require('yo/node_modules/inquirer');

/**
 * List of questions
 * @type {Array}
 * @private
 */
var QUESTIONS_LIST = [{
    type: "list",
    name: "database:adapter",
    message: "Choose database adapter",
    default: 1,
    choices: [
        "MySQL",
        "Mongo",
        "PostgreSQL",
        "Redis"
    ]
}, {
    type: "input",
    name: "database:host",
    message: "Type your database host",
    default: "localhost"
}, {
    type: "input",
    name: "database:name",
    message: "Type your database name",
    default: "sails-rest-api"
}, {
    type: "input",
    name: "database:user",
    message: "Type your database username",
    default: ""
}, {
    type: "password",
    name: "database:password",
    message: "Type your database password",
    default: ""
}, {
    type: "input",
    name: "application:name",
    message: "Type your application name",
    default: "sails-rest-api"
}, {
    type: "input",
    name: "application:api-secret-key",
    message: "Type your private API key",
    default: crypto.randomBytes(32).toString("hex")
}, {
    type: "input",
    name: "application:jwt-secret",
    message: "Type your private key for JSON Web Token",
    default: crypto.randomBytes(32).toString("hex")
}, {
    type: "input",
    name: "application:facebook-app-id",
    message: "Type your Facebook App ID",
    default: "-"
}, {
    type: "input",
    name: "application:facebook-app-secret",
    message: "Type your Facebook App Secret",
    default: "-"
}, {
    type: "input",
    name: "application:twitter-consumer-key",
    message: "Type your Twitter Consumer Key",
    default: "-"
}, {
    type: "input",
    name: "application:twitter-consumer-secret",
    message: "Type your Twitter Consumer Secret",
    default: "-"
}, {
    type: "checkbox",
    name: "services:cipher",
    message: "Choose which Cipher services you want",
    choices: [{
        name: "bcrypt",
        checked: true
    }, {
        name: "jwt",
        checked: true
    }, new inquirer.Separator(), {
        name: "More Cipher is coming",
        disabled: "Wait for it..."
    }]
}, {
    type: "checkbox",
    name: "services:mailer",
    message: "Choose which Mailer services you want",
    choices: [{
        name: "Mandrill",
        checked: false
    }, new inquirer.Separator(), {
        name: "More Mailer is coming",
        disabled: "Wait for it..."
    }]
}, {
    type: "checkbox",
    name: "services:payment",
    message: "Choose which Payment services you want",
    choices: [{
        name: "Stripe",
        checked: false
    }, new inquirer.Separator(), {
        name: "More Payment is coming",
        disabled: "Wait for it..."
    }]
}, {
    type: "checkbox",
    name: "services:pusher",
    message: "Choose which Pusher services you want",
    choices: [{
        name: "Apple Push Notification",
        checked: false
    }, {
        name: "Google Cloud Messaging",
        checked: false
    }, new inquirer.Separator(), {
        name: "More Pusher is coming",
        disabled: "Wait for it..."
    }]
}, {
    type: "checkbox",
    name: "services:sms",
    message: "Choose which SMS services you want",
    choices: [{
        name: "Twilio",
        checked: false
    }, new inquirer.Separator(), {
        name: "More SMS is coming",
        disabled: "Wait for it..."
    }]
}, {
    type: "checkbox",
    name: "services:social",
    message: "Choose which Social services you want",
    choices: [{
        name: "Facebook",
        checked: false
    }, new inquirer.Separator(), {
        name: "More Social is coming",
        disabled: "Wait for it..."
    }]
}, {
    type: "checkbox",
    name: "services:storage",
    message: "Choose which Storage services you want",
    choices: [{
        name: "Amazon S3",
        checked: false
    }, {
        name: "Google Cloud Storage",
        checked: false
    }, new inquirer.Separator(), {
        name: "More Storage is coming",
        disabled: "Wait for it..."
    }]
}, {
    type: "confirm",
    name: "docs:include",
    message: "Is Swagger documentation needed for project?",
    default: true
}, {
    type: "confirm",
    name: "tests:include",
    message: "Is Mocha tests needed for project?",
    default: true
}, {
    type: "confirm",
    name: "tools:include",
    message: "Is diagnostic tools needed for project?",
    default: true
}];

module.exports = yeoman.generators.Base.extend({
    /**
     * Special methods may do things like set up important state controls and may not function outside of the constructor
     * @type {Function}
     */
    constructor: function () {
        yeoman.generators.Base.apply(this, arguments);

        this.option("skip-generator-update", {
            desc: "Skip checking for generator updates on running",
            type: Boolean,
            defaults: false,
            hide: false
        });

        this.option("skip-generator-welcome", {
            desc: "Skip saying welcome when generator is running",
            type: Boolean,
            defaults: false,
            hide: false
        });

        this.option("skip-project-install", {
            desc: "Skip installing npm dependencies in project",
            type: Boolean,
            defaults: false,
            hide: false
        });

        this.option("skip-project-diagnostic", {
            desc: "Skip running diagnostic tools in project",
            type: Boolean,
            defaults: false,
            hide: false
        });

        this.option("skip-all", {
            desc: "Skip everything, just project scaffolding",
            type: Boolean,
            defaults: false,
            hide: false
        });

        this.config.save();
    },

    /**
     * Step 1
     * Your initialization methods (checking current project state, getting configs, etc)
     * @type {Object}
     */
    initializing: {
        loadPackageInfo: function () {
            this.pkg = require('../package.json');
        },

        notifyAboutGeneratorUpdate: function () {
            if (!(this.options['skip-generator-update'] || this.options['skip-all'])) {
                var done = this.async();

                this.log(chalk.yellow("Checking for updates..."));

                updateNotifier({
                    pkg: this.pkg,
                    callback: function (error, update) {
                        if (update && update.type && update.type !== 'latest') {
                            printMessage([
                                "Update available: " + chalk.green.bold(update.latest) + chalk.dim(" (current: " + update.current + ")"),
                                "Run " + chalk.blue("npm update -g " + update.name) + " to update."
                            ], {
                                marginTop: 0,
                                marginBottom: 0,
                                printFn: this.log
                            });

                            process.exit(0);
                        } else {
                            this.log(chalk.yellow("OK... You're using the latest version " + chalk.green.bold(update.current)));
                            done();
                        }
                    }.bind(this)
                });
            }
        },

        sayHello: function () {
            if (!(this.options["skip-generator-welcome"] || this.options["skip-all"])) {
                this.log(yosay('Welcome to the laudable ' + chalk.red('Sails REST API') + ' generator!'));
            }
        }
    },

    /**
     * Step 2
     * Where you prompt users for options (where you'd call this.prompt())
     */
    prompting: {
        askBaseQuestions: function () {
            var done = this.async();

            this.prompt(QUESTIONS_LIST, function (answers) {
                this.answers = answers;
                done();
            }.bind(this));
        }
    },

    /**
     * Step 3
     * Saving configurations and configure the project (creating .editorconfig files and other metadata files)
     */
    configuring: {},

    /**
     * Step 4
     * Default priority
     */

    /**
     * Step 5
     * Where you write the generator specific files (routes, controllers, etc)
     */
    writing: {
        copyDirectory: function () {
            this.directory(
                this.sourceRoot(),
                this.destinationRoot()
            );
        }
    },

    /**
     * Step 6
     * Where conflicts are handled (used internally)
     */
    conflicts: {},

    /**
     * Step 7
     * Where installation are run (npm, bower)
     */
    install: {
        installNpmDeps: function () {
            if (!(this.options['skip-project-install'] || this.options["skip-all"])) {
                this.log(chalk.yellow("\nStart installing npm dependencies, please wait...\n"));
                this.npmInstall();
            }
        }
    },

    /**
     * Step 8
     * Called last, cleanup, say good bye, etc
     */
    end: {
        runDiagnostic: function () {
            if (!(this.options["skip-project-diagnostic"] || this.options["skip-all"])) {
                var done = this.async();

                this.log(chalk.yellow("\nStarting diagnostic, please wait...\n"));

                this.spawnCommand('node', ['tools/fix-deps.js']).on('close', function () {
                    this.spawnCommand('node', ['tools/update-deps.js']).on('close', done);
                }.bind(this));
            }
        },

        sayUnderDevelopmentWarning: function () {
            printMessage([
                "This generator under heavy development",
                "If you found any bugs or have proposals, feel free to create issue",
                chalk.red(this.pkg.bugs.url),
                "Or you can write me the letter",
                chalk.red(this.pkg.bugs.email)
            ], {
                marginTop: 0,
                marginBottom: 0,
                printFn: this.log
            });
        },

        sayNotInstalledNpmDepsWarning: function () {
            if (this.options['skip-project-install'] || this.options["skip-all"]) {
                printMessage([
                    "You have skipped installing npm modules",
                    "Install them manually via " + chalk.blue("npm install")
                ], {
                    marginTop: 0,
                    marginBottom: 0,
                    printFn: this.log
                });
            }
        }
    }
});
