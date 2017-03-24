/* global module:false require:true */
/* eslint global-require: 0  max-len: 0*/

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'

 const path = require("path");
// const webpack = require("webpack");

module.exports = function (grunt) {
    // Auto load grunt tasks in package.json
    require("load-grunt-tasks")(grunt);
    const pkg = grunt.file.readJSON("package.json");
    const today = new Date();
    const paths = {
        app: "app",
        css: "dist/css",
        dist: path.join(__dirname, "dist"),
        less: "less",
        modules: "modules",
        public: "public",
        reports: "reports",
        test: "__test__",
        tmp: "tmp",
        vendor: "vendor"
    };
    const banner = {
        today: `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`,
        author: pkg.author || "",
        title: pkg.name || pkg.title || "",
        version: `${pkg.version || "0.0.1"}.${today.valueOf()}`,
        homepage: "http://www.johnneed.com/"
    };
    const cleanCssOptions = {
        advanced: true, // set to false to disable advanced optimizations  - selector & property merging, reduction, etc.
        aggressiveMerging: false, // set to false to disable aggressive merging of properties.
        benchmark: false, // turns on benchmarking mode measuring time spent on cleaning up (run npm run bench to see example)
        compatibility: false, // enables compatibility mode, see below for more examples
        debug: false, // set to true to get minification statistics under stats property (see test/custom-test.js for examples)
        inliner: {}, // a hash of options for @import inliner, see test/protocol-imports-test.js for examples, or this comment for a proxy use case.
        keepBreaks: false, // whether to keep line breaks (default is false)
        keepSpecialComments: 0, // * for keeping all (default), 1 for keeping first one only, 0 for removing all
        mediaMerging: true, // whether to merge @media at-rules (default is true)
        processImport: false, // whether to process @import rules
        processImportFrom: ["all"], // a list of @import rules, can be ['all'] (default), ['local'], ['remote'], or a blacklisted path e.g. ['!fonts.googleapis.com']
        rebase: false, // set to false to skip URL rebasing
        relativeTo: null, // path to resolve relative @import rules and URLs
        restructuring: false, // set to false to disable restructuring in advanced optimizations
        root: null, // path to resolve absolute @import rules and rebase relative URLs
        roundingPrecision: -1, // rounding precision; defaults to 2; -1 disables rounding
        semanticMerging: false, // set to true to enable semantic merging mode which assumes BEM-like content (default is false as it's highly likely this will break your stylesheets - use with caution!)
        shorthandCompacting: true, // set to false to skip shorthand compacting (default is true unless sourceMap is set when it's false)
        sourceMap: false, // exposes source map under sourceMap property, e.g. new CleanCSS().minify(source).sourceMap (default is false) If input styles are a product of CSS preprocessor (Less, Sass) an input source map can be passed as a string.
        sourceMapInlineSources: false, // set to true to inline sources inside a source map's sourcesContent field (defaults to false) It is also required to process inlined sources from input source maps.
        target: null // path to a folder or an output file to which rebase all URLs
    };
    const uglifyOptions = {
        ASCIIOnly: false, // Type: Boolean - Default: false - Enables to encode non -ASCII characters as \uXXXX.
        banner: `/*!\n * ${banner.title}\n * v${banner.version} \n * ©${banner.today} \n * ${banner.homepage || ""} \n*/\n`, // Type: String - Default: '' - This string will be prepended to the minified output. Template strings (e.g. <%= config.value %> will be expanded automatically.
        beautify: false, // Type: Boolean Object - Default: false - Turns on beautification of the generated source code. An Object will be merged and passed with the options sent to UglifyJS.OutputStream(). View all options here
        compress: {}, // Type: Boolean Object - Default: {} Turn on or off source compression with default options. If an Object is specified, it is passed as options to UglifyJS.Compressor().
        enclose: null, // Type: Object - Default: undefined - Wrap all of the code in a closure with a configurable arguments/parameters list. Each key -value pair in the enclose object is effectively an argument -parameter pair.
        exceptionsFiles: [], //  Type: Array - Default: [] - Use this with mangleProperties to pass one or more JSON files containing a list of variables and object properties that should not be mangled. See the UglifyJS docs for more info on the file syntax.
        exportAll: false, // Type: Boolean - Default: false - When using wrap this will make all global functions and variables available via the export variable.
        expression: false, // Type: Boolean - Default: false Parse a single expression, rather than a program (for parsing JSON)
        footer: "", // Type: String - Default: '' - This string will be appended to the minified output. Template strings (e.g. <%= config.value %> will be expanded automatically.
        mangle: {}, // Type Boolean. Default: {} Turn on or off mangling with default options. If an Object is specified, it is passed directly to ast.mangle_names() and ast.compute_char_frequency() (mimicking command line behavior). View all options here.
        mangleProperties: false, // Type: Boolean - Default: false - Use this flag to turn on object property name mangling.
        maxLineLen: 32000, // Type: Number - Default: 32000 - Limit the line length in symbols. Pass maxLineLen = 0 to disable this safety feature.
        nameCache: "", // Type:String - Default: '' - A string that is a path to a JSON cache file that uglify will create and use to coordinate symbol mangling between multiple runs of uglify. Note: this generated file uses the same JSON format as the exceptionsFiles files.
        preserveComments: false, // Type: Boolean String Function - Default: undefined - Options: false 'all' 'some' Turn on preservation of comments.false will strip all comments 'all' will preserve all comments in code blocks that have not been squashed or dropped 'some' will preserve all comments that start with a bang (!) or include a closure compiler style directive (@preserve @license @cc_on) Function specify your own comment preservation function. You will be passed the current node and the current comment and are expected to return either true or false
        report: "min", // Choices: 'min', 'gzip' - Default: 'min' - Either report only minification result or report minification and gzip results. This is useful to see exactly how well clean -css is performing but using 'gzip' will make the task take 5 -10x longer to complete. Example output.
        preserveDOMProperties: false, // Type: Boolean - Default: false - Use this flag in conjunction with mangleProperties to prevent built -in browser object properties from being mangled.
        quoteStyle: 0, // Type: //Type: Integer - Default: 0 - Preserve or enforce quotation mark style. 0 will use single or double quotes such as to minimize the number of bytes (prefers double quotes when both will do) 1 will always use single quotes, 2 will always use double quotes, 3 will preserve original quotation marks
        screwIE8: true, // Type: Boolean - Default: false - Pass this flag if you don't care about full compliance with Internet Explorer 6 -8 quirks.
        sourceMap: false, // Type: Boolean - Default: false - If true, a source map file will be generated in the same directory as the dest file. By default it will have the same basename as the dest file, but with a .map extension.
        sourceMapIn: null, // Type: String Function - Default: undefined - The location of an input source map from an earlier compilation, e.g. from CoffeeScript. If a function is provided, the uglify source is passed as the argument and the return value will be used as the sourceMap name. This only makes sense when there's one source file.
        sourceMapIncludeSources: false, // Type: Boolean - Default: false - Pass this flag if you want to include the content of source files in the source map as sourcesContent property.
        sourceMapName: null, // Type: String Function - Default: undefined - To customize the name or location of the generated source map, pass a string to indicate where to write the source map to. If a function is provided, the uglify destination is passed as the argument and the return value will be used as the file name.
        sourceMapRoot: null, // Type: String - Default: undefined With this option you can customize root URL that browser will use when looking for sources. If the sources are not absolute URLs after prepending of the sourceMapRoot, the sources are resolved relative to the source map.
        wrap: null // Type: String - Default: undefined - Wrap all of the code in a closure, an easy way to make sure nothing is leaking. For variables that need to be public exports and global variables are made available. The value of wrap is the global variable exports will be available as.
    };
    // Project configuration.
    grunt.initConfig({
        // Metadata.
        paths,
        // Task configuration.
        browserSync: {
            bsFiles: {
                src: ["<%= paths.dist %>/css/*.css", "<%= paths.dist %>/**/*.js", "<%= paths.dist %>/**/*.html"]
            },
            options: {
                watchTask: true,
                server: {
                    baseDir: "<%= paths.dist %>/"
                }
            }
        },
        clean: {
            dist: {
                src: ["<%= paths.tmp %>/*", "<%= paths.dist %>/*"]
            }
        },
        concat: {
            options: {
                banner: "<%= banner %>",
                stripBanners: true
            },
            dist: {
                src: ["<%= paths.tmp %>/*.js"],
                dest: "dist/<%= pkg.name %>.js"
            }
        },
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: "public",
                        src: ["**/*"],
                        dest: "<%= paths.dist %>/"
                    }
                ]
            }

        },
        eslint: {
            app: {
                options: {
                    // configFile: "eslintconfigs/standard.json"
                },
                src: ["<%= paths.app %>/**/*.js", "<%= paths.src %>/**/*.jsx"]
            },
            gruntfile: {
                options: {
                    // configFile: "eslintconfigs/jasmine.json"
                },
                src: ["Gruntfile.js"]
            }
        },
        less: {
            dev: {
                options: {
                    // paths: [npm "assets/css"]
                },
                files: {
                    "<%= paths.css %>/main.css": "<%= paths.less %>/main.less"
                }
            }
        },
        watch: {
            app: {
                files: "<%= paths.app %>/**/*.jsx",
                tasks: ["webpack:dev"]
            },
            styles: {
                files: "<%= paths.less %>/**/*.less",
                tasks: ["less:dev"]
            }

        },
        webpack: {
            dev: {
                // webpack options
                //  devtool: 'cheap-module-eval-source-map',
                entry: ["./<%= paths.app %>/state-machine.js"],
                failOnError: true, // don't report error to grunt if webpack find errors
                // Use this if webpack errors are tolerable and grunt should continue
                // hot: true, // adds the HotModuleReplacementPlugin and switch the server to hot mode
                // Use this in combination with the inline option
                inline: true,  // embed the webpack-dev-server runtime into the bundle
                // Defaults to false

                keepalive: false, // don't finish the grunt task
                // Use this in combination with the watch option
                module: {
                    rules: [
                        // required to write "require('./style.css')"
                        {test: /\.css$/, loader: "style-loader!css-loader"},
                        {
                            test: /\.js$/,
                            loader: "babel-loader",
                            exclude: /node_modules/,
                            query: {
                                cacheDirectory: true,
                                presets: ["latest", "stage-0", "react"]
                            }
                        }
                    ]
                },
                output: {
                    path: "<%= paths.dist %>",
                    publicPath: "/dist/",
                    filename: `js/${pkg.name}.js`
                },
                plugins: [
                    // new webpack.optimize.OccurenceOrderPlugin(),
                    // new webpack.NoErrorsPlugin()
                ],
                resolve: {
                    extensions: [".js", ".jsx"]
                },
                stats: {
                    // Configure the console output
                    colors: false,
                    modules: true,
                    reasons: true
                },
                // stats: false disables the stats output

                storeStatsTo: "xyz", // writes the status to a variable named xyz
                // you may use it later in grunt i.e. <%= xyz.hash %>

                progress: false, // Don't show progress
                // Defaults to true

                watch: false // use webpack's watcher
                // You need to keep the grunt process alive

            },
        }
    });
    // Default task.
    grunt.registerTask("default", ["clean:dist", "copy:dist", "webpack:dev", "browserSync", "watch"]);
    grunt.registerTask("dev-build", ["clean:dist", "copy:dist", "less:dev", "webpack:dev"]);
};
