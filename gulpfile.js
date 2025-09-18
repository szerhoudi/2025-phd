const yargs = require("yargs");
const gulp = require("gulp");
const connect = require("gulp-connect");
const exec = require("gulp-exec");

const root = yargs.argv.root || ".";
const port = yargs.argv.port || 8101;
const lrport = yargs.argv.port || 35729;
const host = yargs.argv.host || "0.0.0.0";

function _compile_latex(glob) {
  var options = {
    continueOnError: true,
    pipeStdout: false,
  };
  var reportOptions = {
    err: true,
    stderr: true,
    stdout: false,
  };
  return gulp
    .src(glob)
    .pipe(
      exec(
        (file) =>
          `latexmk -xelatex -interaction=nonstopmode -cd -bibtex- -pdf "${file.path}"`,
        options
      )
    )
    .pipe(
      exec(
        (file) =>
          `pdf2svg "${file.path.slice(0, -4)}.pdf" "${file.path.slice(
            0,
            -4
          )}_out.svg"`,
        options
      )
    )
    .pipe(exec((file) => `latexmk -cd -C "${file.path}"`, options))
    .pipe(exec.reporter(reportOptions));
}

gulp.task("compile_latex", () => {
  return _compile_latex(["img/**/*.tex", "!img/**/_*.tex"]);
});

gulp.task("serve", () => {
  connect.server({
    root: root,
    port: port,
    host: host,
    livereload: { port: lrport },
  });

  // we need to use polling when running inside docker
  gulp
    .watch(["img/**/*.tex", "!img/**/_*.tex"], { usePolling: true })
    .on("change", (path) => _compile_latex(path).pipe(connect.reload()));
  gulp
    .watch(["./**/*.html", "./**/*.md", "./**/*.css"], { usePolling: true })
    .on("change", (path) => gulp.src(path).pipe(connect.reload()));
});
