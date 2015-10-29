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
        src: 'bower_components/cui-icons/svgList',
        dest: 'build/'
      },
      svgs: {
        src: 'bower_components/cui-icons/dist/svg/svg-out.svg',
        dest: 'build/'
      },
      cuiI18n: {
        src: 'bower_components/cui-i18n/translate.js',
        dest: 'build/'
      }

    }


  });

 
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['browserSync:dev','watch']);
  grunt.registerTask('build', ['copy:index','copy:angularTemplates','copy:languageFiles','copy:localeFiles','copy:svgList','copy:svgs','copy:cuiI18n','concat','useminPrepare','concat:generated','cssmin:generated','uglify:generated','usemin']);
  grunt.registerTask('demo', ['browserSync:demo'])
}