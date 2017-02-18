const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const env = require('yargs').argv.env.mode;
const target = require('yargs').argv.env.target;

const UglifyPlugin = webpack.optimize.UglifyJsPlugin;
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

const HtmlWebpackPlugin = require('html-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackOnBuildPlugin = require('on-build-webpack');

const nodeModulesDir = path.resolve(__dirname, './node_modules');

let outputFile = `.bundle`;
let outputPath;

const plugins = [];
const nodeModules = {};
const config = {
  entry_point: 'http://localhost:8999',
  app_id: 'healthy-weight',
}

// uglify
if (env === 'production') {
  plugins.push(new UglifyPlugin({
    output: {
      comments: false,
    },
    minimize: true,
    sourceMap: false,
    compress: {
      warnings: false,
    }
  }));
  outputFile = `${outputFile}.min.js`;
  outputPath = `${__dirname}/dist/`;
} else {
  outputFile = `${outputFile}.js`;
  outputPath = `${__dirname}/dist/`;
  devtool = 'source-map';
}

// livereload
plugins.push(new BrowserSyncPlugin({
  proxy: {
    target: config.entry_point,
  },
  port: 9000,
  open: false,
}, {
  reload: false,
}));

plugins.push(new CopyWebpackPlugin([{
  from: './app/favicon.ico',
  to: 'favicon.ico',
}]));

// healthy-weight
plugins.push(new HtmlWebpackPlugin({
  template: './app/index.html',
  inject: 'body',
  chunks: ['vendors', 'app', 'style'],
  hash: true,
}));

// launch
plugins.push(new HtmlWebpackPlugin({
  template: './app/launch/index.html',
  filename: 'launch/index.html',
  inject: 'body',
  chunks: ['vendors', 'launch', 'launchStyle'],
  hash: true,
}));

const webpackConfig = {
  entry: {
    app: `${__dirname}/app/healthy-weight.js`,
    style: `${__dirname}/app/healthy-weight.css`,
    launch: `${__dirname}/app/launch/launch.js`,
    launchStyle: `${__dirname}/app/launch/launch.css`,
    vendors: `${__dirname}/app/vendors.js`,
  },
  output: {
    path: outputPath,
    filename: '[name]' + outputFile,
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets: ['es2015'],
        cacheDirectory: true
      }
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.(png|jpg|jpeg|gif|svg)$/,
      loader: 'url'
    }, {
      test: /\.html$/,
      loader: 'html-loader'
    }, {
      test: [/MaterialIcons-Regular.eot/, /MaterialIcons-Regular.woff2/, /MaterialIcons-Regular.woff/, /MaterialIcons-Regular.ttf/],
      loader: 'file?name=fonts/[name].[ext]'
    }],
  },
  resolve: {
    extensions: ['.js', '.css', '.html'],
  },
  plugins,
  externals: nodeModules,
  devServer: {
    inline: true,
  },
}

module.exports = webpackConfig;
