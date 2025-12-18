import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
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
    createVuePlugin()
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.vue'],
    alias: {
      '@': resolve(__dirname, 'src')
    },
    dedupe: ['vue']
  },
  build: isLib ? {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'WeekRangePicker',
      formats: ['es', 'umd', 'cjs'],
      fileName: format => `${pkg.name}.${format}.js`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue', // 外部依赖映射
        },
      },
    },
    outDir: 'dist',
    sourcemap: true,
    // 确保所有依赖都被打包，除了 vue
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
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

