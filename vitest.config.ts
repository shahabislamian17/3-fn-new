import { defineConfig } from 'vitest/config'
import react from '@testing-library/react'
import path from 'path'
 
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
