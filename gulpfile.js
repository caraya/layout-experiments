/* eslint-disable require-jsdoc */
/* eslint-disable valid-jsdoc */

'use strict';
// Require Gulp first
const gulp = require('gulp');
//  packageJson = require('./package.json'),
// Load plugins
const $ = require('gulp-load-plugins')({
  lazy: true,
});
// Static Web Server stuff
const browserSync = require('browser-sync');
// const bsReload = .reload();
// postcss
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
// SASS
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
// Critical CSS
const critical = require('critical');
// Utilities
const del = require('del');

/**
 * @name sass
 * @description SASS conversion task to produce development css with
 * expanded syntax.
 *
 * We run this task agains Ruby SASS, not lib SASS. As such it requires
 * the SASS Gem to be installed
 *
 * @see {@link http://sass-lang.com|SASS}
 * @see {@link http://sass-compatibility.github.io/|SASS Feature Compatibility}
 */
gulp.task('sass', () => {
  return gulp.src('sass/**/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass({
    outputStyle: 'expanded',
  })
  .on('error', sass.logError))
  .pipe(gulp.dest('./css'));
});

/**
 * @name processCSS
 *
 * @description Run autoprefixer and cleanCSS on the CSS files under src/css
 *
 * Moved from gulp-autoprefixer to postcss. It may open other options in
 * the future like cssnano to compress the files
 *
 * @see {@link https://github.com/postcss/autoprefixer|autoprefixer}
 */
gulp.task('processCSS', () => {
  // What processors/plugins to use with PostCSS
  const PROCESSORS = [autoprefixer()];
  return gulp.src('css/**/*.css')
    .pipe($.sourcemaps.init())
    .pipe(postcss(PROCESSORS))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('css'))
    .pipe($.size({
      pretty: true,
      title: 'processCSS',
    }));
});

/**
 * @name critical
 * @description Runs critical to create critical path CSS
 */
gulp.task('critical', (cb) => {
  critical.generate({
    base: 'docs/',
    html: '**/*.html',
    inline: true,
    minify: true,
    extract: false,
    css: ['css/**/*.css'],
    ignore: ['font-face'],
    dimensions: [{
      width: 320,
      height: 480,
    }, {
      width: 768,
      height: 1024,
    }, {
      width: 1280,
      height: 960,
    }],
  });
  cb();
});

/**
 * @name babel
 * @description Transpiles ES6 to ES5 using Babel. As Node and browsers
 * support more of the spec natively this will move to supporting
 * ES2016 and later transpilation
 *
 * It requires the `babel` and the `babel-env` plugin
 *
 * @see {@link http://babeljs.io/|Babel}
 * @see {@link http://babeljs.io/docs/learn-es2015/|Learn ES2015}
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/|ECMAScript 2015 specification}
 */
gulp.task('babel', () => {
  return gulp.src('src/js/**/*.js')
    .pipe(babel({
      presets: ['@babel/preset-env'],
    }))
    .pipe(gulp.dest('dist'));
});

/**
 * @name eslint
 * @description Runs eslint on all javascript files
 */
gulp.task('eslint', () => {
  return gulp.src([
      'gulp.src/js/**/*.js',
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

/**
 * @name imagemin
 * @description Reduces image file sizes. Doubly important if
 * we'll choose to play with responsive images.
 *
 * Imagemin will compress jpg (using mozilla's mozjpeg),
 * SVG (using SVGO) GIF and PNG images but WILL NOT create multiple
 * versions for use with responsive images
 *
 * @see {@link https://github.com/postcss/autoprefixer|Autoprefixer}
 * @see {@link processImages}
 */
gulp.task('imagemin', () => {
  return gulp.src('images/**/*.{jpg,png,gif.svg}')
    .pipe($.imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: false},
          {cleanupIDs: false},
        ],
      }),
      imageminMozjpeg({quality: 85}),
      imageminWebp({quality: 85}),
    ]))
    .pipe(gulp.dest('images'))
    .pipe($.size({
      pretty: true,
      title: 'imagemin',
    }));
});

// Guetzli is an experimental jpeg encoder from Google.
// I'm running it as a separate task to test whether it
// works better than mozjpeg and under what circumstances
gulp.task('guetzli', () => {
  return gulp.src('gulp.src/images/originals/**/*.jpg')
  .pipe(imagemin([
    imageminGuetzli({
        quality: 85,
    }),
  ]))
  .pipe(gulp.dest('dist'));
});

/**
 * @name clean
 * @description deletes specified files
 */
gulp.task('clean', (cb) => {
  return del([
    'docs',
  ]);
  cb();
});

// BrowserSync
gulp.task('serve', () => {
  browserSync.init({
    server: {
      baseDir: './docs',
    },
    port: 3000,
  });

  // gulp.watch('js/**/*.js', gulp.series('babel'));
  // gulp.watch('sass/**/*.scss', gulp.series('css'));
  // gulp.watch('*.html'), gulp.series('copyHtml');
});

gulp.task('copyFonts', () => {
  return gulp.src([
      'fonts/*.woff2',
    ], {
      base: './',
      allowEmpty: true,
    })
    .pipe(gulp.dest('./docs/fonts'));
});

gulp.task('copyAssets', () => {
  return gulp.src([
      '*.html',
      'sw.js',
      'css/**/*.{map,css}',
      'js/**/*.js',
      '!js/sw.js',
      'favicon.ico',
      'images/**/*.{png,jpg,jpeg,webp,gif.svg}',
      'manifest.json',
      'pages/*.html',
      '!scratch-sources/',
      '!sass/**/*',
      '!node_modules/**/*',
      '!workbox-config.js',
    ], {
      base: './',
    })
    .pipe(gulp.dest('./docs'));
});

gulp.task('copyHtml', () => {
  return gulp.src([
      '*.html',
      'pages/*.html',
    ], {
      base: './',
    })
    .pipe(gulp.dest('./docs'));
});


gulp.task('css',
  gulp.series(
    'sass',
    'processCSS',
  ),
);

gulp.task('copyAll',
  gulp.parallel(
    'copyFonts',
    'copyAssets',
    'copyHtml',
  ),
);

gulp.task('default',
    gulp.series(
      'sass',
      'processCSS',
      'copyAll',
    ),
);
