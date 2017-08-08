'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');

const dirs = {
  src: 'src',
  dest: 'build'
};

gulp.task('clean', cb => {
	rimraf(dirs.dest + '/**/*.*', cb);
});

gulp.task('build', () => {
    return gulp.src(dirs.src + '/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest(dirs.dest));
});