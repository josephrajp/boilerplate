module.exports = {
    sass:  "./app/assets/sass/**/*.scss", //Sass to compile to css
    sassMod: './app/assets/sass/modules', //sprite css to copy
    html: "./app/**/*.html", //HTML to watch
    srcJS: './app/assets/js/**/*.js', //JS to compile
    srcCSS: './app/assets/styles/**/*.css', //CSS to watch
    css: './app/assets/styles', //CSS folder to generated css files into it
    scripts : './app/assets/scripts',  // JS folder to generated js files into it
    autoprefixer: ['last 2 versions'], // Autoprefixer settings
    buildFolder: "docs", // Final folder to copy build files
    srcImages: ['./app/assets/images/**/*', '!./app/assets/images/icons', '!./app/assets/images/icons/**/*'], // Images to process for minify
    buildImages: './docs/assets/images', //Images folder to copy minified images
    spriteTmplCSS: './app/templates/sprite.css', // Template files for generate sprite css
    sprites: './app/assets/images/sprites', // Sprites to copy into it
    svg: './app/assets/images/icons/**/*.svg', // SVGs to generate sprites
};