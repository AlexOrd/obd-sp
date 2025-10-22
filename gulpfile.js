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

// Paths
const paths = {
  src: {
    templates: 'src/templates/**/*.mustache',
    slides: 'src/templates/slides/**/*.mustache',
    html: 'src/*.html',
    css: 'src/css/**/*.css',
    js: 'src/js/**/*.js',
    data: 'src/data/**/*.json',
    images: 'src/images/**/*',
  },
  dist: {
    base: 'dist',
    css: 'dist/css',
    js: 'dist/js',
    lectures: 'dist/lectures',
    images: 'dist/images',
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

// Process HTML templates with Mustache
export const templates = () => {
  log('📄 Processing index template...', 'cyan');
  const lecturesData = JSON.parse(fs.readFileSync('src/data/lectures.json', 'utf8'));

  return gulp
    .src('src/templates/index.mustache')
    .pipe(errorHandler('Templates'))
    .pipe(mustache(lecturesData))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(paths.dist.base))
    .pipe(size({ title: 'Index HTML', showFiles: true }));
};

// Process lecture templates (legacy - now using individual JSON files)
export const lectureTemplates = (done) => {
  // This task is now deprecated - we generate lectures from JSON
  done();
};

// Process individual lecture files
export const lectures = (done) => {
  log('📚 Generating lecture slides...', 'cyan');
  const lecturesDir = 'src/data/lectures/';
  const files = fs
    .readdirSync(lecturesDir)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'));

  // Load all slide partials
  const partialsDir = 'src/templates/slides/';
  const partials = {};
  fs.readdirSync(partialsDir).forEach((file) => {
    const partialName = `slides/${file.replace('.mustache', '')}`;
    partials[partialName] = fs.readFileSync(`${partialsDir}${file}`, 'utf8');
  });

  let processedCount = 0;

  files.forEach((file) => {
    const lectureData = JSON.parse(fs.readFileSync(lecturesDir + file, 'utf8'));
    const layoutData = JSON.parse(fs.readFileSync('src/data/lectures.json', 'utf8'));

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
      .src('src/templates/lecture-slide.mustache')
      .pipe(errorHandler('Lectures'))
      .pipe(mustache({ ...layoutData, lecture: lectureData }, {}, partials))
      .pipe(rename(file.replace('.json', '.html')))
      .pipe(gulp.dest(paths.dist.lectures))
      .pipe(size({ title: `Lecture ${lectureData.lectureNumber}`, showFiles: false }));

    processedCount++;
  });

  log(`✅ Generated ${processedCount} lecture(s)`, 'green');
  done();
};

// Minify CSS
export const css = () => {
  log('🎨 Processing CSS...', 'cyan');
  return gulp
    .src(paths.src.css)
    .pipe(errorHandler('CSS'))
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
    .pipe(size({ title: 'CSS', showFiles: true }));
};

// Minify JS
export const js = () => {
  log('⚡ Processing JavaScript...', 'cyan');
  return gulp
    .src(paths.src.js)
    .pipe(errorHandler('JavaScript'))
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
    .pipe(size({ title: 'JavaScript', showFiles: true }));
}; // Copy and optimize images
export const images = () => {
  log('🖼️  Processing images...', 'cyan');
  return gulp
    .src(paths.src.images)
    .pipe(errorHandler('Images'))
    .pipe(newer(paths.dist.images))
    .pipe(gulp.dest(paths.dist.images))
    .pipe(size({ title: 'Images' }));
};

// Minify HTML (for production)
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

// Development server
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

// Reload browser
const reload = (done) => {
  bs.reload();
  done();
};

// Watch files
export const watch = () => {
  log('👀 Watching for changes...', 'cyan');

  gulp
    .watch(paths.src.templates, gulp.series(templates, lectureTemplates, lectures, reload))
    .on('change', (path) => log(`Template changed: ${path}`, 'yellow'));

  gulp
    .watch(paths.src.slides, gulp.series(lectures, reload))
    .on('change', (path) => log(`Slide template changed: ${path}`, 'yellow'));

  gulp
    .watch(paths.src.data, gulp.series(templates, lectureTemplates, lectures, reload))
    .on('change', (path) => log(`Data changed: ${path}`, 'yellow'));

  gulp.watch(paths.src.css, css).on('change', (path) => log(`CSS changed: ${path}`, 'yellow'));

  gulp
    .watch(paths.src.js, gulp.series(js, reload))
    .on('change', (path) => log(`JS changed: ${path}`, 'yellow'));

  gulp
    .watch(paths.src.images, gulp.series(images, reload))
    .on('change', (path) => log(`Image changed: ${path}`, 'yellow'));
};

// Prettier - Format code
export const format = () => {
  log('💅 Formatting code with Prettier...', 'cyan');
  return gulp
    .src(
      [
        'src/**/*.{js,css,html,mustache,json}',
        'gulpfile.js',
        '!src/data/**/*.json', // Don't format lecture data
      ],
      { base: '.' }
    )
    .pipe(errorHandler('Prettier'))
    .pipe(prettier())
    .pipe(gulp.dest('.'))
    .pipe(size({ title: 'Formatted', showFiles: false }));
};

// ESLint - Lint JavaScript
export const lint = () => {
  log('🔍 Linting JavaScript with ESLint...', 'cyan');
  return gulp
    .src(['src/**/*.js', 'gulpfile.js', '!node_modules/**'])
    .pipe(errorHandler('ESLint'))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
};

// Lint and format check (don't modify files)
export const check = () => {
  log('🔍 Checking code formatting...', 'cyan');
  return gulp
    .src(['src/**/*.{js,css,html,mustache}', 'gulpfile.js'], { base: '.' })
    .pipe(errorHandler('Format Check'))
    .pipe(prettier.check());
};

// Validate - run both lint and format check
export const validate = gulp.series(lint, check);

// Development task
export const dev = gulp.series(
  clean,
  gulp.parallel(templates, lectureTemplates, lectures, css, js, images),
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
  validate, // Add validation before build
  gulp.parallel(templates, lectureTemplates, lectures, css, js, images),
  htmlMinify,
  (done) => {
    log('✅ Production build complete!', 'green');
    log('📦 Files are ready in the dist/ folder', 'cyan');
    done();
  }
);

// Default task
export default dev;
