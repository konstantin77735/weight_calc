let gulp = require("gulp"),
  log = require("fancy-log"),
  pug = require("gulp-pug"),
  sass = require('gulp-sass')(require('sass')),
  browserSync = require("browser-sync"),
  uglify = require("gulp-uglify"),
  concat = require("gulp-concat"),
  rename = require("gulp-rename"),
  minify = require("gulp-minify"),
  autoprefixer = require("gulp-autoprefixer"),
  gcmq = require("gulp-group-css-media-queries"),
  webp = require("gulp-webp"),
  deleteFile = require('gulp-delete-file'),
  debug = require('gulp-debug'),
  ignore = require('gulp-ignore'),
  ts = require('gulp-typescript'),
  sourcemaps = require('gulp-sourcemaps'),
  shell = require('gulp-shell'); //Для конвертации файла .ipynb в .py

  let renameFile = "index.php";

gulp.task("clean", async function () {
  del.sync("dist");
});

gulp.task('pug', function () {
  return gulp
    .src('dev/index.pug')
    .pipe(
      pug({
        doctype: 'html',
        pretty: false,
      })
    )
    .pipe(rename({ extname: '.php' })) // Rename index.html to index.php
    .pipe(gulp.dest('production/'))
    .on('end', function() {
      gulp.src(['production/assets/*.html'])
          .pipe(deleteFile());
  });
  
}, {description: 'Comress Pug-files into .php in "dev" and "production" folders'});

gulp.task('min-html', function () {
  return gulp
    .src('dev/index.pug')
    .pipe(
      pug({
        doctype: 'html',
        pretty: true,
      })
    )
    .pipe(rename({ extname: '.php' })) // Rename index.html to index.php
    .pipe(gulp.dest('dev/'))
    .on('end', function() {
      gulp.src(['production/assets/*.html'])
          .pipe(deleteFile());
  });


});



gulp.task("scss", function () {
  return gulp
    //в папке scss -> папка blocks - это стили для каждого html-блока 
    //discrete папка - содержит firstStyles - в ней стили для первого блока и изначального вида сайта ->
    //secondStyles - всё остальное
    .src("dev/assets/scss/discrete/*.scss")
    .pipe(
      sass({
        outputStyle: "compressed",
      })
    )

    .pipe(
      autoprefixer({
        cascade: false,
      })
    )

    .pipe(
      sass({
        outputStyle: "compressed",
      })
    )

    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(gcmq())


    .pipe(
      sass({
        outputStyle: "compressed",
      })
    )

    //и в Dev и в Production отдаём сжатые css-файлы (firstStyles, secondStyles),
    //т.к. всё равно их редактировать не буду.
    //для редактирования и существет sass/scss

    .pipe(gulp.dest("dev/assets/css"))

    .pipe(gulp.dest("production/assets/css"));

  //        .pipe(browserSync.reload({
  //            stream: true
  //        }))
});

gulp.task("gcmq", function () {
  return gulp
    .src("production/assets/css/*.css")
    .pipe(gcmq())
    .pipe(gulp.dest("production/assets/css/dist/"));
});

gulp.task("to-webp", () => {
  // './dev/img/**/*.{png,gif,jpg}' - все файлы в img и все файлы в подпапках в img

  return gulp.src('./dev/assets/img/**/*.{png,gif,jpg}')
    .pipe(webp())
    .pipe(rename({ prefix: 'webp/' }))
    .pipe(gulp.dest('./dev/assets/img'));

  return;
});


gulp.task("copy-images", function () {
  return gulp.src("dev/assets/img/**")
    .pipe(gulp.dest("production/assets/img"));

  return;
});

gulp.task('copy-txtToJson', function() {
  return gulp.src('dev/python/*.ipynb')
    .pipe(shell([
      'jupyter nbconvert --to script <%= file.path %>'
    ]))
    .pipe(gulp.dest('S:/OpenServer/OSPanel/domains/pyhton-txtToJson'))
    .pipe(gulp.src('dev/python/**/*.{ipynb,py}'))
    .pipe(ignore('**/desktop.ini'))
    .pipe(gulp.dest('S:/OpenServer/OSPanel/domains/pyhton-txtToJson'));
});


gulp.task('copy-audio-folder', function() {
  return gulp.src('dev/audio/**/*')
    .pipe(ignore('**/desktop.ini'))
    .pipe(gulp.dest('C:/Users/Personal Computer/Desktop/Personal/AllForPrank/Плееры Нарезок/PrankPlayer/mp3'));
});


gulp.task("copy-fonts", function () {
  return gulp.src("dev/assets/fonts/**").pipe(gulp.dest("production/assets/fonts"));
});


gulp.task("min-js", function () {
  return gulp
    .src("dev/assets/js/**")
    .pipe(
      minify({
        ext: {
          min: ".js",
        },
        noSource: true,
      })
    )
    .pipe(gulp.dest("production/assets/js"));
});

//gulp.task('browser-sync', function () {
//    browserSync.init({
//        server: {
//            baseDir: "dev/"
//        }
//    });
//});


gulp.task("export", function () {
  let buildHtml = gulp
  .src('production/assets/*.html')
  .pipe(rename({ extname: '.php' })) // Rename index.html to index.php
  .pipe(gulp.dest('dist'))
  .on('end', function() {
    gulp.src(['production/assets/*.html'])
        .pipe(deleteFile());
});


  let BuildCss = gulp.src("dev/assets/css/**/*.css").pipe(gulp.dest("dist/css"));

  let BuildJs = gulp.src("dev/assets/js/**/*.js").pipe(gulp.dest("dist/js"));

  let BuildFonts = gulp.src("dev/assets/fonts/**/*.*").pipe(gulp.dest("dist/fonts"));

  let BuildImg = gulp.src("dev/assets/img/**/*.*").pipe(gulp.dest("dist/img"));
});


gulp.task("watch", function () {
  gulp.watch("dev/pugBlocks/**", gulp.series("pug", "min-html"));
  gulp.watch("dev/index.pug", gulp.series("pug", "min-html"));

  gulp.watch("dev/assets/scss/**/*.scss", gulp.series("scss"));
  
  gulp.watch("dev/assets/img/**/*.{png,gif,jpg}", gulp.series("to-webp"));
  gulp.watch("dev/assets/img/**/*", gulp.series("copy-images"));
  
  gulp.watch("dev/assets/fonts/**", gulp.series("copy-fonts"));

  gulp.watch("dev/audio/**/*", gulp.series("copy-audio-folder"));
  gulp.watch("dev/python/**/*.{ipynb,py}", gulp.series("copy-txtToJson"));

  gulp.watch("dev/assets/js/**", gulp.series("min-js"));
});

gulp.task("build", gulp.series("clean", "export"));

//gulp.task('default', gulp.parallel('pug', 'scss', 'css', 'js', 'browser-sync', 'watch'));
gulp.task(
  "default",
  gulp.series(
    "pug",
    "min-html",
    "scss",
    "to-webp",
    "copy-images",
    "copy-fonts",
    "copy-audio-folder",
    "copy-txtToJson",
    "min-js",
    "watch"
  )
);