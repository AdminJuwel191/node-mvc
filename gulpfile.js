"use strict";
var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var jasmine = require("gulp-jasmine");
var exit = require('gulp-exit');

// coverage task
gulp.task('coverage', function (cb) {
    gulp.src(['./framework/**/*.js'])
        .pipe(istanbul({ includeUntested: true }))
        .pipe(istanbul.hookRequire())
        .on('finish', cb);
});

// test with coverage
gulp.task('test-with-coverage', ['coverage'], function () {
    gulp.src(['./tests/**/*-spec.js'])
        .pipe(jasmine({
            verbose: true,
            timeout: 5000,
            includeStackTrace: true
        }))
        .pipe(istanbul.writeReports({
            reporters: [ 'json', 'clover', 'html' ]
        }))
        .pipe(exit());
});

// test task
gulp.task('test', function () {
    gulp.src(['./tests/**/*-spec.js'])
        .pipe(jasmine({
            verbose: true,
            timeout: 5000,
            includeStackTrace: true
        }))
        .pipe(exit());
});





