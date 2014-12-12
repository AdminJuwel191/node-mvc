"use strict";
var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var jasmine = require("gulp-jasmine");

// coverage task
gulp.task('coverage', function (cb) {
    gulp.src(['./framework/**/*.js'])
        .pipe(istanbul({ includeUntested: true }))
        .pipe(istanbul.hookRequire())
        .on('finish', cb);
});

// test with coverage
gulp.task('test-with-coverage', ['coverage'], function (cb) {
    gulp.src(['./tests/**/*-spec.js'])
        .pipe(jasmine({
            verbose: true,
            includeStackTrace: true
        }))
        .pipe(istanbul.writeReports({
            reporters: [ 'json', 'clover', 'html' ]
        }))
        .on('end', cb);
});

// test task
gulp.task('test', function (cb) {
    gulp.src(['./tests/**/*-spec.js'])
        .pipe(jasmine({
            verbose: true,
            includeStackTrace: true
        }))
        .on('end', cb);
});





