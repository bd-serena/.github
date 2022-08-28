const FileManagerPlugin = require('filemanager-webpack-plugin')
const publicUrl = process.env.VUE_APP_TITLE === 'preview' ? './' : '/dataeleph/';
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const productionGzipExtensions = ["js", "css", "png"];

module.exports = {
  //  部署应用的基本url  可用 process.env.VUE_APP_TITLE 环境变量控制
  publicPath: publicUrl,
  //  指定生产环境目录
  outputDir: ['preview', 'mobile'].includes(process.env.VUE_APP_TITLE) ? `${process.env.VUE_APP_TITLE}dist` : 'dist',
  //  指定生成静态资源的生成目录
  assetsDir: 'assets',
  //  指定生成的index.html的输出名
  indexPath: 'index.html',
  //  生成静态资源文件名包含hash以更好的控制缓存
  filenameHashing: true,
  //  是否在开发环境下通过 eslint-loader 在每次保存时 lint 代码。这个值会在 @vue/cli-plugin-eslint 被安装之后生效
  lintOnSave: false,
  // webpack配置
  // see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
  //  是一个函数，会接收一个基于 webpack-chain 的 ChainableConfig 实例。允许对内部的 webpack 配置进行更细粒度的修改。
  chainWebpack: (config) => { //  配置插件
    // config.module
    //   .rule('images')
    //   .use('image-webpack-loader')
    //   .loader('image-webpack-loader')
    // 指定环境打包js路径
    if (process.env.VUE_APP_TITLE === 'preview') {
      config.plugin('fileManager').use(FileManagerPlugin).tap(c => {
        c[0] = {}
        c[0].onEnd = {}
        return c
      })
    } else {
      config.plugin('fileManager').use(FileManagerPlugin).tap(c => {
        c[0] = {}
        c[0].onEnd = {
          mkdir: [
            './dataeleph/dataeleph'
          ],
          copy: [{
            source: './dist/',
            destination: './dataeleph/dataeleph'
          }],
          archive: [{
            source: './dataeleph',
            destination: './dist/dataeleph-all.tar.gz',
            format: 'tar',
            options: {
              gzip: true,
              gzipOptions: {
                level: 1
              },
              globOptions: {
                nomount: true
              }
            }
          }],
          delete: [
            './dataeleph'
          ]
        }
        return c
      });
    }
  },
  //  这个值是一个对象，则会通过 webpack-merge 合并到最终的配置中。
  configureWebpack: {
    resolve: {
      extensions: ['.js', '.vue', '.json', '.css', '.ts'],
      alias: { // 配置快捷路径
        '@views': '@/views',
        '@component': '@/components'
      }
    },
    performance: {
      hints: false
    },
    plugins: [
      new CompressionWebpackPlugin({
        filename: "[path].gz[query]", // 提示compression-webpack-plugin@3.0.0的话asset改为filename
        algorithm: "gzip",
        test: new RegExp("\\.(" + productionGzipExtensions.join("|") + ")$"),
        threshold: 10240,
        minRatio: 0.8
      })
    ]
  },
  //  是否使用包含运行时编译器的 Vue 构建版本
  //  设置为 true 后你就可以在 Vue 组件中使用 template 选项了，但是这会让你的应用额外增加 10kb 左右。
  runtimeCompiler: false,
  //  如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
  productionSourceMap: false,
  css: {
    //  是否将组件中的 CSS 提取至一个独立的 CSS 文件中 (而不是动态注入到 JavaScript 中的 inline 代码)。
    extract: process.env.NODE_ENV === 'production' ? false : true,
    // 开启 CSS source maps?
    sourceMap: false,
    // css预设器配置项
    loaderOptions: {
      less: {
        test: /\.less$/,
        loader: 'style-loader!css-loader!less-loader'
      },
      stylus: {
        'resolve url': true,
        'import': []
      }
    },
    // 启用 CSS modules for all css / pre-processor files.
    modules: false
  },
  // use thread-loader for babel & TS in production build
  // enabled by default if the machine has more than 1 cores
  parallel: require('os').cpus().length > 1,
  //  向 PWA 插件传递选项。
  pwa: {},
  //  这是一个不进行任何 schema 验证的对象，因此它可以用来传递任何第三方插件选项
  pluginOptions: {
    'cube-ui': {
      postCompile: false,
      theme: false
    }
  },
  //  开发服务配置
  devServer: {
    port: '3030',
    open: false,
    host: '0.0.0.0',
    https: false,
    hotOnly: false,
    disableHostCheck: true,
    stats: {
      //去掉mini-css-extract-plugin莫名其妙的报warning
      children: false,
      warningsFilter: (warning) => /Conflicting order between/gm.test(warning)
    },
    proxy: {
      '/edc-pub-system-ms': {
        target: 'http://10.1.8.6:15101/edc-pub-system-ms',
        ws: true,
        changOrigin: true, // 跨域
        pathRewrite: {
          '^/edc-pub-system-ms': '/'
        }
      },
      '/edc-dataasset-svc-ms': {
        target: 'http://10.1.8.6:12005/edc-dataasset-svc-ms',
        ws: true,
        changOrigin: true, // 跨域
        pathRewrite: {
          '^/edc-dataasset-svc-ms': '/'
        }
      },
      '/edc-dgw-ms': {
        target: 'http://10.1.8.6:15301/edc-dgw-ms',
        ws: true,
        changOrigin: true, // 跨域
        pathRewrite: {
          '^/edc-dgw-ms': '/'
        }
      },
      '/nl-edc-cct-sys-ms': {
        target: 'http://10.1.8.6:12001/nl-edc-cct-sys-ms',
        ws: true,
        changOrigin: true, // 跨域
        pathRewrite: {
          '^/nl-edc-cct-sys-ms': '/'
        }
      },
      '/render-engine': {
        target: 'http://10.1.8.6:18001/render-engine',
        ws: true,
        changOrigin: true, // 跨域
        pathRewrite: {
          '^/render-engine': '/'
        }
      },
      '/edc-visualtool-localdb': {
        target: 'http://10.1.8.6:23000/edc-visualtool-localdb',
        ws: true,
        changOrigin: true, // 跨域
        pathRewrite: {
          '^/edc-visualtool-localdb': '/'
        }
      },
      '/edc-pub-metainfo-ms': {
        target: 'http://10.1.8.6:15201/edc-pub-metainfo-ms',
        ws: true,
        changOrigin: true, // 跨域
        pathRewrite: {
          '^/edc-pub-metainfo-ms': '/'
        }
      },
    },
    overlay: {
      warnings: true,
      errors: true
    }
  }
}
