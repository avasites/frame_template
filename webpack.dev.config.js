const fs = require("fs");
const path = require('path');
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')

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
  //...
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  },
  entry: './src/index.js',
    devtool: "source-map",
    cache: false,
    output: {
        publicPath: '/',
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/bundle.js'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: './css/main.css',
        }),
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1
        }),
        new ImageMinimizerPlugin({
          minimizerOptions: {
            // Lossless optimization with custom option
            // Feel free to experiment with options for better result for you
            plugins: [
              ['gifsicle', { interlaced: true }],
              ['jpegtran', { progressive: true }],
              ['optipng', { optimizationLevel: 5 }],
              [
                'svgo',
                {
                  plugins: [
                    {
                      removeViewBox: false,
                    },
                  ],
                },
              ],
            ],
          },
        }),
    ].concat(htmlPlugins),
    module: {
        rules: [
            {
            test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                      loader: 'file-loader',
                      options: {
                        name: '[name].[ext]',
                        context: '/img',
                        publicPath: (url, resourcePath, context) => {
                          if (/decoration/.test(resourcePath)) {
                            return `/${context}/decoration/${url}`;
                          }
        
                          return `${context}/${url}`;
                        },
                        outputPath: (url, resourcePath, context) => {        
                          return `../${context}/${url}`;
                        },
                      },
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
                    'style-loader',
                    {loader: 'css-loader', options: {sourceMap: true, importLoaders: 1}},
                    {
                      loader: 'postcss-loader', 
                      options: {
                        sourceMap: true,
                        postcssOptions: {
                          plugins: [
                            [
                              "autoprefixer",
                              {
                                // Options
                              },
                            ],
                          ],
                        },
                      }
                    },
                    {loader: 'sass-loader', options: {sourceMap: true}},
                ],
            },
            {
              test: /\.html$/,
              include: path.resolve(__dirname, "src/html/includes"),
              use: ["raw-loader"]
            }      
        ]
    },
    optimization: {
      minimize: true,
      minimizer: [new CssMinimizerPlugin(), "..."],
    },
};