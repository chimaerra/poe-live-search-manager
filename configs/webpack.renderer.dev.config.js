const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const { spawn } = require("child_process");

const revision = require("child_process")
  .execSync(
    "git describe --tags --exact-match 2> /dev/null || git describe --always"
  )
  .toString();

const baseWebpackConfigurations = require("./webpack.base.config");

const port = process.env.PORT || 3001;

module.exports = merge(baseWebpackConfigurations, {
  // => @babel/polyfill https://stackoverflow.com/a/33527883/9599137
  entry: ["@babel/polyfill", path.resolve("app", "renderer", "index.js")],
  output: {
    publicPath: `http://localhost:${port}/dist/`,
    filename: "renderer.dev.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|gif|svg|ico)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
            },
          },
        ],
      },
    ],
  },
  target: "electron-renderer",
  plugins: [
    new webpack.DefinePlugin({
      "process.env.REVISION": JSON.stringify(revision),
    }),
  ],
  devServer: {
    port,
    publicPath: `http://localhost:${port}/dist`,
    before() {
      spawn("npm", ["run", "dev:main"], {
        shell: true,
        env: process.env,
        stdio: "inherit",
      })
        .on("close", code => process.exit(code))
        // eslint-disable-next-line no-console
        .on("error", spawnError => console.error(spawnError));
    },
  },
});
