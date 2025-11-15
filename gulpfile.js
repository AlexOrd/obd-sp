import gulp from 'gulp';
import htmlmin from 'gulp-htmlmin';
import cleanCSS from 'gulp-clean-css';
import terser from 'gulp-terser';
import mustache from 'gulp-mustache';
import rename from 'gulp-rename';
import browserSync from 'browser-sync';
import { deleteAsync } from 'del';
import fs from 'fs';
import path from 'path';
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
/** @type {Record<string,string>} */
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
    single: 'single/**/*',
  },
  dist: {
    base: 'dist',
    css: 'dist/css',
    js: 'dist/js',
    images: 'dist/images',
    static: 'dist/static',
    single: 'dist', // Copy to root of dist
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
/**
 * Create a plumber error handler wrapper.
 * @param {string} title
 */
const errorHandler = (title) => {
  return plumber({
    // @ts-ignore - notify.onError exists at runtime
    errorHandler: notify.onError({
      title: `Gulp Error: ${title}`,
      message: '<%= error.message %>',
      sound: 'Beep',
    }),
  });
};

// Log helper
/**
 * Prefixed color console logger.
 * @param {string} message
 * @param {'cyan'|'green'|'yellow'|'red'|'magenta'} [color='cyan']
 */
const log = (message, color = 'cyan') => {
  // @ts-ignore - dynamic indexing into colors map
  console.log(`${colors[color]}[OBD-SP]${colors.reset} ${message}`);
};

// Duration formatting helper
/**
 * Format a millisecond duration for logging.
 * @param {number} ms
 * @returns {string}
 */
const formatDuration = (ms) => (ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`);

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
  const start = Date.now();
  return gulp
    .src('src/templates/landing.html')
    .pipe(errorHandler('Landing Page'))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(paths.dist.base))
    .pipe(size({ title: 'Landing Page', showFiles: true }))
    .on('end', () => log(`✅ Landing page built (${formatDuration(Date.now() - start)})`, 'green'));
};

// ==============================================
// SP TRACK (SYSTEM PROGRAMMING)
// ==============================================

// Build SP index page
export const buildSPIndex = () => {
  log('📄 Building SP index page...', 'cyan');
  const start = Date.now();
  const lecturesData = JSON.parse(fs.readFileSync('sp/data/lectures.json', 'utf8'));
  return gulp
    .src('sp/templates/index.html')
    .pipe(errorHandler('SP Index'))
    .pipe(mustache(lecturesData))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(paths.dist.sp.base))
    .pipe(size({ title: 'SP Index', showFiles: true }))
    .on('end', () => log(`✅ SP index built (${formatDuration(Date.now() - start)})`, 'green'));
};

// Build SP lectures
/**
 * Generate SP lectures HTML files from JSON definitions.
 * @param {(err?: any) => void} done
 */
export const buildSPLectures = (done) => {
  log('📚 Generating SP lectures...', 'cyan');
  const start = Date.now();

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
  const partials = /** @type {Record<string,string>} */ ({});
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
      lectureData.slides = lectureData.slides.map(
        /** @param {any} slide */ (slide) => {
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
        }
      );
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

  log(
    `✅ Generated ${processedCount} SP lecture(s) (${formatDuration(Date.now() - start)})`,
    'green'
  );
  done();
};

// Build SP CSS
export const buildSPCSS = () => {
  log('🎨 Processing SP CSS...', 'cyan');
  const start = Date.now();
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
    .pipe(size({ title: 'SP CSS', showFiles: true }))
    .on('end', () => log(`✅ SP CSS processed (${formatDuration(Date.now() - start)})`, 'green'));
};

// Build SP images
export const buildSPImages = () => {
  log('🖼️  Processing SP images...', 'cyan');
  const start = Date.now();
  return gulp
    .src(paths.src.sp.images, { encoding: false })
    .pipe(errorHandler('SP Images'))
    .pipe(newer(paths.dist.sp.images))
    .pipe(gulp.dest(paths.dist.sp.images))
    .on('end', () => log(`✅ SP images copied (${formatDuration(Date.now() - start)})`, 'green'));
};

// ==============================================
// DB TRACK (DATABASES)
// ==============================================

// Build DB index page
export const buildDBIndex = () => {
  log('📄 Building DB index page...', 'cyan');
  const start = Date.now();
  const lecturesData = JSON.parse(fs.readFileSync('db/data/lectures.json', 'utf8'));
  return gulp
    .src('db/templates/index.html')
    .pipe(errorHandler('DB Index'))
    .pipe(mustache(lecturesData))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(paths.dist.db.base))
    .pipe(size({ title: 'DB Index', showFiles: true }))
    .on('end', () => log(`✅ DB index built (${formatDuration(Date.now() - start)})`, 'green'));
};

// Build DB lectures
/**
 * Generate DB lectures HTML files from JSON definitions.
 * @param {(err?: any) => void} done
 */
export const buildDBLectures = (done) => {
  log('📚 Generating DB lectures...', 'cyan');
  const start = Date.now();

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
  const partials = /** @type {Record<string,string>} */ ({});
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
      lectureData.slides = lectureData.slides.map(
        /** @param {any} slide */ (slide) => {
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
        }
      );
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

  log(
    `✅ Generated ${processedCount} DB lecture(s) (${formatDuration(Date.now() - start)})`,
    'green'
  );
  done();
};

// Build DB CSS
export const buildDBCSS = () => {
  log('🎨 Processing DB CSS...', 'cyan');
  const start = Date.now();
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
    .pipe(size({ title: 'DB CSS', showFiles: true }))
    .on('end', () => log(`✅ DB CSS processed (${formatDuration(Date.now() - start)})`, 'green'));
};

// Build DB images
export const buildDBImages = () => {
  log('🖼️  Processing DB images...', 'cyan');
  const start = Date.now();
  return gulp
    .src(paths.src.db.images, { encoding: false })
    .pipe(errorHandler('DB Images'))
    .pipe(newer(paths.dist.db.images))
    .pipe(gulp.dest(paths.dist.db.images))
    .on('end', () => log(`✅ DB images copied (${formatDuration(Date.now() - start)})`, 'green'));
};

// ==============================================
// SHARED RESOURCES
// ==============================================

// Build shared CSS (landing page, etc.)
export const buildSharedCSS = () => {
  log('🎨 Processing shared CSS...', 'cyan');
  const start = Date.now();
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
    .pipe(size({ title: 'Shared CSS', showFiles: true }))
    .on('end', () =>
      log(`✅ Shared CSS processed (${formatDuration(Date.now() - start)})`, 'green')
    );
};

// Build shared JS
export const buildSharedJS = () => {
  log('⚡ Processing shared JavaScript...', 'cyan');
  const start = Date.now();
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
    .pipe(size({ title: 'Shared JavaScript', showFiles: true }))
    .on('end', () =>
      log(`✅ Shared JavaScript processed (${formatDuration(Date.now() - start)})`, 'green')
    );
};

// Build shared images
export const buildSharedImages = () => {
  log('🖼️  Processing shared images...', 'cyan');
  const start = Date.now();
  return gulp
    .src(paths.src.shared.images, { encoding: false })
    .pipe(errorHandler('Shared Images'))
    .pipe(newer(paths.dist.images))
    .pipe(gulp.dest(paths.dist.images))
    .on('end', () =>
      log(`✅ Shared images copied (${formatDuration(Date.now() - start)})`, 'green')
    );
};

// Copy static files
export const copyStatic = () => {
  log('📁 Copying static files...', 'cyan');
  const start = Date.now();
  return gulp
    .src(paths.src.static, { encoding: false })
    .pipe(gulp.dest(paths.dist.static))
    .pipe(size({ title: 'Static files' }))
    .on('end', () =>
      log(`✅ Static files copied (${formatDuration(Date.now() - start)})`, 'green')
    );
};

// ==============================================
// SINGLE PAGES
// ==============================================

export const copySingle = () => {
  log('📄 Copying single pages...', 'cyan');
  const start = Date.now();
  return gulp
    .src(paths.src.single)
    .pipe(newer(paths.dist.single))
    .pipe(gulp.dest(paths.dist.single))
    .pipe(size({ title: 'Single Pages' }))
    .on('end', () =>
      log(`✅ Single pages copied (${formatDuration(Date.now() - start)})`, 'green')
    );
};

// ==============================================
// HTML MINIFICATION
// ==============================================

export const htmlMinify = () => {
  if (!isProd) {
    log('⏭️  Skipping HTML minification (dev mode)', 'yellow');
    return Promise.resolve();
  }
  const start = Date.now();
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
    .pipe(size({ title: 'HTML (minified)' }))
    .on('end', () => log(`✅ HTML minified (${formatDuration(Date.now() - start)})`, 'green'));
};

// ==============================================
// DEVELOPMENT SERVER
// ==============================================

/**
 * Start development server.
 * @param {(err?: any) => void} done
 */
export const serve = (done) => {
  log('🚀 Starting BrowserSync server...', 'magenta');
  bs.init({
    server: {
      baseDir: './dist',
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

/**
 * BrowserSync reload callback wrapper.
 * @param {(err?: any) => void} done
 */
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

  gulp
    .watch(paths.src.static, gulp.series(copyStatic, reload))
    .on('change', (path) => log(`Static file changed: ${path}`, 'yellow'));

  gulp
    .watch(paths.src.single, gulp.series(copySingle, reload))
    .on('change', (path) => log(`Single page changed: ${path}`, 'yellow'));

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
  const start = Date.now();
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
    .pipe(size({ title: 'Formatted', showFiles: false }))
    .on('end', () =>
      log(`✅ Formatting complete (${formatDuration(Date.now() - start)})`, 'green')
    );
};

export const lint = () => {
  log('🔍 Linting JavaScript with ESLint...', 'cyan');
  const start = Date.now();
  return gulp
    .src(['src/**/*.js', 'gulpfile.js', '!node_modules/**'])
    .pipe(errorHandler('ESLint'))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .on('end', () => log(`✅ Lint passed (${formatDuration(Date.now() - start)})`, 'green'));
};

export const check = () => {
  log('🔍 Checking code formatting...', 'cyan');
  const start = Date.now();
  return gulp
    .src(['src/**/*.{js,css,html}', 'gulpfile.js'], { base: '.' })
    .pipe(errorHandler('Format Check'))
    .pipe(prettier.check())
    .on('end', () =>
      log(`✅ Format check passed (${formatDuration(Date.now() - start)})`, 'green')
    );
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
  copyStatic,
  copySingle
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
    // Single pages summary
    try {
      const singleSourceDir = 'single';
      if (fs.existsSync(singleSourceDir)) {
        const entries = fs.readdirSync(singleSourceDir).filter((name) => {
          const full = path.join(singleSourceDir, name);
          return fs.existsSync(full) && fs.statSync(full).isDirectory();
        });
        const count = entries.length;
        const list = count > 0 ? entries.map((e) => `dist/${e}/`).join(', ') : 'none';
        log(`   - Single Pages (${count}): ${list}`, 'cyan');
      } else {
        log('   - Single Pages: source folder missing', 'yellow');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`   - Single Pages summary error: ${msg}`, 'red');
    }
    done();
  }
);

// Default task
export default dev;
