import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { resolve, dirname } from 'path'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))

// 判断是否为库模式构建
const isLib = process.env.BUILD_MODE === 'lib'

export default defineConfig({
  root: isLib ? process.cwd() : resolve(__dirname, 'example'),
  publicDir: isLib ? false : resolve(__dirname, 'example/public'),
  plugins: [
    vue({
      target: 'browser',
      css: true,
    })
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.vue'],
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: isLib ? {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'WeekRangePicker',
      fileName: (format) => {
        if (format === 'es') {
          return `${pkg.name}.esm.js`
        }
        return `${pkg.name}.min.js`
      },
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['vue'],
      output: [
        {
          // ES 格式：保留命名导出
          format: 'es',
          exports: 'named'
        },
        {
          // UMD 格式：使用命名导出，但通过 footer 让全局变量直接指向默认导出
          format: 'umd',
          name: 'WeekRangePicker',
          globals: {
            vue: 'Vue'
          },
          exports: 'named',
          footer: 'if (typeof WeekRangePicker !== "undefined" && WeekRangePicker.default) { WeekRangePicker = WeekRangePicker.default; }'
        }
      ]
    },
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild'
  } : {
    outDir: resolve(__dirname, 'example/dist'),
    emptyOutDir: true
  },
  server: {
    port: 8090,
    open: '/index.html',
    host: true
  }
})

