var gulp = require('gulp');
var watch = require('gulp-watch');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var combineMq = require('gulp-combine-mq');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var svgSprite = require('gulp-svg-sprite');
var rename = require('gulp-rename');
var del = require('del');
var svg2png = require('gulp-svg2png');
var webpack = require('webpack');
var modernizr = require('gulp-modernizr');

//===Files Path===//
var inputSASS = './app/assets/styles/**/*.scss';
var outputCSS = './app/temp/styles';
var inputHTML = './app/**/*.html';
var inputJS = './app/assets/scripts/**/*.js';
var outputJS = './app/temp/scripts';
//Files Path Spirte
var sassModules = './app/assets/styles/modules';
var svgs = './app/assets/images/icons/**/*.svg';
var tempSvgs = './app/temp/sprite/css/*.svg';
var tempSpriteCSS = './app/temp/sprite/css/*.css';
var tempSprite = './app/temp/sprite';
var svgPNGFilestocopy = './app/temp/sprite/css/**/*.{svg,png}';
var spriteImages = './app/assets/images/sprites';

//===Settings===//
var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded',
  includePaths: require('node-bourbon').includePaths,
  includePaths: require('node-neat').includePaths
};
var autoprefixerOptions = {
  browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};


var spriteConfig = {
  shape: {
    spacing: {
      padding: 1
    }
  },
  mode: {
    css: {
      variables: {
        replaceSvgWithPng: function () {
          return function (sprite, render) {
            return render(sprite).split('.svg').join('.png');
          }
        }
      },
      sprite: 'sprite.svg',
      render: {
        css: {
          template: './templates/sprite.css'
        }
      }
    }
  }
}

//Tasks
gulp.task('default', function () {
  console.log('Default task');
});

gulp.task('html', function () {
  console.log('HTML task');
});

gulp.task('styles', function () {
  return gulp
    .src(inputSASS)
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(combineMq({
        beautify: true
    }))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest(outputCSS))
    .pipe(browserSync.stream());
});

gulp.task('modernizr', function(){
    return gulp.src([outputCSS+'/**/*.css', inputJS]) //'./app/assets/styles/**/*.css'
    .pipe(modernizr({
        "options": [
            "setClasses"
        ]
    }))
    .pipe(gulp.dest(outputJS));
});

gulp.task('scripts', ['modernizr'], function(callback){
    webpack(require('./webpack.config.js'), function(err, stats){
        if(err){
            console.log(err.toString());
        }
        console.log(stats.toString());
        callback();
    });
});

gulp.task('scriptsRefresh', ['scripts'], function () {
  browserSync.reload();
});

gulp.task('watch', function () {
  browserSync.init({
    notify: false,
    server: {
      baseDir: 'app'
    }
  });

  watch(inputHTML, function () {
    browserSync.reload();
  });

  watch(inputSASS, function () {
    gulp.start('styles');
  });

  watch(inputJS, function(){
        gulp.start('scriptsRefresh');
    });

});



//Task For create Sprite
gulp.task('beginClean', function(){
    return del([tempSprite, spriteImages])
});


gulp.task('createSprite', ['beginClean'], function(){
    return gulp.src(svgs)
    .pipe(svgSprite(spriteConfig))
    .pipe(gulp.dest(tempSprite));
});

gulp.task('createPngCopy', ['createSprite'], function(){
    return gulp.src(tempSvgs)
    .pipe(svg2png())
    .pipe(gulp.dest(tempSprite + '/css'));
});

gulp.task('copySpriteGraphic', ['createPngCopy'], function(){
    return gulp.src(svgPNGFilestocopy)
    .pipe(gulp.dest(spriteImages));
});

gulp.task('copySpriteCSS', ['createSprite'], function(){
    return gulp.src(tempSpriteCSS)
    .pipe(rename('_sprite.scss'))
    .pipe(gulp.dest(sassModules));
});

gulp.task('endClean', ['copySpriteGraphic', 'copySpriteCSS'], function(){
    return del('./app/temp/sprite')
});

gulp.task('icons', ['beginClean', 'createSprite', 'createPngCopy', 'copySpriteGraphic', 'copySpriteCSS', 'endClean']);