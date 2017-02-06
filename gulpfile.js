var gulp = require('gulp');
var watch = require('gulp-watch');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var combineMq = require('gulp-combine-mq');
var autoprefixer = require('gulp-autoprefixer');
var uncss = require('gulp-uncss');
var browserSync = require('browser-sync').create();
var svgSprite = require('gulp-svg-sprite');
var rename = require('gulp-rename');
var del = require('del');
var svg2png = require('gulp-svg2png');
var webpack = require('webpack');
var modernizr = require('gulp-modernizr');
var imagemin = require('gulp-imagemin');
var usemin = require('gulp-usemin');
var rev = require('gulp-rev');
var cssnano = require('gulp-cssnano');
var uglify = require('gulp-uglify');

//===Files Path===//
var projBaseDir = 'app';
var inputSASS = './'+projBaseDir+'/assets/styles/**/*.scss';
var outputCSS = './'+projBaseDir+'/temp/styles';
var inputHTML = './'+projBaseDir+'/**/*.html';
var inputJS = './'+projBaseDir+'/assets/scripts/**/*.js';
var outputJS = './'+projBaseDir+'/temp/scripts';
var inputImages = ['./'+projBaseDir+'/assets/images/**/*', '!./'+projBaseDir+'/assets/images/icons', '!./'+projBaseDir+'/assets/icons/**/*'];
var prodDirName = 'docs';
//Files Path Spirte
var sassModules = './'+projBaseDir+'/assets/styles/modules';
var svgs = './'+projBaseDir+'/assets/images/icons/**/*.svg';
var tempSvgs = './'+projBaseDir+'/temp/sprite/css/*.svg';
var tempSpriteCSS = './'+projBaseDir+'/temp/sprite/css/*.css';
var tempSprite = './'+projBaseDir+'/temp/sprite';
var svgPNGFilestocopy = './'+projBaseDir+'/temp/sprite/css/**/*.{svg,png}';
var spriteImages = './'+projBaseDir+'/assets/images/sprites';

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
    .pipe(uncss({
      html: [inputHTML]
    }))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest(outputCSS))
    .pipe(browserSync.stream());
});

gulp.task('modernizr', function () {
  return gulp.src([outputCSS + '/**/*.css', inputJS])
    .pipe(modernizr({
      "options": [
        "setClasses"
      ]
    }))
    .pipe(gulp.dest(outputJS));
});

gulp.task('scripts', ['modernizr'], function (callback) {
  webpack(require('./webpack.config.js'), function (err, stats) {
    if (err) {
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
      baseDir: projBaseDir
    }
  });

  watch(inputHTML, function () {
    browserSync.reload();
  });

  watch(inputSASS, function () {
    gulp.start('styles');
  });

  watch(inputJS, function () {
    gulp.start('scriptsRefresh');
  });

});



//Task For create Sprite
gulp.task('beginClean', function () {
  return del([tempSprite, spriteImages])
});


gulp.task('createSprite', ['beginClean'], function () {
  return gulp.src(svgs)
    .pipe(svgSprite(spriteConfig))
    .pipe(gulp.dest(tempSprite));
});

gulp.task('createPngCopy', ['createSprite'], function () {
  return gulp.src(tempSvgs)
    .pipe(svg2png())
    .pipe(gulp.dest(tempSprite + '/css'));
});

gulp.task('copySpriteGraphic', ['createPngCopy'], function () {
  return gulp.src(svgPNGFilestocopy)
    .pipe(gulp.dest(spriteImages));
});

gulp.task('copySpriteCSS', ['createSprite'], function () {
  return gulp.src(tempSpriteCSS)
    .pipe(rename('_sprite.scss'))
    .pipe(gulp.dest(sassModules));
});

gulp.task('endClean', ['copySpriteGraphic', 'copySpriteCSS'], function () {
  return del('./'+projBaseDir+'/temp/sprite')
});

gulp.task('icons', ['beginClean', 'createSprite', 'createPngCopy', 'copySpriteGraphic', 'copySpriteCSS', 'endClean']);

//Task For BUILD

gulp.task('previewDist', function () {
  browserSync.init({
    server: {
      baseDir: prodDirName
    }
  });
});

gulp.task('optimizeImages', ['deleteDistFolder'], function () {
  gulp.src(inputImages)
    .pipe(imagemin({
      progressive: true,
      interlaced: true,
      multipass: true
    }))
    .pipe(gulp.dest('./'+ prodDirName +'/assets/images'));
});

gulp.task('useminTrigger', ['deleteDistFolder'], function () {
  gulp.start('usemin');
});

gulp.task('usemin', ['styles', 'scripts'], function () {
  return gulp.src(inputHTML) //'./app/index.html'
    .pipe(usemin({
      css: [function () {
        return rev()
      }, function () {
        return cssnano()
      }],
      js: [function () {
        return rev()
      }, function () {
        return uglify()
      }]
    }))
    .pipe(gulp.dest('./'+ prodDirName));
});


gulp.task('deleteDistFolder', ['icons'], function () {
  return del('./'+ prodDirName);
});

gulp.task('build', ['deleteDistFolder', 'optimizeImages', 'useminTrigger']);