const path = require('path')
var webpack = require('webpack')

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
process.env.EMVE_PORT = process.env.EMVE_PORT || 9001

const config = function (mode) {
    let conf = {
        mode: mode,
        entry: ['./src/index.js'],
        module: {
          rules: [
              {
                  test: /\.js$/,
                  exclude: /(node_modules|bower_components)/,
                  use: {
                      loader: 'babel-loader',
                      options: {
                        presets: ["babel-preset-es2015"].map(require.resolve)
                      },
                  }
              },
              {
                  test: /\.html$/,
                  exclude: /(node_modules|bower_components)/,
                  use: {
                      loader: 'html-loader',
                      options: {}
                  }
              },
              {
                test: /\.[s]?css$/,
                use: [
                  'style-loader',
                  {
                    loader: 'css-loader',
                    options: {
                      sourceMap: true,
                    }
                  },
                  { loader: 'sass-loader', options: { sourceMap: true } }
                ],

              }
          ]
        },
        output: {
            path: path.resolve(__dirname, 'public/'),
            filename: 'bundle.js',
            publicPath: '/',
        },
        plugins: [
            new webpack.ProvidePlugin({
                $: "jquery"
            }),
        ],
        devServer: {
            watchOptions: {
                ignored: /node_modules/
            },
            contentBase: 'public',
            watchContentBase: true,
            compress: true,
            hot: true,
            port: process.env.EMVE_PORT
        }
    }

    if (mode === 'development') {
        conf.plugins.push(new webpack.HotModuleReplacementPlugin());
        conf.plugins.push(new webpack.NoEmitOnErrorsPlugin());
        //conf.plugins.push(new MiniCssExtractPlugin({
        //  filename: "[name].css",
        //  chunkFilename: "[id].css"
        //}))
    }

    return conf
}

module.exports = config(process.env.NODE_ENV)
