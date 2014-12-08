"use strict";
var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var jasmine = require("gulp-jasmine");

// coverage task
gulp.task('coverage', function (cb) {
    gulp.src(['./framework/**/*.js'])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on('finish', cb);
});

// test with coverage
gulp.task('test-with-coverage', ['coverage'], function (cb) {
    gulp.src(['./tests/**/*.js'])
        .pipe(jasmine())
        .pipe(istanbul.writeReports())
        .on('end', cb);
});

// test task
gulp.task('test', function (cb) {
    gulp.src(['./tests/**/*.js'])
        .pipe(jasmine())
        .on('end', cb);
});





