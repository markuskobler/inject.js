// base path, that will be used to resolve files and exclude
basePath = '../';

// list of files / patterns to load in the browser
files = [
  MOCHA,
  MOCHA_ADAPTER,
  'test/karma/closure.js',
  'build/closure/closure/goog/base.js',

  { pattern:'build/closure/closure/goog/deps.js', watched: false },
  { pattern:'build/closure/**/*.js', included: false, watched: false },

  { pattern:'node_modules/chai/chai.js', watched: false },
  { pattern:'node_modules/sinon-chai/lib/sinon-chai.js', watched: false },
  { pattern:'node_modules/sinon/lib/sinon.js', watched: false },

  { pattern:'build/injector/deps.js'},

  { pattern:'lib/**/*.js', included: false },

  // include any tests
  'test/client/**/*.js'
];

preprocessors = {
  '**/*.coffee': 'coffee'
};

// list of files to exclude
exclude = [
  'build/js/**/*_test.js'
];

// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['progress', 'coverage'];

// web server port
port = 9876;

// cli runner port
runnerPort = 9100;

// enable / disable colors in the output (reporters and logs)
colors = true;

// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;

// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;

// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['Chrome'];

// If browser does not capture in given timeout [ms], kill it
captureTimeout = 60000;

// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
