import path from "path";
import glob from "glob";

const { createVuePlugin } = require('vite-plugin-vue2');

const reload = {
    name: 'reload',
    handleHotUpdate({ file, server }) {
        if (file.endsWith(".php") || file.endsWith(".latte")) {
            server.ws.send({
                type: 'full-reload',
                path: '*',
            });
        }
    }
}

export default {
    plugins: [reload, createVuePlugin()],
    server: {
        watch: {
            usePolling: true
        }
    },
    build: {
        minify: true,
        manifest: true,
        assetsDir: '.',
        emptyOutDir: false,
        rollupOptions: {
            input:  glob.sync(path.resolve(__dirname, "www/vue-development/app/*/", "index.js")),
            output: {
                dir: "www/vue-development/src/"
            }
        }
    }
}