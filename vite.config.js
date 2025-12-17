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
      name: 'DateWeekRange',
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
      output: {
        globals: {
          vue: 'Vue'
        },
        exports: 'named'
      }
    },
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild' // 使用 esbuild 压缩，比 terser 更快
  } : {
    outDir: resolve(__dirname, 'dist-example'),
    emptyOutDir: true
  },
  server: {
    port: 8090,
    open: true,
    host: true
  }
})

