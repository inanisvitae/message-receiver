'use strict';

import gulp from 'gulp';
import babel from 'gulp-babel';
import eslint from 'gulp-eslint';
import rimraf from 'rimraf';
import gls from 'gulp-live-server';
import minify from 'gulp-minify';

const dirs = {
  src: 'src',
  dest: 'dist'
};

gulp.task('clean', cb => {
  rimraf(dirs.dest + '/**/*.*', cb);
});

gulp.task('build', () => {
  return gulp.src(dirs.src + '/**/*.js')
      .pipe(babel())
      .pipe(minify())
      .pipe(gulp.dest(dirs.dest));
});

gulp.task('lint', () => {
  return gulp.src(dirs.src + '/**/*.js')
      .pipe(eslint())
      .pipe(eslint.format());
});

gulp.task('rebuild', ['clean', 'build']);

gulp.task('watch', () => {
    let server = gls.new(dirs.dest);
    server.start();
    
    gulp.watch(dirs.src + '/**/*.js', ['build', server.start.bind(server)]);
});

gulp.task('default', ['clean', 'build', 'watch']);