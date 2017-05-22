var config = {
  "delete": {
    "dependencies": [
      "normalize.css"
    ],
    "vendorScss": [
      "@import '../../node_modules/normalize.css/normalize';"
    ]
  },
  "add": {
    "dependencies": {
      "jquery": "~2.2.4",
      "bootstrap-sass": "^3.3.7"
    },
    "vendorJs": [
      "./node_modules/bootstrap-sass/assets/javascripts/bootstrap.min.js"
    ],
    "vendorScss": [
      "@import '../scss/abstracts/_bootstrap-variables.scss';",
      "@import '../../node_modules/bootstrap-sass/assets/stylesheets/_bootstrap.scss';"
    ]
  }
};

describe('Dependencies', function () {
  it('should be executed without errors', function (done) {
    // JSON.parse = arg => arg;
    var dependencies = require('../../modules/dependencies')({
      errorMessage: e => console.log(e),
      logComplete: str => console.log(str),
      fs: {
        readFileSync: () => {
          return "{\"name\":\"web-starter-jc\",\"version\":\"1.0.0\",\"description\":\"Starter kit for markup projects\",\"repository\":{\"type\":\"git\",\"url\":\"git+https://github.com/justcoded/web-starter-kit\"},\"keywords\":[\"starter\",\"markup\",\"JustCoded\",\"jc\"],\"author\":\"JustCoded\",\"license\":\"MIT\",\"bugs\":{\"url\":\"https://github.com/justcoded/web-starter-kit/issues\"},\"homepage\":\"https://github.com/justcoded/web-starter-kit\",\"devDependencies\":{\"babel-preset-es2015\":\"^6.24.0\",\"babelify\":\"^7.3.0\",\"browser-sync\":\"^2.18.0\",\"browserify\":\"^14.0.0\",\"del\":\"^2.2.2\",\"files-exist\":\"^1.0.2\",\"gulp\":\"^3.9.1\",\"gulp-autoprefixer\":\"^3.1.1\",\"gulp-concat\":\"^2.6.1\",\"gulp-cssimport\":\"^5.0.0\",\"gulp-cssnano\":\"^2.1.2\",\"gulp-debug\":\"^3.1.0\",\"gulp-group-css-media-queries\":\"^1.2.0\",\"gulp-htmlhint\":\"^0.3.1\",\"gulp-imagemin\":\"^3.1.1\",\"gulp-jshint\":\"^2.0.4\",\"gulp-newer\":\"^1.3.0\",\"gulp-notify\":\"^3.0.0\",\"gulp-rename\":\"^1.2.2\",\"gulp-sass\":\"^3.1.0\",\"gulp-sourcemaps\":\"^2.4.1\",\"gulp-uglify\":\"^2.1.0\",\"gulp-util\":\"^3.0.8\",\"gulp-watch\":\"^4.3.11\",\"htmlhint-stylish\":\"^1.0.3\",\"imagemin-pngquant\":\"^5.0.0\",\"jshint\":\"^2.9.4\",\"node-notifier\":\"^5.0.2\",\"path\":\"^0.12.7\",\"run-sequence\":\"^1.2.2\",\"vinyl-buffer\":\"^1.0.0\",\"vinyl-source-stream\":\"^1.1.0\"},\"engines\":{\"node\":\">=4.0.0\"},\"scripts\":{\"test\":\"gulp production\",\"start\":\"gulp\"},\"dependencies\":{\"include-media\":\"~1.4.9\",\"jquery\":\"~2.2.4\",\"normalize.css\":\"~5.0.0\"}}";
        },
        writeFileSync: () => {}
      }
    });
    dependencies.configurePackageJson(config)
      .then(() => {
        done();
      });
  })
})

describe('Vendors', function () {
  describe('Scss', function () {
    var vendor = require('../../modules/vendor')({
      errorMessage: e => console.log(e),
      fs: {
        readFileSync: () => {
          return [
            "// All imports in this file will be compiled into vendors.css file.",
            "//",
            "// Note: You can import SCSS and CSS files as well.",
            "",
            "@import '../../node_modules/normalize.css/normalize';"
          ];
        },
        writeFileSync: (path, value) => value
      }
    });

    it('should be executed without errors', function (done) {
      vendor.changeVendor({
          config: config,
          path: '',
          addVendor: vendor.addVendorScss,
          deleteVendor: vendor.deleteVendorScss
        })
        .then(() => {
          done();
        });
    });
  });

  describe('JS', function () {
    var vendor = require('../../modules/vendor')({
      errorMessage: e => console.log(e),
      fs: {
        readFileSync: () => {
          return [
            "// All imports in this file will be compiled into vendors.js file.",
            "//",
            "// Note: ES6 support for these imports is not supported in base build",
            "",
            "module.exports = [",
            "  './node_modules/jquery/dist/jquery.js'",
            "];"
          ];
        },
        writeFileSync: () => {}
      }
    });

    it('should be executed without errors', function (done) {
      vendor.changeVendor({
          config: config,
          path: '',
          addVendor: vendor.addVendorJs,
          deleteVendor: vendor.deleteVendorJs
        })
        .then(() => {
          done();
        });
    });
  });
});