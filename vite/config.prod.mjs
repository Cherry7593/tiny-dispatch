// Adapted from google/web-game-samples/phaser (MIT), see THIRD_PARTY_NOTICES.md.
// Changed: dual offline/Playables builds; SDK injection; no sample promotion plugin.
import { defineConfig } from 'vite';
export default defineConfig(({ mode }) => ({
  base: './',
  build: {
    outDir: mode === 'playables' ? 'dist-playables' : 'dist',
    rollupOptions: { output: { manualChunks: { phaser: ['phaser'] } } },
    minify: 'terser',
    terserOptions: { compress: { passes: 2 }, mangle: true, format: { comments: false } },
  },
  plugins: [{ name: 'playables-entry', transformIndexHtml: {
    order: 'post', handler(html) {
      return mode === 'playables' ? html.replace('<head>', '<head>\n<script src="https://www.youtube.com/game_api/v1"></script>') : html;
    },
  } }],
}));
