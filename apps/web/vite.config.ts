import { defineConfig } from 'vite';

export default defineConfig({
  base: '/corg-of-the-dead/',
  plugins: [
    {
      name: "full-reload-on-any-change",
      handleHotUpdate({ server }) {
        server.ws.send({
          type: "full-reload",
        });
      },
    },
  ],
});
