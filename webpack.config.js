const path = require('path');
const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    // These names MUST match the folder name within app/src so that the JS bundle doesn't end up in
    // a different directory from the files copied by file-loader
    home: path.join(__dirname, 'app/src/home'),
    404: path.join(__dirname, 'app/src/404'),
    products: path.join(__dirname, 'app/src/products'),
  },

  module: {
    loaders: [
      // SASS files
      {
        test: /\.sass$/,
        loader: ExtractTextWebpackPlugin.extract(['css-loader', 'postcss-loader', 'sass-loader']),
      },
      // CSS files
      {
        test: /\.css$/,
        loader: ExtractTextWebpackPlugin.extract(['css-loader', 'postcss-loader']),
      },
      // JavaScript files
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: { presets: ['es2015'] },
      },
      // Pug files
      {
        test: /\.pug$/,
        loaders: [
          'file-loader?name=[path][name].html&context=app/src',
          'pug-html-loader?exports=false',
        ],
      },
      // HTML files
      {
        test: /\.html$/,
        loaders: [
          'file-loader?name=[path][name].html&context=app/src',
          'extract-loader',
          'html-loader',
        ],
      },
      // Files that require no compilation or processing
      {
        test: /\.(ttf|woff|woff2|eot|png|svg)/,
        loader: 'url-loader',
        query: { limit: 10000, name: '[path][name].[ext]', context: 'app/src' },
      },
    ],
  },

  output: {
    path: path.join(__dirname, 'app/build'),
    publicPath: '/',
    filename: '[name]/index.js',
  },

  plugins: [
    new CopyWebpackPlugin([{ from: 'app/favicons' }]),
    new ExtractTextWebpackPlugin('[name]/style.css'),
  ],


  // --------------------------------------------------------------------------


  devServer: {
    contentBase: path.join(__dirname, 'app/build'),
  },
};

// Custom settings for production
// detected when building in a path that begins with '/var/www'
if (__dirname.startsWith('/var/www')) {
  console.log('Production detected');
  module.exports.plugins = module.exports.plugins.concat([
    // Minify JS
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compress: {
        warnings: false,
      },
    }),
    // Let all loaders know they can minimize output
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
  ]);
}

if (process.env.C9_HOSTNAME) {
  console.log('Detected Cloud9');
  console.log(`Preview at ${process.env.C9_HOSTNAME}/home`);
  module.exports.devServer.port = process.env.PORT;
  module.exports.devServer.host = process.env.IP;
}
