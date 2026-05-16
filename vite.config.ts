import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Change '/wikipedia-race/' to match your GitHub repo name if deploying to GitHub Pages
  // Remove this line entirely when deploying to Vercel/Netlify
  base: process.env.GITHUB_PAGES ? '/wikipedia-race/' : '/',
})
