const includeCoverage = true;

const rules = () => {
  const defaultRules = [
    {
      test: /\.js$/i,
      exclude: /(node_modules)/,
      loader: 'babel-loader'
    },
    {
      test: /\.[s]?css$/,
      exclude: /(node_modules)/,
      loader: 'style-loader!css-loader!sass-loader'
    }
  ];
  return includeCoverage ? defaultRules.concat([
    {
      enforce: 'pre',
      test: /.spec\.js$/,
      include: /spec/,
      exclude: /node_modules/,
      use: [{ loader: 'babel-loader' }]
    },
    {
      enforce: 'pre',
      test: /\.js$/,
      include: /src/,
      exclude: /node_modules/,
      use: [{ loader: 'istanbul-instrumenter-loader', query: { esModules: true } }]
    }
  ]) : defaultRules;
};

module.exports = function (config) {
  let conf = {
    basePath: '',
    exclude: [],
    files: [
      { pattern: 'spec/*.js', watched: true, served: true, included: true },
      'https://code.jquery.com/jquery-3.4.1.min.js'
    ],
    //.concat(
    //  ['jpg', 'js', 'json', 'mp3', 'mp4'].map((ext) => {
    //    return {
    //      pattern:  `./spec/fixture-data/*.${ext}`,
    //      included: false,
    //      watched:  true,
    //      served:   true
    //    }
    //  })
    //),
    autoWatch: true,
    singleRun: false,
    failOnEmptyTestSuite: false,
    logLevel: config.LOG_WARN,
    frameworks: ['jasmine'],
    browsers: ['Chrome'/*,'PhantomJS','Firefox','Edge','ChromeCanary','Opera','IE','Safari'*/],
    reporters: includeCoverage ? ['progress', 'kjhtml', 'spec', 'coverage'] : ['kjhtml'],//, 'kjhtml', 'dots', ],
    //address that the server will listen on, '0.0.0.0' is default
    listenAddress: '0.0.0.0',
    //hostname to be used when capturing browsers, 'localhost' is default
    hostname: 'localhost',
    //the port where the web server will be listening, 9876 is default
    port: 9876,
    //when a browser crashes, karma will try to relaunch, 2 is default
    retryLimit: 0,
    //how long does Karma wait for a browser to reconnect, 2000 is default
    browserDisconnectTimeout: 5000,
    //how long will Karma wait for a message from a browser before disconnecting from it, 10000 is default
    browserNoActivityTimeout: 10000,
    //timeout for capturing a browser, 60000 is default
    captureTimeout: 60000,

    client: {
      captureConsole: false,
      clearContext: false,
      jasmine: {
        random: false
      }
    },

    /* karma-webpack config
       pass your webpack configuration for karma
       add `babel-loader` to the webpack configuration to make
       the ES6+ code in the test files readable to the browser
       eg. import, export keywords */
    webpack: {
      module: {
        rules: rules()
      }
    },
    preprocessors: includeCoverage ? {
      './spec/**/*.js': ['webpack', 'sourcemap'],
      './src/**/*.js': ['webpack', 'sourcemap', 'coverage'],
    } : {
      './spec/*.js': ['webpack']
    },
    webpackMiddleware: {
      //turn off webpack bash output when run the tests
      noInfo: true,
      stats: 'errors-only'
    }
  };

  if(includeCoverage){
    conf.coverageIstanbulReporter = {
      dir : 'coverage/',
      reports: [ 'html' ],
      fixWebpackSourcePaths: true
    };
  }

  config.set(conf);
};
