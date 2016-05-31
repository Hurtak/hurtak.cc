import PrettyError from 'pretty-error'
const error = new PrettyError()
error.skipNodeFiles()
error.skipPackage('gulp', 'express', 'babel', 'babel-core', 'run-sequence')
error.start()

import gulp from 'gulp'

import gulpLoadPlugins from 'gulp-load-plugins'
const $ = gulpLoadPlugins()

import runSequence from 'run-sequence'
import del from 'del'

// Config

const config = {
  babel: {
    optional: [
      'runtime',
      'es7.asyncFunctions'
    ]
  },
  server: {
    path: './dist/server/index.js'
  },
  revReplace: {
    modifyReved (filename) {
      while (filename.startsWith('../')) {
        filename = `/${filename.substr(3)}`
      }
      return filename
    }
  },
  autoprefixer: {
    browsers: [
      '> 2%',
      'last 2 versions',
      'Firefox ESR',
      'ie >= 9'
    ],
    cascade: false
  },
  htmlmin: {
    removeComments: true,
    collapseWhitespace: true,
    preserveLineBreaks: true
  },
  imagemin: {
    progressive: true,
    svgoPlugins: [
      {removeViewBox: false}
    ],
    use: []
  }
}

// Main tasks

gulp.task('dev', () => {
  runSequence(
    ['clear:dist', /* 'lint:js', */ 'enviroment:development'],
    ['compile:client', 'compile:server', 'compile:config', 'compile:scripts', 'images'],
    ['server:start', 'livereload:listen', 'scripts:run'],
    ['watch:client', 'watch:server']
  )
})

gulp.task('production', () => {
  runSequence(
    ['clear:dist', 'enviroment:production'],
    ['compile:client', 'compile:server', 'compile:scripts', 'compile:config', 'images'],
    ['scripts:run']
  )
})

gulp.task('scripts:run', () => {
  require('./dist/scripts/upload-articles.js')()
})

// Other tasks

gulp.task('compile:client', () => {
  const assets = $.useref.assets()

  return gulp.src('./app/templates/**/*.html')
    .pipe(assets)
    .pipe($.if('*.css', $.less()))
    .pipe($.if('*.css', $.size({title: 'css'})))
    .pipe($.if('*.js', $.size({title: 'js'})))
    // adds hash to the end of filename (styles.css -> styles-971a5eb6.css)
    .pipe($.rev())
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace(config.revReplace))
    .pipe($.if('*.html', $.htmlmin(config.htmlmin)))
    .pipe($.if('*.html', $.size({title: 'html'})))
    .pipe($.size())
    .pipe(gulp.dest('./dist/templates'))
})

gulp.task('lint:js', () => gulp.src(['./app/server/**', './gulpfile.babel.js', './app/scripts/**'])
  .pipe($.xo())
)

gulp.task('clear:dist', () => del('./dist/**'))
gulp.task('compile:server', () => compileBabelJs('./app/server/**', './dist/server'))
gulp.task('compile:scripts', () => compileBabelJs('./app/scripts/**', './dist/scripts'))
gulp.task('compile:config', () => compileBabelJs('./app/config/**', './dist/config'))
gulp.task('images', () => copy('./app/public/images/**', './dist/public/images'))
gulp.task('livereload:listen', () => $.livereload.listen())
gulp.task('livereload:reload', () => $.livereload.reload())

gulp.task('watch:server', () => {
  $.watch('./app/server/**', () => {
    runSequence(
      ['compile:server', 'server:restart'],
      ['livereload:reload']
    )
  })
})

gulp.task('watch:client', () => {
  $.watch(['./app/public/**', './app/templates/**'], () => {
    runSequence(
      ['compile:client', 'server:restart'],
      ['livereload:reload']
    )
  })
})

gulp.task('server:start', cb => {
  $.developServer.listen(config.server, error => {
    if (error) {
      console.log(error)
    } else {
      cb()
    }
  })
})

gulp.task('server:restart', cb => {
  $.developServer.restart(error => {
    if (error) {
      console.log(error)
    } else {
      cb()
    }
  })
})

gulp.task('enviroment:production', () => {
  $.env({vars: {NODE_ENV: 'production'}})
})
gulp.task('enviroment:development', () => {
  $.env({vars: {NODE_ENV: 'development'}})
})

// Helper functions

function compileBabelJs (origin, destination) {
  return gulp.src([].concat(origin))
    .pipe($.sourcemaps.init())
    .pipe($.babel(config.babel))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(destination))
}

function copy (origin, destination) {
  return gulp.src([].concat(origin))
    .pipe(gulp.dest(destination))
}