var gulp         = require("gulp");
var sass         = require("gulp-sass");
var sourcemaps   = require("gulp-sourcemaps");
var browserSync  = require("browser-sync").create();
var autoprefixer = require('gulp-autoprefixer');
var webpack      = require('webpack');
var modernizr    = require('gulp-modernizr');
var imagemin     = require('gulp-imagemin');
var del          = require('del');
var usemin       = require('gulp-usemin');
var rev          = require('gulp-rev');
var cssnano      = require('gulp-cssnano');
var uglify       = require('gulp-uglify');
var svgSprite    = require('gulp-svg-sprite');
var rename       = require('gulp-rename');
var svg2png      = require('gulp-svg2png');


//Watch Tasks - gulp
gulp.task('serve', ['sass'], function() {

    browserSync.init({
        server: "./app",
        online: false,
        notify: false
    });

    gulp.watch("./app/assets/sass/**/*.scss", ['sass']);
    gulp.watch("./app/*.html").on('change', browserSync.reload);
    gulp.watch('./app/assets/js/**/*.js', function(){
        gulp.start('scriptsRefresh');
    });
});

//CSS Tasks
gulp.task('sass', function () {

    return gulp.src("./app/assets/sass/**/*.scss")
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./app/assets/styles'))
        .pipe(browserSync.stream({match: '**/*.css'}));
});



//Javascript Tasks
gulp.task('modernizr', function(){
    return gulp.src(['./app/assets/styles/**/*.css', './app/assets/js/**/*.js'])
    .pipe(modernizr({
        "options": [
            "setClasses"
        ]
    }))
    .pipe(gulp.dest('./app/assets/scripts'));
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

gulp.task('scriptsRefresh', ['scripts'], function(){
    browserSync.reload();
});

//Default Tasks
gulp.task('default', ['serve']);


//Build Tasks - gulp build
gulp.task('previewDist', function(){
    browserSync.init({
        server:{
            baseDir: "docs"
        }
    });
});

gulp.task('optimizeImages', ['deleteDistFolder'], function(){
    gulp.src(['./app/assets/images/**/*', '!./app/assets/images/icons', '!./app/assets/images/icons/**/*'])
    .pipe(imagemin({
        progressive: true,
        interlaced: true,
        multipass: true
    }))
    .pipe(gulp.dest('./docs/assets/images'));
});

gulp.task('useminTrigger', ['deleteDistFolder'], function(){
    gulp.start('usemin');
});

gulp.task('usemin', ['styles', 'scripts'], function(){
    return gulp.src('./app/index.html')
    .pipe(usemin({
        css: [function(){ return rev()}, function(){ return cssnano()}],
        js: [function(){ return rev()},function(){ return uglify()}]
    }))
    .pipe(gulp.dest('./docs'));
});

gulp.task('deleteDistFolder',['icons'], function(){
    return del('./docs');
});

gulp.task('build', ['deleteDistFolder','optimizeImages', 'useminTrigger']);


//Sprites Tasks - gulp icons
var config = {
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
                    template: './app/templates/sprite.css'
                }
            }
        }
    }
}

gulp.task('beginClean', function(){
    return del(['./app/temp', './app/assets/images/sprites'])
});

gulp.task('createSprite', ['beginClean'], function(){
    return gulp.src('./app/assets/images/icons/**/*.svg')
    .pipe(svgSprite(config))
    .pipe(gulp.dest('./app/temp/sprite/'));
});

gulp.task('createPngCopy', ['createSprite'], function(){
    return gulp.src('./app/temp/sprite/css/*.svg')
    .pipe(svg2png())
    .pipe(gulp.dest('./app/temp/sprite/css'));
});

gulp.task('copySpriteGraphic', ['createPngCopy'], function(){
    return gulp.src('./app/temp/sprite/css/**/*.{svg,png}')
    .pipe(gulp.dest('./app/assets/images/sprites'));
});

gulp.task('copySpriteCSS', ['createSprite'], function(){
    return gulp.src('./app/temp/sprite/css/*.css')
    .pipe(rename('_sprite.css'))
    .pipe(gulp.dest('./app/assets/sass/modules'));
});

gulp.task('endClean', ['copySpriteGraphic', 'copySpriteCSS'], function(){
    return del('./app/temp')
});

gulp.task('icons', ['beginClean', 'createSprite', 'createPngCopy', 'copySpriteGraphic', 'copySpriteCSS', 'endClean']);
