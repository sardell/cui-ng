module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.initConfig ({
    watch:{
      css:{
        files: 'assets/scss/**/*',
        tasks: ['sass']
      },
      scripts:{
        files: ['directives/**/*.js','utilities/**/*.js'],
        tasks: ['concat'],
        options: {
          spawn: false,
        },
      }
    },
    sass:{
      dist:{
        files:{
          'assets/css/main.css': 'assets/scss/main.scss'
        }
      }
    },
    browserSync: {
      dev: {
        bsFiles: {
            src : [
                '**/*.html',
                '**/*.js',
                '**/*.css'
            ]
        },
        options: {
          ghostMode: false,
          watchTask: true,
          online: true,
          port: 9001,
          server:{
            baseDir: './'
          }
        }
      },
      demo: {
        bsFiles: {
            src : [
                '**/*.html',
                '**/*.js',
                '**/*.css'
            ]
        },
        options: {
          ghostMode: false,
          watchTask: false,
          online: true,
          server:{
            baseDir: 'build/'
          }
        }
      }
    },
    useminPrepare: {
      html: './index.html',
      options: {
        src: './',
        dest: './build'
      }
    },
    usemin: {
      options: {
        assetsDirs: ['./build']
      },
      css: ['./build/assets/css/**.*.css'],
      js: ['./build/assets/js/**.*.js'],
      html: ['./build/index.html']
    },
    concat: {
      options: {
           separator: '\n\n',
      },
      dist: {
        src: ['modules/cui-ng.intro.js','directives/**/*.js','utilities/**/*.js','modules/cui-ng.outro.js'],
        dest: 'dist/cui-ng.js'
      }
    },
    filerev:{
      dist:{
        src:['build/assets/css/main.css','build/assets/js/vendor.js','build/assets/js/app.js']
      }
    },
    copy: {
      index: {
        src: 'index.html',
        dest: 'build/index.html'
      },
      angularTemplates: {
        src: 'assets/angular-templates/**/*.html',
        dest: 'build/'
      },
      languageFiles: {
        src: 'bower_components/cui-i18n/dist/cui-i18n/angular-translate/*.json',
        dest: 'build/'
      },
      localeFiles: {
        src: 'bower_components/angular-i18n/*.js',
        dest: 'build/'
      },
      svgList: {
        src: 'bower_components/cui-icons/iconList',
        dest: 'build/'
      },
      svgs: {
        src: ['bower_components/cui-icons/dist/**/*.svg'],
        dest: 'build/'
      },
      countries: {
        src: ['bower_components/cui-i18n/dist/cui-i18n/angular-translate/countries/*.json'],
        dest: 'build/'
      },
      lato:{
        src: ['bower_components/lato/font/lato-regular/*.*'],
        dest: 'build/'
      }
    },
    clean: {
      build: {
        src: ["build"]
      }
    },
    uglify: {
      options: {
        mangle: false
      }
    },
    jasmine: {
      cuiNg: {
        src: 'dist/cui-ng.js',
        options: {
          specs: 'tests/*.js',
          helpers: ['bower_components/jquery/dist/jquery.js','bower_components/angular/angular.js','node_modules/angular-mocks/angular-mocks.js']
        }
      }
    },
    jshint: {
      all: ['directives/**/*.js','utilities/**/*.js']
    }
  });

  grunt.registerTask('default', ['sass','concat','browserSync:dev','watch']);
  grunt.registerTask('build', ['sass','clean','copy','concat','useminPrepare','concat:generated','cssmin:generated','uglify:generated','filerev','usemin']);
  grunt.registerTask('demo', ['browserSync:demo']);
  grunt.registerTask('test', ['concat','jasmine']);
  grunt.registerTask('lint', ['jshint']);
}
