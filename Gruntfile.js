module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            vendor: {
                src: [
                    'vendor/angular/angular-1.7.4.js',
                    'vendor/angular/angular-route.js',
                    'vendor/angular/angular-sanitize.js',
                    'vendor/angular/angular-cookies.js',
                    'vendor/angular/angular-ui-router.js'
                ],
                dest: 'build/vendor.js'
            },
            app: {
                src: [
                    'js/app.js',
                    'js/config.js',
                    'js/controllers/*.js',
                    'js/directives/*.js',
                    'js/filters/*.js',
                    'js/services/*.js'
                ],
                dest: 'build/app.js'
            }
        },
        uglify: {
            vendor: {
                options: {
                    preserveComments: false,
                    mangle: false
                },
                files: {
                    'build/vendor.min.js': 'build/vendor.js'
                }
            },
            app: {
                options: {
                    preserveComments: false,
                    mangle: false
                },
                files: {
                    'build/app.min.js': 'build/app.js'
                }
            }
        },
        cssmin: {
            options: {
                keepSpecialComments: 0
            },
            vendor: {
                files: {
                    'build/vendor.min.css': [
                        'vendor/bootstrap/bootstrap-4.0.0.css',
                        'vendor/font-awesome/font-awesome.min.css',
                        'vendor/theme/sb-admin.css'
                    ]
                }
            },
            app: {
                files: {
                    'build/app.min.css': 'css/*.css'
                }
            }
        },
        watch: {
            appJs: {
                files: [
                    'js/**'
                ],
                tasks: ['appJs'],
                options: {
                    debounceDelay: 250,
                    event: ['changed', 'added', 'deleted']
                }
            },
            appCss: {
                files: [
                    'css/**'
                ],
                tasks: ['appCss'],
                options: {
                    debounceDelay: 250,
                    event: ['changed', 'added', 'deleted']
                }
            },
            vendor: {
                files: [
                    'vendor/**'
                ],
                tasks: ['vendor'],
                options: {
                    debounceDelay: 250,
                    event: ['changed', 'added', 'deleted']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-simple-watch');

    grunt.registerTask('appJs', ['concat:app', 'uglify:app']);
    grunt.registerTask('appCss', ['cssmin:app']);
    grunt.registerTask('app', ['appJs', 'appCss']);

    grunt.registerTask('vendor', ['concat:vendor', 'uglify:vendor', 'cssmin:vendor']);

    grunt.registerTask('default', ['vendor', 'app']);
};
