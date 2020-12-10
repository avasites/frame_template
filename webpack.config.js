const path = require('path');
const fs = require("fs");
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

function generateHtmlPlugins(templateDir) {
    let result = [];
  
    helper(templateDir);
  
    function helper (templateDir, nameFolder = '') {
      const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
      templateFiles.map(item => {
        const parts = item.split(".");
        const name = parts[0];
        if (parts[1]) {
          const extension = parts[1];
          result.push(new HtmlWebpackPlugin({
            filename: `${nameFolder}${name}.html`,
            template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
            inject: false
          }));
        } else {
          helper(`${templateDir}/${name}`, `${nameFolder}${name}/`);
        }
      });
    }
  
    return result;
  }
  
const htmlPlugins = generateHtmlPlugins("./src/html/views");

module.exports = {
    entry: './src/index.js',
    devtool: "source-map",
    output: {
        publicPath: '',
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/bundle.js'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
              {
                from: './src/img',
                to: '../img'
              }
            ],
        }),
        new MiniCssExtractPlugin({
            filename: './css/main.css',
        }),
    ].concat(htmlPlugins),
    module: {
        rules: [
            {
            test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                    loader: 'file-loader', // Or `url-loader` or your other loader
                    },
                ],
            },
            // JavaScript: Use Babel to transpile JavaScript files
            {
                test: /\.js$/, 
                exclude: /node_modules/, 
                use: ['babel-loader']
            },
    
            // Styles: Inject CSS into the head with source maps
            {
            test: /\.(scss|css)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {loader: 'css-loader', options: {sourceMap: true, importLoaders: 1}},
                    {loader: 'postcss-loader', options: {sourceMap: true}},
                    {loader: 'sass-loader', options: {sourceMap: true}},
                ],
            },
            {
              test: /\.html$/,
              include: path.resolve(__dirname, "src/html/includes"),
              use: ["raw-loader"]
            }      
        ]
    }
  };