// -- require ---------------------------------------------------------------

const fs = require("fs")
const gulp = require("gulp")
const path = require("path")
const pkg = require("./package.json")
const plug = require("gulp-load-plugins")({
  "pattern": "*",
  "rename": {
    "eslint": "Eslint",
    "gulp-if": "gulpIf",
    "riot": "Riot"
  }
})
const proc = require("child_process")

// -- const -----------------------------------------------------------------

const CWD = process.cwd()
const SRC = path.join(CWD, "src")
const TMP = path.join(CWD, ".tmp")
const OUT = path.join(CWD, "docs")

const EXT = "xhtml"
const MIN = typeof plug.util.env.min != "undefined"
const WPK = typeof plug.util.env.wpk != "undefined"

// -- opts ------------------------------------------------------------------

const opts = new function () {
  return {
    "autoprefixer": {
      "browsers": plug.browserslist([">0.25% in my stats"], {
        "stats": ".caniuse.json"
      }),
      "cascade": false,
      "remove": true
    },
    "babel": {
      "plugins": ["check-es2015-constants",
        "transform-es2015-arrow-functions",
        "transform-es2015-block-scoped-functions",
        "transform-es2015-block-scoping", "transform-es2015-classes",
        "transform-es2015-computed-properties",
        "transform-es2015-destructuring", "transform-es2015-duplicate-keys",
        "transform-es2015-for-of", "transform-es2015-function-name",
        "transform-es2015-literals", "transform-es2015-object-super",
        "transform-es2015-parameters",
        "transform-es2015-shorthand-properties", "transform-es2015-spread",
        "transform-es2015-sticky-regex",
        "transform-es2015-template-literals",
        "transform-es2015-typeof-symbol", "transform-es2015-unicode-regex",
        "transform-regenerator"]
    },
    "changedInPlace": {
      "firstPass": true
    },
    "cssbeautify": {
      "autosemicolon": true,
      "indent": "  "
    },
    "csslint": {
      "adjoining-classes": false,
      "box-model": true,
      "box-sizing": false,
      "bulletproof-font-face": true,
      "compatible-vendor-prefixes": false,
      "display-property-grouping": true,
      "duplicate-background-images": true,
      "duplicate-properties": true,
      "empty-rules": true,
      "fallback-colors": true,
      "floats": true,
      "font-faces": true,
      "font-sizes": true,
      "gradients": true,
      "ids": true,
      "import": true,
      "important": true,
      "known-properties": true,
      "order-alphabetical": false,
      "outline-none": true,
      "overqualified-elements": true,
      "qualified-headings": true,
      "regex-selectors": true,
      "shorthand": true,
      "star-property-hack": true,
      "text-indent": true,
      "underscore-property-hack": true,
      "unique-headings": true,
      "universal-selector": true,
      "unqualified-attributes": true,
      "vendor-prefix": true,
      "zero-units": true
    },
    "cssnano": {
      "autoprefixer": {
        "add": true,
        "browsers": plug.browserslist([">0.25% in my stats"], {
          "stats": ".caniuse.json"
        })
      }
    },
    "env": MIN ? "production" : "development",
    "eslint": {
      "fix": true
    },
    "ext": {
      "es6": "*.@(e|j)s?(6|x)",
      "riot": /\.tag$/,
      "sass": "*.s@(a|c)ss",
      "slim": "*.sl?(i)m",
      "svg": "*.svg"
    },
    "htmlmin": {
      "collapseWhitespace": MIN,
      "keepClosingSlash": true,
      "minifyURLs": true,
      "removeComments": true,
      "removeScriptTypeAttributes": true,
      "removeStyleLinkTypeAttributes": true,
      "useShortDoctype": true
    },
    "htmltidy": {
      "doctype": "html5",
      "indent": true,
      "indent-spaces": 2,
      "input-xml": true,
      "logical-emphasis": true,
      "new-blocklevel-tags": "",
      "output-xhtml": true,
      "quiet": true,
      "sort-attributes": "alpha",
      "tidy-mark": false,
      "wrap": 78
    },
    "inject": {
      "css": {
        "above": "<style>",
        "below": "</style>"
      },
      "js": {
        "above": "<script>",
        "below": "</script>"
      },
      "license": "/*! github.com/ptb, @license Apache-2.0 */\n",
      "riot": `const riot = require("riot")${MIN ? ";" : "\n"}`
    },
    "jsbeautifier": {
      "js": {
        "file_types": [
          ".es6",
          ".js",
          ".json"
        ],
        "break_chained_methods": true,
        "end_with_newline": true,
        "indent_size": 2,
        "jslint_happy": true,
        "keep_array_indentation": true,
        "keep_function_indentation": true,
        "max_preserve_newlines": 2,
        "space_after_anon_function": true,
        "wrap_line_length": 78
      }
    },
    "path": {
      "exclude": `!${path.join("**", "@(_*|*.tag)", "*")}`,
      "out": path.join(OUT, "**"),
      "src": path.join(SRC, "**")
    },
    "rename": {
      "html": {
        "extname": `.${EXT}`
      },
      "js": {
        "extname": ".js"
      }
    },
    "restart": {
      "files": ["config.rb", "Gemfile.lock", "gulpfile.js", "package.json",
        "yarn.lock"]
    },
    "riot": {
      "compact": MIN
    },
    "sass": {
      "outputStyle": MIN ? "compressed" : "expanded"
    },
    "slim": {
      "chdir": true,
      "options": ["attr_quote='\"'", `format=:${EXT}`, "shortcut={ " +
        "'@' => { attr: 'role' }, '#' => { attr: 'id' }, " +
        "'.' => { attr: 'class' }, '%' => { attr: 'itemprop' }, " +
        "'^' => { attr: 'data-is' }, '&' => { attr: 'type', tag: 'input' } }",
        "sort_attrs=true"],
      "pretty": !MIN,
      "require": "slim/include"
    },
    "trimlines": {
      "leading": false
    },
    "webpack": {
      "context": path.join(TMP, "js"),
      "entry": {
        "index": "./index.js",
        "share": Object.keys(pkg.dependencies)
      },
      "module": {
        "rules": [
          {
            "loader": "tag-loader",
            "options": {
              "compact": true
            },
            "test": /\.tag$/
          }
        ]
      },
      "output": {
        "filename": path.join("js", "[name].js")
      },
      "plugins": [
        new plug.webpack.SourceMapDevToolPlugin({
          "filename": path.join("js", "[name].map"),
          "moduleFilenameTemplate": function (info) {
            if (!MIN && fs.existsSync(info.absoluteResourcePath)) {
              return `file://${encodeURI(info.absoluteResourcePath)}`
            }
            return `${path.basename(info.resourcePath)}?${info.hash}`
          }
        }),
        new plug.webpack.optimize.AggressiveMergingPlugin(),
        new plug.webpack.optimize.CommonsChunkPlugin({
          "name": "share"
        }),
        new plug.webpack.optimize.UglifyJsPlugin({
          "compress": {
            "warnings": false
          },
          "mangle": MIN,
          "output": {
            "beautify": !MIN,
            "comments": false,
            "indent_level": 2
          },
          "sourceMap": true
        })
      ],
      "resolve": {
        "extensions": [".js", ".json", ".tag"]
      }
    }
  }
}()

// -- task ------------------------------------------------------------------

const task = {
  "build": function (done) {
    proc.execSync(`bundle exec middleman build -e ${opts.env}`, {
      "stdio": "inherit"
    })
    done()
  },
  "compile": {
    "es6": function () {
      return plug.babel(opts.babel)
    },
    "riot": function () {
      return plug.riot(opts.riot)
    },
    "sass": plug.lazypipe()
      .pipe(plug.sass, opts.sass)
      .pipe(plug.autoprefixer, opts.autoprefixer),
    "slim": function () {
      return plug.slim(opts.slim)
    },
    "webpack": function () {
      return plug.webpackStream(opts.webpack, plug.webpack)
    }
  },
  "concat": function (folder) {
    return plug.concat(folder)
  },
  "each": {
    "folder": function (a, b, c) {
      const d = function (e, f, g) {
        return fs.readdirSync(f)
          .reduce(function (h, i) {
            const j = [path.join(f, i), e, path.relative(e, f), i]

            if (fs.statSync(j[0])
              .isDirectory()) {
              return h.concat(g.test(i) ? [j] : [], d(e, j[0], g))
            }
            return h
          }, [])
      }

      return d(a, b, c)
    }
  },
  "indent": function (tag) {
    return plug.gulpIf(tag, plug.indent())
  },
  "lint": {
    "css": plug.lazypipe()
      .pipe(plug.csslint, opts.csslint)
      .pipe(plug.csslint.formatter, "compact"),
    "es6": plug.lazypipe()
      .pipe(plug.eslint, opts.eslint)
      .pipe(plug.eslint.format),
    "html": function (lint) {
      return plug.gulpIf(lint, plug.w3cjs())
    },
    "sass": plug.lazypipe()
      .pipe(plug.sassLint)
      .pipe(plug.sassLint.format),
    "slim": function () {
      return plug.flatmap(function (stream, file) {
        proc.spawn("slim-lint", [file.path], {
          "stdio": "inherit"
        })
        return stream
      })
    }
  },
  "minify": {
    "css": function (min) {
      return plug.gulpIf(min, plug.cssnano(opts.cssnano))
    },
    "html": function () {
      return plug.htmlmin(opts.htmlmin)
    },
    "js": function (min) {
      return plug.gulpIf(min, plug.uglify())
    },
    "svg": function () {
      return plug.gulpIf(MIN, plug.svgmin())
    }
  },
  "rename": {
    "dir": function (dir) {
      return plug.rename({
        "dirname": dir
      })
    },
    "html": function () {
      return plug.rename(opts.rename.html)
    },
    "js": function () {
      return plug.rename(opts.rename.js)
    }
  },
  "restart": function () {
    if (process.platform === "darwin") {
      proc.spawn("osascript", ["-e", 'activate app "Terminal"', "-e",
        'tell app "System Events" to keystroke "k" using command down'])
    }
    plug.kexec("npm", ["run", MIN ? "build" : "start"])
  },
  "save": {
    "src": function () {
      return plug.gulpIf(!MIN, gulp.dest(SRC))
    },
    "tmp": function () {
      return gulp.dest(TMP)
    }
  },
  "tail": {
    "log": function () {
      proc.exec(`tail -f -n0 "${path.join(CWD, "logs", "access.log")}"`)
        .stdout.pipe(process.stdout)
    }
  },
  "tidy": {
    "css": function () {
      return plug.gulpIf(!MIN, plug.cssbeautify(opts.cssbeautify))
    },
    "es6": plug.lazypipe()
      .pipe(function () {
        return plug.gulpIf(!MIN, plug.jsbeautifier(opts.jsbeautifier))
      })
      .pipe(function () {
        return plug.gulpIf(!MIN, plug.jsbeautifier.reporter())
      }),
    "html": function () {
      return plug.gulpIf(!MIN, plug.htmltidy(opts.htmltidy))
    },
    "lines": function () {
      return plug.trimlines(opts.trimlines)
    },
    "sass": function () {
      return plug.csscomb()
    }
  },
  "wrap": {
    "above": function (min) {
      return plug.gulpIf(min, plug.injectString.prepend("\n"))
    },
    "below": function (min) {
      return plug.gulpIf(min, plug.injectString.append("\n"))
    },
    "css": plug.lazypipe()
      .pipe(plug.injectString.prepend, opts.inject.css.above)
      .pipe(plug.injectString.append, opts.inject.css.below),
    "js": plug.lazypipe()
      .pipe(plug.injectString.prepend, opts.inject.js.above)
      .pipe(plug.injectString.append, opts.inject.js.below),
    "license": function () {
      return plug.injectString.prepend(opts.inject.license)
    },
    "riot": function () {
      return plug.injectString.prepend(opts.inject.riot)
    },
    "tag": {
      "above": function (folder) {
        return plug.injectString.prepend(
          `<${folder.split(".").shift()}>\n`)
      },
      "below": function (folder) {
        return plug.injectString.append(`</${folder.split(".").shift()}>`)
      }
    }
  }
}

// -- pipe ------------------------------------------------------------------

const pipe = {
  "css": function (tag) {
    return plug.lazypipe()
      .pipe(task.tidy.css)
      .pipe(task.lint.css)
      .pipe(task.indent, tag)
      .pipe(task.minify.css, MIN)
      .pipe(function () {
        return plug.gulpIf(tag, task.wrap.above(!MIN))
      })
      .pipe(function () {
        return plug.gulpIf(tag, task.wrap.css())
      })
      .pipe(function () {
        return plug.gulpIf(tag, task.wrap.below(!MIN))
      })
      .pipe(task.indent, tag)
  },
  "es6": function () {
    return plug.lazypipe()
      .pipe(task.tidy.lines)
      .pipe(task.tidy.es6)
      .pipe(task.lint.es6)
  },
  "html": function (tag) {
    return plug.lazypipe()
      .pipe(task.rename.html)
      .pipe(task.tidy.html)
      .pipe(task.lint.html, !tag)
      .pipe(task.minify.html)
      .pipe(task.indent, tag)
  },
  "js": function (tag) {
    return plug.lazypipe()
      .pipe(task.tidy.es6)
      .pipe(task.rename.js)
      .pipe(task.indent, tag)
      .pipe(task.minify.js, MIN)
      .pipe(function () {
        return plug.gulpIf(tag, task.wrap.above(!MIN))
      })
      .pipe(function () {
        return plug.gulpIf(tag, task.wrap.js())
      })
      .pipe(function () {
        return plug.gulpIf(tag, task.wrap.below(!MIN))
      })
      .pipe(task.indent, tag)
  },
  "riot": function (dir) {
    return plug.lazypipe()
      .pipe(task.concat, dir[3])
      .pipe(task.rename.dir, dir[2])
      .pipe(task.wrap.below, MIN)
      .pipe(task.wrap.tag.above, dir[3])
      .pipe(task.wrap.tag.below, dir[3])
      .pipe(plug.gulpIf, !WPK, task.compile.riot())
      .pipe(plug.gulpIf, !WPK, task.minify.js(true))
      .pipe(plug.gulpIf, !WPK, task.wrap.riot())
      .pipe(plug.gulpIf, !WPK, task.wrap.license())
  },
  "sass": function () {
    return plug.lazypipe()
      .pipe(task.tidy.lines)
      .pipe(task.tidy.sass)
      .pipe(task.lint.sass)
  },
  "slim": function () {
    return plug.lazypipe()
      .pipe(task.tidy.lines)
      .pipe(task.lint.slim)
  },
  "svg": function (tag) {
    return plug.lazypipe()
      .pipe(task.tidy.html)
      .pipe(task.minify.svg)
      .pipe(task.indent, tag)
  },
  "webpack": function () {
    return plug.lazypipe()
      .pipe(task.compile.webpack)
  }
}

// -- gulp ------------------------------------------------------------------

gulp.task("build", gulp.series(
  function del (done) {
    plug.del.sync(path.join(TMP, "*"))
    done()
  },
  function riot (done) {
    return task.each.folder(SRC, SRC, opts.ext.riot)
      .map(function (dir) {
        return plug.streamqueue({
          "objectMode": true
        },
            gulp.src(path.join(dir[0], opts.ext.slim))
            .pipe(task.compile.slim())
            .pipe(pipe.html(true)()),
            gulp.src(path.join(dir[0], opts.ext.svg))
            .pipe(pipe.svg(true)()),
            gulp.src(path.join(dir[0], opts.ext.sass))
            .pipe(task.compile.sass())
            .pipe(pipe.css(true)()),
            gulp.src(path.join(dir[0], opts.ext.es6))
            .pipe(task.compile.es6())
            .pipe(pipe.js(true)())
          )
          .pipe(pipe.riot(dir)())
          .pipe(task.save.tmp())
          .on("end", function () {
            done()
          })
      })
  },
  function assets () {
    return plug.streamqueue({
      "objectMode": true
    },
        gulp.src([path.join(opts.path.src, opts.ext.svg), opts.path.exclude])
        .pipe(pipe.svg(false)()),
        gulp.src([path.join(opts.path.src, opts.ext.sass), opts.path.exclude])
        .pipe(task.compile.sass())
        .pipe(pipe.css(false)()),
        gulp.src([path.join(opts.path.src, opts.ext.es6), opts.path.exclude])
        .pipe(task.compile.es6())
        .pipe(pipe.js(false)())
      )
      .pipe(task.save.tmp())
  },
  function webpack () {
    return gulp.src(path.join(TMP, "js", "index.js"))
      .pipe(pipe.webpack()())
      .pipe(task.save.tmp())
  }
))

gulp.task("check", gulp.series(
  function slim (done) {
    gulp.src(path.join(opts.path.src, opts.ext.slim), {
      "since": gulp.lastRun("check")
    })
      .pipe(plug.changedInPlace(opts.changedInPlace))
      .pipe(pipe.slim()())
      .pipe(task.save.src())
    done()
  },
  function sass (done) {
    gulp.src(path.join(opts.path.src, opts.ext.sass), {
      "since": gulp.lastRun("check")
    })
      .pipe(plug.changedInPlace(opts.changedInPlace))
      .pipe(pipe.sass()())
      .pipe(task.save.src())
      .pipe(task.compile.sass())
      .pipe(pipe.css()())
    done()
  },
  function es6 (done) {
    gulp.src(path.join(opts.path.src, opts.ext.es6), {
      "since": gulp.lastRun("check")
    })
      .pipe(plug.changedInPlace(opts.changedInPlace))
      .pipe(pipe.es6()())
      .pipe(task.save.src())
    done()
  }
))

gulp.task("default", gulp.series("check", function watch (done) {
  plug.browserSync.init({
    "files": opts.path.out,
    "https": {
      "cert": "localhost.crt",
      "key": "localhost.key"
    },
    "logConnections": true,
    "notify": false,
    "open": false,
    "reloadDebounce": 100,
    "reloadOnRestart": true,
    "server": {
      "baseDir": OUT,
      "index": `index.${EXT}`
    },
    "snippetOptions": {
      "rule": {
        "match": /qqq/
      }
    },
    "ui": false
  }, function () {
    gulp.watch(opts.restart.files, task.restart)
    gulp.watch(opts.path.src, gulp.series("check", task.build))
    task.tail.log()
    done()
  })
}))
