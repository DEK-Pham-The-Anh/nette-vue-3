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
        manifest: false,
        // outDir: "www/vue-development/src",
        assetsDir: '.',
        emptyOutDir: false,
        rollupOptions: {
            input: "www/vue-development/app/todo-app/index.js",
            output: {
                dir: "www/vue-development/src",
                name: 'todo-app'
            }
        }
    }
}