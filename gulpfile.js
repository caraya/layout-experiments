/* jslint node: true */

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
// const reload = browserSync.reload;
const historyApiFallback = require('connect-history-api-fallback');
// postcss
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
// SASS
const sass = require('gulp-sass');
// Critical CSS
const critical = require('critical');
// Imagemin and Plugins
const imagemin = require('gulp-imagemin');
// const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminGuetzli = require('imagemin-guetzli');
const imageminWebp = require('imagemin-webp');
// Utilities
const runSequence = require('run-sequence');
const del = require('del');


// var key = '';
// const SITE = 'https://caraya.github.io/athena-template/';

// SCSS conversion and CSS processing
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
  return sass('sass/**/*.scss', {
      sourcemap: true,
      style: 'expanded',
    })
    .pipe(gulp.dest('css'))
    .pipe($.size({
      pretty: true,
      title: 'SASS',
    }));
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
  const PROCESSORS = [autoprefixer({
    browsers: [
      'ie >= 10',
      'ie_mob >= 10',
      'ff >= 30',
      'chrome >= 34',
      'safari >= 7',
      'opera >= 23',
      'ios >= 7',
      'android >= 4.4',
      'bb >= 10',
    ],
  })];
  return gulp
    .src('css/**/*.css')
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
 * @name uncss
 * @description Taking a css and an html file, UNCC will strip all CSS
 * selectors not used in the page
 *
 * @see {@link https://github.com/giakki/uncss|uncss}
 */
gulp.task('uncss', () => {
  return gulp.src('src/css/**/*.css')
    .pipe($.concat('main.css'))
    .pipe($.uncss({
      html: ['index.html'],
    }))
    .pipe(gulp.dest('css/main.css'))
    .pipe($.size({
      pretty: true,
      title: 'Uncss',
    }));
});

// Generate & Inline Critical-path CSS
gulp.task('critical', () => {
  return gulp.src('src/*.html')
    .pipe(critical({
      base: 'src/',
      inline: true,
      css: ['src/css/main.css'],
      minify: true,
      extract: false,
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
    }))
    .pipe($.size({
      pretty: true,
      title: 'Critical',
    }))
    .pipe(gulp.dest('docs'));
});

/**
 * @name babel
 * @description Transpiles ES6 to ES5 using Babel. As Node and browsers
 * support more of the spec natively this will move to supporting
 * ES2016 and later transpilation
 *
 * It requires the `babel`, `babel-preset-es2015`, `babel-preset-es2016`
 * and `babel-preset-es2017` plugins
 *
 * @see {@link http://babeljs.io/|Babel}
 * @see {@link http://babeljs.io/docs/learn-es2015/|Learn ES2015}
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/|ECMAScript 2015 specification}
 */
gulp.task('babel', () => {
  return gulp.src('src/es6/**/*.js')
  .pipe($.sourcemaps.init())
  .pipe($.babel({
    presets: ['@babel/env'],
  }))
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest('src/js/'))
  .pipe($.size({
    pretty: true,
    title: 'Babel',
  }));
});

/**
 * @name eslint
 * @description Runs eslint on all javascript files
 */
gulp.task('eslint', () => {
  return gulp.src([
      'scr/scripts/**/*.js',
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

/**
 * @name jsdoc
 * @description runs jsdoc on the gulpfile and README.md to
 * genereate documentation
 *
 * @see {@link https://github.com/jsdoc3/jsdoc|JSDOC}
 */
gulp.task('jsdoc', () => {
  return gulp.src(['README.md', 'gulpfile.js'])
    .pipe($.jsdoc3());
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
  return gulp.src('images/originals/**/*.{jpg,png,gif.svg}')
    .pipe($.imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {removeViewBox: false},
          {cleanupIDs: false},
        ],
      }),
      // imageminMozjpeg({quality: 75}),
      imageminGuetzli({quality: 85}),
      imageminWebp({quality: 75}),
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
// gulp.task('guetzli', () =>
//   gulp.src('src/images/originals/**/*.jpg')
//   .pipe(imagemin([
//       imageminGuetzli({
//           quality: 85,
//       }),
//   ]))
//   .pipe(gulp.dest('dist'))

// );

/**
 * @name processImages
 * @description processImages creates a set of responsive images
 * for each of the PNG and JPG images in the images directory
 *
 * @see {@link http://sharp.dimens.io/en/stable/install/|Sharp}
 * @see {@link https://github.com/jcupitt/libvips|LibVIPS dependency for Mac}
 * @see {@link https://www.npmjs.com/package/gulp-responsive|gulp-responsive}
 * @see {@link imagemin}
 *
 */
gulp.task('processImages', () => {
  return gulp.src(['images/**/*.{jpg,png}', 'images/icons/*.png'])
    .pipe($.responsive({
        '*': [{
          // image-small.jpg is 200 pixels wide
          width: 200,
          rename: {
            suffix: '-small',
            extname: '.jpg',
          },
        }, {
          // image-small@2x.jpg is 400 pixels wide
          width: 200 * 2,
          rename: {
            suffix: '-small@2x',
            extname: '.jpg',
          },
        }, {
          // image-large.jpg is 480 pixels wide
          width: 480,
          rename: {
            suffix: '-large',
            extname: '.jpg',
          },
        }, {
          // image-large@2x.jpg is 960 pixels wide
          width: 480 * 2,
          rename: {
            suffix: '-large@2x',
            extname: '.jpg',
          },
        }, {
          // image-extralarge.jpg is 1280 pixels wide
          width: 1280,
          rename: {
            suffix: '-extralarge',
            extname: '.jpg',
          },
        }, {
          // image-extralarge@2x.jpg is 2560 pixels wide
          width: 1280 * 2,
          rename: {
            suffix: '-extralarge@2x',
            extname: '.jpg',
          },
        }, {
          // image-small.webp is 200 pixels wide
          width: 200,
          rename: {
            suffix: '-small',
            extname: '.webp',
          },
        }, {
          // image-small@2x.webp is 400 pixels wide
          width: 200 * 2,
          rename: {
            suffix: '-small@2x',
            extname: '.webp',
          },
        }, {
          // image-large.webp is 480 pixels wide
          width: 480,
          rename: {
            suffix: '-large',
            extname: '.webp',
          },
        }, {
          // image-large@2x.webp is 960 pixels wide
          width: 480 * 2,
          rename: {
            suffix: '-large@2x',
            extname: '.webp',
          },
        }, {
          // image-extralarge.webp is 1280 pixels wide
          width: 1280,
          rename: {
            suffix: '-extralarge',
            extname: '.webp',
          },
        }, {
          // image-extralarge@2x.webp is 2560 pixels wide
          width: 1280 * 2,
          rename: {
            suffix: '-extralarge@2x',
            extname: '.webp',
          },
        }, {
          // Global configuration for all images
          // The output quality for JPEG, WebP and TIFF output formats
          quality: 80,
          // Use progressive (interlace) scan for JPEG and PNG output
          progressive: true,
          // Skip enalrgement warnings
          skipOnEnlargement: false,
          // Strip all metadata
          withMetadata: true,
        }],
      })
      .pipe(gulp.dest('docs/images')));
});


/**
 * @name clean
 * @description deletes specified files
 */
gulp.task('clean', () => {
  return del.sync([
    'docs',
  ]);
});

gulp.task('serve', () => {
  browserSync({
    port: 2509,
    notify: false,
    logPrefix: 'ATHENA',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: (snippet) => {
          return snippet;
        },
      },
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: ['.tmp', '.'],
      middleware: [historyApiFallback()],
    },
  });
});

gulp.task('copy:fonts', () => {
  return gulp.src([
      'fonts/Roboto-min-VF.woff2',
      'fonts/AvenirNext_Variable.woff2',
      'fonts/SourceSerifVariable-Roman.ttf.woff2',
      'fonts/Roboto-min-VF-subset-demo21.woff2',
      'fonts/jost-VF.woff2',
      'fonts/WorkSans-Regular.woff2',
      'fonts/WorkSans-Bold.woff2',
      'fonts/MetaVariableDemo-Set.woff2',
      'fonts/NeueMontreal-Bold.woff',
      'fonts/NeueMontreal-Bold.woff2',
      'fonts/Fuji-Bold.woff',
      'fonts/Fuji-Bold.woff2',
      'fonts/Fuji-Light.woff',
      'fonts/Fuji-Light.woff2',
      'fonts/skolarlatinweb-light-webfont.woff',
      'fonts/skolarlatinweb-light-webfont.woff2',
      'fonts/skolarlatinweb-lightitalic-webfont.woff',
      'fonts/skolarlatinweb-lightitalic-webfont.woff2',
      'fonts/skolarlatinweb-semibold-webfont.woff',
      'fonts/skolarlatinweb-semibold-webfont.woff2',
      'fonts/skolarlatinweb-semibolditalic-webfont.woff',
      'fonts/skolarlatinweb-semibolditalic-webfont.woff2',
      'fonts/3849CD_3_0.woff2',
      'fonts/3849CD_3_0.woff',
      'fonts/3849CD_2_0.woff2',
      'fonts/3849CD_2_0.woff',
      'fonts/3849CD_1_0.woff2',
      'fonts/3849CD_1_0.woff',
      'fonts/3849CD_0_0.woff2',
      'fonts/3849CD_0_0.woff',
      'fonts/MarvinVisionsBig-Bold.woff',
      'fonts/MarvinVisionsBig-Bold.woff2',
      'fonts/Lekton-Bold.woff2',
      'fonts/Lekton-Italic.woff2',
      'fonts/Lekton-Regular.woff2',
      'fonts/Lekton-Bold.woff',
      'fonts/Lekton-Italic.woff',
      'fonts/Lekton-Regular.woff',
      'fonts/CutiveMono-Regular.woff',
      'fonts/CutiveMono-Regular.woff2',
      'fonts/hermann-bold-italic.woff',
      'fonts/hermann-bold-italic.woff2',
      'fonts/hermann-bold.woff',
      'fonts/hermann-bold.woff2',
      'fonts/hermann-italic.woff',
      'fonts/hermann-italic.woff2',
      'fonts/hermann-regular.woff',
      'fonts/hermann-regular.woff2',
      'fonts/RecoletaBold.woff2',
      'fonts/RecoletaBold.woff',
      'fonts/RecoletaMedium.woff2',
      'fonts/RecoletaMedium.woff',
    ])
    .pipe(gulp.dest('./docs/fonts'));
});

gulp.task('copy:all', () => {
  return gulp.src([
      '*.html',
      'css/**/*.css',
      'js/*.js',
      '!js/sw.js',
      'sw.js',
      'favicon.ico',
      'images/**/*.{png,jpg,jpeg,webp,gif.svg}',
      'font-specimens/**/*',
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

gulp.task('compress', () => {
  return gulp.src([
      '**/*.{html,css,js,svg}',
      '!node_modules/**/*',
      '!fonts/**/*',
      '!font-specimens/**/*',
      '!workbox-config.js',
      'sw.js',
    ])
    .pipe($.gzip({
      append: false,
    }))
    .pipe(gulp.dest('./docs'));
});

gulp.task('prepare:all', () => {
  runSequence('clean', 'copy:fonts', 'copy:all');
});

gulp.task('watch', () => {
  gulp.watch('sass/**/*.scss', ['sass']);
});

/**
 * @name default
 * @description uses clean, processCSS, build-template, imagemin
 * to build the sass stylesheets into CSS for the experiments
 */
gulp.task('default', () => {
  runSequence(['sass', 'watch']);
});
