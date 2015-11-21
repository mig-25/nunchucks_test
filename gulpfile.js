// Requiring Gulp
var gulp = require('gulp');
// Requires the gulp-sass plugin
var sass = require('gulp-sass');
// Requiring autoprefixer
var autoprefixer = require('gulp-autoprefixer');
// Requiring Sourcemaps
var sourcemaps = require('gulp-sourcemaps');
//Auto refresh browser on file save
var browserSync = require('browser-sync');
// Require merge-stream to output multilple tasks to multiple destinations
var merge = require('merge-stream');
//Require Nunjucks Template Engine
var nunjucksRender = require('gulp-nunjucks-render');
// Plumber, Error handling
var plumber = require('gulp-plumber');
// Other requires
var notify = require('gulp-notify');
//Read Data
var data = require('gulp-data');
//read JSON data
var fs = require('fs');

// Start browserSync server
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    }
  });
});


function customPlumber(errTitle) {
  return plumber({
    errorHandler: notify.onError({
      // Customizing error title
      title: errTitle || "Error running Gulp",
      message: "Error: <%= error.message %>",
    })
  });
}

gulp.task('nunjucks', function() {
  nunjucksRender.nunjucks.configure(['app/templates/'], {watch: false});
  return gulp.src('app/pages/**/*.+(html|nunjucks)')
    .pipe(customPlumber('Error Running Nunjucks'))
    .pipe(data(function() {
      return JSON.parse(fs.readFileSync('./app/data.json'))
    }))
    .pipe(nunjucksRender())
    .pipe(gulp.dest('app'))
    .pipe(browserSync.reload({
      stream: true
    }))
});


gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.+(scss|sass)') // Gets all files ending with .scss or .sass in app/scss
    .pipe(sourcemaps.init()) // Initialize sourcemap plugin
// Replacing plumber with customPlumber
    .pipe(customPlumber('Error Running Sass'))
    .pipe(sass()) // Initialize sass
    .pipe(autoprefixer()) // Passes it through gulp-autoprefixer 
    .pipe(sourcemaps.write()) // Writing sourcemaps
    .pipe(gulp.dest('app/css'))
    // Reloading the stream
    .pipe(browserSync.reload({
      stream: true
    }));
});


gulp.task('watch', ['browserSync', 'nunjucks', 'sass'], function() {
gulp.watch([
    'app/templates/**/*',
    'app/pages/**/*.+(html|nunjucks)',
    'app/data.json',
    ], ['nunjucks'] // runs Nunjucks task
  );
gulp.watch('app/scss/**/*.+(scss|sass)', ['sass']);
gulp.watch('app/index.html', browserSync.reload);
});


gulp.task('prod', function(){
 var html=gulp.src('app/*.html')
.pipe(gulp.dest('dist'))
 
 var css=gulp.src('app/css/*.css')
.pipe(gulp.dest('dist/css'))
 
 var img=gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
.pipe(gulp.dest('dist/images'))
 
 var js=gulp.src('app/js/*.js')
.pipe(gulp.dest('dist/js'))
 
 return merge(html, css, img, js);
});

// Creating a default task
gulp.task('default', ['sass', 'watch', 'prod']);
