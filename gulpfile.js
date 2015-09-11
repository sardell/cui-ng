var gulp = require('gulp'),
    sass = require('gulp-sass'),
    path = require('./gulp.config.json'),
    util = require('gulp-util'),
    log = util.log;

gulp.task('delete')

gulp.task('sass', function () {
  log('Compiling Sass into CSS ');

  gulp.src( path.scss + '*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest( path.css ));
});
 
gulp.task('sass:watch', function () {
  gulp.watch( path.scss + '**/*.scss', ['sass']);
});