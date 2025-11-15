import gulp from 'gulp';
import htmlmin from 'gulp-htmlmin';
import cleanCSS from 'gulp-clean-css';
import terser from 'gulp-terser';
import mustache from 'gulp-mustache';
import rename from 'gulp-rename';
import browserSync from 'browser-sync';
import { deleteAsync } from 'del';
import fs from 'fs';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import gulpif from 'gulp-if';
import size from 'gulp-size';
import autoprefixer from 'gulp-autoprefixer';
import newer from 'gulp-newer';
import eslint from 'gulp-eslint-new';
import prettier from 'gulp-prettier';

const bs = browserSync.create();
const isProd = process.env.NODE_ENV === 'production';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

// Paths for dual-track system
const paths = {
  src: {
    // Shared resources
    shared: {
      templates: 'src/templates/**/*.html',
      css: 'src/css/**/*.css',
      js: 'src/js/**/*.js',
      images: 'src/images/**/*',
    },
    // SP track
    sp: {
      templates: 'sp/templates/**/*.html',
      slides: 'sp/templates/slides/**/*.html',
      css: 'sp/css/**/*.css',
      data: 'sp/data/**/*.json',
      images: 'sp/images/**/*',
    },
    // DB track
    db: {
      templates: 'db/templates/**/*.html',
      slides: 'db/templates/slides/**/*.html',
      css: 'db/css/**/*.css',
      data: 'db/data/**/*.json',
      images: 'db/images/**/*',
    },
    static: 'static/**/*',
  },
  dist: {
    base: 'dist',
    css: 'dist/css',
    js: 'dist/js',
    images: 'dist/images',
    static: 'dist/static',
    sp: {
      base: 'dist/sp',
      lectures: 'dist/sp/lectures',
      css: 'dist/sp/css',
      images: 'dist/sp/images',
    },
    db: {
      base: 'dist/db',
      lectures: 'dist/db/lectures',
      css: 'dist/db/css',
      images: 'dist/db/images',
    },
  },
};

// Error handler
const errorHandler = (title) => {
  return plumber({
    errorHandler: notify.onError({
      title: `Gulp Error: ${title}`,
      message: '<%= error.message %>',
      sound: 'Beep',
    }),
  });
};

// Log helper
const log = (message, color = 'cyan') => {
  console.log(`${colors[color]}[OBD-SP]${colors.reset} ${message}`);
};

// Clean dist folder
export const clean = () => {
  log('🧹 Cleaning dist folder...', 'yellow');
  return deleteAsync(['dist']);
};

// ==============================================
// LANDING PAGE
// ==============================================

// Build landing page
export const buildLanding = () => {
  log('🏠 Building landing page...', 'cyan');

  return gulp
    .src('src/templates/landing.html')
    .pipe(errorHandler('Landing Page'))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(paths.dist.base))
    .pipe(size({ title: 'Landing Page', showFiles: true }));
};

// ==============================================
// SP TRACK (SYSTEM PROGRAMMING)
// ==============================================

// Build SP index page
export const buildSPIndex = () => {
  log('📄 Building SP index page...', 'cyan');
  const lecturesData = JSON.parse(fs.readFileSync('sp/data/lectures.json', 'utf8'));

  return gulp
    .src('sp/templates/index.html')
    .pipe(errorHandler('SP Index'))
    .pipe(mustache(lecturesData))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(paths.dist.sp.base))
    .pipe(size({ title: 'SP Index', showFiles: true }));
};

// Build SP lectures
export const buildSPLectures = (done) => {
  log('📚 Generating SP lectures...', 'cyan');

  const lecturesDir = 'sp/data/lectures/';
  const files = fs
    .readdirSync(lecturesDir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'));

  if (files.length === 0) {
    log('⚠️  No SP lectures found', 'yellow');
    done();
    return;
  }

  // Load SP slide partials
  const partialsDir = 'sp/templates/slides/';
  const partials = {};
  fs.readdirSync(partialsDir).forEach((file) => {
    const partialName = `slides/${file.replace('.html', '')}`;
    partials[partialName] = fs.readFileSync(`${partialsDir}${file}`, 'utf8');
  });

  let processedCount = 0;

  files.forEach((file) => {
    const lectureData = JSON.parse(fs.readFileSync(lecturesDir + file, 'utf8'));
    const layoutData = JSON.parse(fs.readFileSync('sp/data/lectures.json', 'utf8'));

    // Add boolean flags for each slide type
    if (lectureData.slides) {
      lectureData.slides = lectureData.slides.map((slide) => {
        return {
          ...slide,
          isTitle: slide.type === 'title',
          isRoadmap: slide.type === 'roadmap',
          isPreviousLecture: slide.type === 'previous-lecture',
          isDefinition: slide.type === 'definition',
          isSyntax: slide.type === 'syntax',
          isCodeExample: slide.type === 'code-example',
          isCodeBreakdown: slide.type === 'code-breakdown',
          isDiagram: slide.type === 'diagram',
          isComparison: slide.type === 'comparison',
          isDebugger: slide.type === 'debugger',
          isCommonMistake: slide.type === 'common-mistake',
          isSummary: slide.type === 'summary',
          isNextSteps: slide.type === 'next-steps',
          isLiveCoding: slide.type === 'live-coding',
        };
      });
    }

    gulp
      .src('sp/templates/lecture-slide.html')
      .pipe(errorHandler('SP Lectures'))
      .pipe(mustache({ ...layoutData, lecture: lectureData }, {}, partials))
      .pipe(rename(file.replace('.json', '.html')))
      .pipe(gulp.dest(paths.dist.sp.lectures))
      .pipe(size({ title: `SP Lecture ${lectureData.lectureNumber}`, showFiles: false }));

    // Generate print-friendly version for PDF
    gulp
      .src('sp/templates/lecture-slide.html')
      .pipe(errorHandler('SP Lectures Print'))
      .pipe(mustache({ ...layoutData, lecture: lectureData, isPrintVersion: true }, {}, partials))
      .pipe(rename(file.replace('.json', '-print.html')))
      .pipe(gulp.dest(paths.dist.sp.lectures));

    processedCount++;
  });

  log(`✅ Generated ${processedCount} SP lecture(s)`, 'green');
  done();
};

// Build SP CSS
export const buildSPCSS = () => {
  log('🎨 Processing SP CSS...', 'cyan');
  return gulp
    .src(paths.src.sp.css)
    .pipe(errorHandler('SP CSS'))
    .pipe(autoprefixer())
    .pipe(
      gulpif(
        isProd,
        cleanCSS({
          level: 2,
          compatibility: '*',
        })
      )
    )
    .pipe(gulp.dest(paths.dist.sp.css))
    .pipe(size({ title: 'SP CSS', showFiles: true }));
};

// Build SP images
export const buildSPImages = () => {
  log('🖼️  Processing SP images...', 'cyan');
  return gulp
    .src(paths.src.sp.images, { encoding: false })
    .pipe(errorHandler('SP Images'))
    .pipe(newer(paths.dist.sp.images))
    .pipe(gulp.dest(paths.dist.sp.images));
};

// ==============================================
// DB TRACK (DATABASES)
// ==============================================

// Build DB index page
export const buildDBIndex = () => {
  log('📄 Building DB index page...', 'cyan');
  const lecturesData = JSON.parse(fs.readFileSync('db/data/lectures.json', 'utf8'));

  return gulp
    .src('db/templates/index.html')
    .pipe(errorHandler('DB Index'))
    .pipe(mustache(lecturesData))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(paths.dist.db.base))
    .pipe(size({ title: 'DB Index', showFiles: true }));
};

// Build DB lectures
export const buildDBLectures = (done) => {
  log('📚 Generating DB lectures...', 'cyan');

  const lecturesDir = 'db/data/lectures/';
  const files = fs
    .readdirSync(lecturesDir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'));

  if (files.length === 0) {
    log('⚠️  No DB lectures found', 'yellow');
    done();
    return;
  }

  // Load DB slide partials
  const partialsDir = 'db/templates/slides/';
  const partials = {};
  fs.readdirSync(partialsDir).forEach((file) => {
    const partialName = `slides/${file.replace('.html', '')}`;
    partials[partialName] = fs.readFileSync(`${partialsDir}${file}`, 'utf8');
  });

  let processedCount = 0;

  files.forEach((file) => {
    const lectureData = JSON.parse(fs.readFileSync(lecturesDir + file, 'utf8'));
    const layoutData = JSON.parse(fs.readFileSync('db/data/lectures.json', 'utf8'));

    // Add boolean flags for each slide type
    if (lectureData.slides) {
      lectureData.slides = lectureData.slides.map((slide) => {
        return {
          ...slide,
          isTitle: slide.type === 'title',
          isRoadmap: slide.type === 'roadmap',
          isPreviousLecture: slide.type === 'previous-lecture',
          isDefinition: slide.type === 'definition',
          isSyntax: slide.type === 'syntax',
          isCodeExample: slide.type === 'code-example',
          isCodeBreakdown: slide.type === 'code-breakdown',
          isDiagram: slide.type === 'diagram',
          isComparison: slide.type === 'comparison',
          isDebugger: slide.type === 'debugger',
          isCommonMistake: slide.type === 'common-mistake',
          isSummary: slide.type === 'summary',
          isNextSteps: slide.type === 'next-steps',
          isLiveCoding: slide.type === 'live-coding',
        };
      });
    }

    gulp
      .src('db/templates/lecture-slide.html')
      .pipe(errorHandler('DB Lectures'))
      .pipe(mustache({ ...layoutData, lecture: lectureData }, {}, partials))
      .pipe(rename(file.replace('.json', '.html')))
      .pipe(gulp.dest(paths.dist.db.lectures))
      .pipe(size({ title: `DB Lecture ${lectureData.lectureNumber}`, showFiles: false }));

    // Generate print-friendly version for PDF
    gulp
      .src('db/templates/lecture-slide.html')
      .pipe(errorHandler('DB Lectures Print'))
      .pipe(mustache({ ...layoutData, lecture: lectureData, isPrintVersion: true }, {}, partials))
      .pipe(rename(file.replace('.json', '-print.html')))
      .pipe(gulp.dest(paths.dist.db.lectures));

    processedCount++;
  });

  log(`✅ Generated ${processedCount} DB lecture(s)`, 'green');
  done();
};

// Build DB CSS
export const buildDBCSS = () => {
  log('🎨 Processing DB CSS...', 'cyan');
  return gulp
    .src(paths.src.db.css)
    .pipe(errorHandler('DB CSS'))
    .pipe(autoprefixer())
    .pipe(
      gulpif(
        isProd,
        cleanCSS({
          level: 2,
          compatibility: '*',
        })
      )
    )
    .pipe(gulp.dest(paths.dist.db.css))
    .pipe(size({ title: 'DB CSS', showFiles: true }));
};

// Build DB images
export const buildDBImages = () => {
  log('🖼️  Processing DB images...', 'cyan');
  return gulp
    .src(paths.src.db.images, { encoding: false })
    .pipe(errorHandler('DB Images'))
    .pipe(newer(paths.dist.db.images))
    .pipe(gulp.dest(paths.dist.db.images));
};

// ==============================================
// SHARED RESOURCES
// ==============================================

// Build shared CSS (landing page, etc.)
export const buildSharedCSS = () => {
  log('🎨 Processing shared CSS...', 'cyan');
  return gulp
    .src(paths.src.shared.css)
    .pipe(errorHandler('Shared CSS'))
    .pipe(autoprefixer())
    .pipe(
      gulpif(
        isProd,
        cleanCSS({
          level: 2,
          compatibility: '*',
        })
      )
    )
    .pipe(gulp.dest(paths.dist.css))
    .pipe(gulpif(!isProd, bs.stream()))
    .pipe(size({ title: 'Shared CSS', showFiles: true }));
};

// Build shared JS
export const buildSharedJS = () => {
  log('⚡ Processing shared JavaScript...', 'cyan');
  return gulp
    .src(paths.src.shared.js)
    .pipe(errorHandler('Shared JavaScript'))
    .pipe(
      gulpif(
        isProd,
        terser({
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        })
      )
    )
    .pipe(gulp.dest(paths.dist.js))
    .pipe(size({ title: 'Shared JavaScript', showFiles: true }));
};

// Build shared images
export const buildSharedImages = () => {
  log('🖼️  Processing shared images...', 'cyan');
  return gulp
    .src(paths.src.shared.images, { encoding: false })
    .pipe(errorHandler('Shared Images'))
    .pipe(newer(paths.dist.images))
    .pipe(gulp.dest(paths.dist.images));
};

// Copy static files
export const copyStatic = () => {
  log('📁 Copying static files...', 'cyan');
  return gulp
    .src(paths.src.static, { encoding: false })
    .pipe(gulp.dest(paths.dist.static))
    .pipe(size({ title: 'Static files' }));
};

// ==============================================
// HTML MINIFICATION
// ==============================================

export const htmlMinify = () => {
  if (!isProd) {
    log('⏭️  Skipping HTML minification (dev mode)', 'yellow');
    return Promise.resolve();
  }

  log('🗜️  Minifying HTML...', 'cyan');
  return gulp
    .src(`${paths.dist.base}/**/*.html`)
    .pipe(errorHandler('HTML Minify'))
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
        removeAttributeQuotes: false,
        removeEmptyAttributes: false,
      })
    )
    .pipe(gulp.dest(paths.dist.base))
    .pipe(size({ title: 'HTML (minified)' }));
};

// ==============================================
// DEVELOPMENT SERVER
// ==============================================

export const serve = (done) => {
  log('🚀 Starting BrowserSync server...', 'magenta');
  bs.init({
    server: {
      baseDir: './dist',
      middleware: [
        (req, res, next) => {
          // Redirect /tg_bot to /static/tg_bot/index.html
          if (req.url === '/tg_bot' || req.url === '/tg_bot/') {
            req.url = '/static/tg_bot/index.html';
          }
          next();
        },
      ],
    },
    port: 3000,
    notify: false,
    open: false,
    ui: {
      port: 3001,
    },
    ghostMode: {
      clicks: false,
      forms: false,
      scroll: false,
    },
  });
  log('✨ Server ready at http://localhost:3000', 'green');
  done();
};

const reload = (done) => {
  bs.reload();
  done();
};

// ==============================================
// WATCH TASKS
// ==============================================

export const watch = () => {
  log('👀 Watching for changes...', 'cyan');

  // Watch landing page
  gulp
    .watch('src/templates/landing.html', gulp.series(buildLanding, reload))
    .on('change', (path) => log(`Landing template changed: ${path}`, 'yellow'));

  // Watch shared resources
  gulp
    .watch(paths.src.shared.css, buildSharedCSS)
    .on('change', (path) => log(`Shared CSS changed: ${path}`, 'yellow'));

  gulp
    .watch(paths.src.shared.js, gulp.series(buildSharedJS, reload))
    .on('change', (path) => log(`Shared JS changed: ${path}`, 'yellow'));

  gulp
    .watch(paths.src.shared.images, gulp.series(buildSharedImages, reload))
    .on('change', (path) => log(`Shared image changed: ${path}`, 'yellow'));

  // Watch SP track
  gulp
    .watch(
      [paths.src.sp.templates, paths.src.sp.data],
      gulp.series(buildSPIndex, buildSPLectures, reload)
    )
    .on('change', (path) => log(`SP template/data changed: ${path}`, 'yellow'));

  gulp
    .watch(paths.src.sp.css, gulp.series(buildSPCSS, reload))
    .on('change', (path) => log(`SP CSS changed: ${path}`, 'yellow'));

  gulp
    .watch(paths.src.sp.images, gulp.series(buildSPImages, reload))
    .on('change', (path) => log(`SP image changed: ${path}`, 'yellow'));

  // Watch DB track
  gulp
    .watch(
      [paths.src.db.templates, paths.src.db.data],
      gulp.series(buildDBIndex, buildDBLectures, reload)
    )
    .on('change', (path) => log(`DB template/data changed: ${path}`, 'yellow'));

  gulp
    .watch(paths.src.db.css, gulp.series(buildDBCSS, reload))
    .on('change', (path) => log(`DB CSS changed: ${path}`, 'yellow'));

  gulp
    .watch(paths.src.db.images, gulp.series(buildDBImages, reload))
    .on('change', (path) => log(`DB image changed: ${path}`, 'yellow'));

  // Watch static files
  gulp
    .watch(paths.src.static, gulp.series(copyStatic, reload))
    .on('change', (path) => log(`Static file changed: ${path}`, 'yellow'));
};

// ==============================================
// CODE QUALITY
// ==============================================

export const format = () => {
  log('💅 Formatting code with Prettier...', 'cyan');
  return gulp
    .src(
      [
        'src/**/*.{js,css,html}',
        'sp/**/*.{css,html}',
        'db/**/*.{css,html}',
        'gulpfile.js',
        '!sp/data/**/*.json',
        '!db/data/**/*.json',
      ],
      { base: '.' }
    )
    .pipe(errorHandler('Prettier'))
    .pipe(prettier())
    .pipe(gulp.dest('.'))
    .pipe(size({ title: 'Formatted', showFiles: false }));
};

export const lint = () => {
  log('🔍 Linting JavaScript with ESLint...', 'cyan');
  return gulp
    .src(['src/**/*.js', 'gulpfile.js', '!node_modules/**'])
    .pipe(errorHandler('ESLint'))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
};

export const check = () => {
  log('🔍 Checking code formatting...', 'cyan');
  return gulp
    .src(['src/**/*.{js,css,html}', 'gulpfile.js'], { base: '.' })
    .pipe(errorHandler('Format Check'))
    .pipe(prettier.check());
};

export const validate = gulp.series(lint, check);

// ==============================================
// COMPOSITE TASKS
// ==============================================

// Build SP track
export const buildSP = gulp.parallel(buildSPIndex, buildSPLectures, buildSPCSS, buildSPImages);

// Build DB track
export const buildDB = gulp.parallel(buildDBIndex, buildDBLectures, buildDBCSS, buildDBImages);

// Build shared resources
export const buildShared = gulp.parallel(
  buildSharedCSS,
  buildSharedJS,
  buildSharedImages,
  copyStatic
);

// Development task
export const dev = gulp.series(
  gulp.parallel(buildLanding, buildSP, buildDB, buildShared),
  serve,
  watch
);

// Build task (production)
export const build = gulp.series(
  (done) => {
    log('🏗️  Building for PRODUCTION...', 'magenta');
    done();
  },
  clean,
  format,
  validate,
  gulp.parallel(buildLanding, buildSP, buildDB, buildShared),
  htmlMinify,
  (done) => {
    log('✅ Production build complete!', 'green');
    log('📦 Files are ready in the dist/ folder', 'cyan');
    log('   - Landing: dist/index.html', 'cyan');
    log('   - SP Track: dist/sp/', 'cyan');
    log('   - DB Track: dist/db/', 'cyan');
    done();
  }
);

// Default task
export default dev;
