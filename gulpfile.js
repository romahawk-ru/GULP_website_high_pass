// Подключение плагинов
const { src, dest, parallel, series, watch } = require('gulp') //npm install --save-dev gulp gulp-cli
const concat = require('gulp-concat') //npm install --save-dev gulp-concat
const htmlMin = require('gulp-htmlmin') //npm install --save-dev gulp-htmlmin
const typograf = require('gulp-typograf') //npm install gulp-typograf --save-dev
const fileinclude = require('gulp-file-include') //npm install --save-dev gulp-file-include

const autoprefixer = require('gulp-autoprefixer') //npm install --save-dev gulp-autoprefixer
const cleanCSS = require('gulp-clean-css') //npm install --save-dev gulp-clean-css
const sass = require('gulp-sass')(require('sass')) //npm install --save-dev gulp-sass sass
const rename = require('gulp-rename') //npm install --save-dev gulp-rename

const svgSprite = require('gulp-svg-sprite') //npm install --save-dev gulp-svg-sprite
const image = require('gulp-imagemin') //npm install --save-dev gulp-imagemin@7.1.0
const gulpWebp = require('gulp-webp'); // npm install --save-dev gulp-webp@4.0.1

const ttf2woff = require('gulp-ttf2woff') // npm install --save-dev gulp-ttf2woff
const ttf2woff2 = require('gulp-ttf2woff2') // npm install --save-dev gulp-ttf2woff2

const babel = require('gulp-babel') //npm install --save-dev gulp-babel
const notify = require('gulp-notify') //npm install --save-dev gulp-notify
const sourcemaps = require('gulp-sourcemaps') //npm install --save-dev gulp-sourcemaps
const uglify = require('gulp-uglify-es').default //npm install --save-dev gulp-uglify-es
const del = require('del') //npm install --save-dev del
const browserSync = require('browser-sync').create() //npm install --save-dev browser-sync

const webpack = require('webpack') //npm install --save-dev webpack
const webpackStream = require('webpack-stream') //npm install --save-dev webpack-stream

const gutil = require('gulp-util') // npm install --save-dev gulp-util
const ftp = require('vinyl-ftp') // npm install --save-dev vinyl-ftp

const fs = require('fs') // для работы с файловой системой (если установлен node.js, то установка fs не требуется)

// Очистка директории с итоговыми файлами
const clean = () => {
  return del(['./app'])
}

// Перенос файлов из папки resources в корень проекта
const resources = () => {
  return src('src/resources/**')
    .pipe(dest('./app'))
}

// Конвертация шрифтов из ttf в woff
const fonts = () => {
  src('./src/fonts/**.ttf')
    .pipe(ttf2woff())
    .pipe(dest('./app/fonts'))
  return src('./src/fonts/**.ttf')
    .pipe(ttf2woff2())
    .pipe(dest('./app/fonts'))
}

// Подключение всевозможных CSS библиотек / CSS плагинов
const cssvendor = () => {
  return src('src/scss/vendor/**/*.css')
    .pipe(concat('vendor.css'))
    .pipe(dest('./app/css/'))
}

// Обработка SCSS файлов
// sourcemaps, rename, autoprefixer, brouser-sync
const styles = () => {
  return src('./src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
        outputStyle: 'expanded'
      }).on('error', notify.onError()))
    .pipe(autoprefixer({
        cascade: false,
      }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./app/css/'))
    .pipe(browserSync.stream())
}

// Обработка HTML файлов (сборка частей файла в один + типограф)
const htmlinclude = () => {
  return src('./src/*.html')
    .pipe(fileinclude({
      prefix: '@',
      basepath: '@file'
    }))
    .pipe(typograf({
      locale: ['ru', 'en-US']
    }))
    .pipe(dest('./app'))
    .pipe(browserSync.stream())
}


// Обработка JS файлов
const scripts = () => {
  src('./src/js/vendor/**.js')
    .pipe(concat('vendor.js'))
    .pipe(dest('./app/js/'))
  return src('src/js/main.js')
    .pipe(webpackStream({
      output: {
        filename: 'main.js',
      },
      module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { targets: "defaults" }]
                ]
              }
            }
          }
        ]
      }
    }))
    .pipe(sourcemaps.init())
    .pipe(uglify({toplevel: true,}).on("error", notify.onError()))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./app/js'))
    .pipe(browserSync.stream())
}

// перенос картинок в папку app !Без зжатия
const imgToApp = () => {
  return src([
    './src/img/*.jpg',
    './src/img/**/*.png',
    './src/img/*.jpeg',
    './src/img/*.svg',
  ])
    .pipe(dest('./app/img'))
}

// Обработка SVG изображений
const svgSprites = () => {
  return src('./src/img/svg/**/*.svg')
    .pipe(svgSprite({
      mode: {
          stack: {
              sprite: "../sprite.svg"  //sprite file name
          }
      },
    }
    ))
    .pipe(dest('./app/img/svg'))
}

// конвертация изображений в webp формат
const imageToWebp = () => {
  return src([
    './src/img/towebp/**/*.jpg',
    './src/img/towebp/**/*.png',
    './src/img/towebp/**/*.jpeg',
  ])
    .pipe(gulpWebp())
    .pipe(dest('./app/img/webp'))
}

// Создание локального сервера browser-sync
const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: './app'
    }
  })

  // наблюдение за изменениями в файлах
  watch('./src/**/*.html', htmlinclude)
  watch('./src/scss/**/*.scss', styles)
  watch('./src/img/**/*.jpg', imgToApp)
  watch('./src/img/**/*.png', imgToApp)
  watch('./src/img/**/*.jpeg', imgToApp)
  watch('./src/img/towebp/**/*.*', imageToWebp)
  watch('./src/img/svg/**/*.svg', svgSprites)
  watch('./src/js/**/*.js', scripts)
  watch('./src/fonts/**.ttf', fonts)
}


exports.default = series(clean, parallel(htmlinclude, scripts, fonts, imageToWebp, imgToApp, svgSprites, resources, cssvendor), styles, watchFiles)


// Минификация HTML файлов для продакшина
const htmlincludeBuild = () => {
  return src('./src/*.html')
    .pipe(fileinclude({
      prefix: '@',
      basepath: '@file'
    }))
    .pipe(htmlMin({
      collapseWhitespace: true,
    }))
    .pipe(dest('./app'))
}

// Минификация CSS файлов для продакшина
const stylesBuild = () => {
  return src('./src/scss/**/*.scss')
    .pipe(sass({
        outputStyle: 'expanded'
      }).on('error', notify.onError()))
    .pipe(rename({
        suffix: '.min'
      }))
    .pipe(autoprefixer({
        cascade: false,
      }))
    .pipe(cleanCSS({
        level: 2
      }))
    .pipe(dest('./app/css/'))
}

// Сжатие картинок для продакшина
const imagesBuild = () => {
  return src([
    './src/img/**/*.jpg',
    './src/img/**/*.png',
    './src/img/**/*.jpeg',
  ])
    .pipe(image())
    .pipe(dest('./app/img'))
}

const webpMinBuild = () => {
  return src([
      './src/img/towebp/**/*.webp',
    ])
      .pipe(image())
      .pipe(dest('./app/img/webp'))
}


// Минификация и обфускация JS файлов для продакшина
const scriptsBuild = () => {
  return src('src/js/main.js')
    .pipe(webpackStream({
      output: {
        filename: 'main.js',
      },
      module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { targets: "defaults" }]
                ]
              }
            }
          }
        ]
      }
    }))
    .pipe(uglify({toplevel: true,}).on("error", notify.onError()))
    .pipe(dest('./app/js'))
}

exports.build = series(clean, parallel( htmlincludeBuild, scriptsBuild, fonts, webpMinBuild, imagesBuild, resources, svgSprites), stylesBuild)



// deploy // Загрузка файлов на файловый сервер
const deploy = () => {
  let conn = ftp.create( {
    host: '*',
    user: '*',
    password: '*',
    parallel: 10,
    log: gutil.log
  } );

  let globs = [
      'app/**',
  ];

  return src(globs, {
      base: './app',
      buffer: false
    })
    .pipe(conn.newer(''))
    .pipe(conn.dest('/work/public_html/'))
}

exports.deploy = deploy;
