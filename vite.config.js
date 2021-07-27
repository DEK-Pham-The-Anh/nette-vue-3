import path from 'path';
import glob from 'glob';

const empty = require('empty-folder');

const { createVuePlugin } = require('vite-plugin-vue2');

const vueSrcDir = "www/vue-development/src";

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

function emptyVueSrcDir() {
    return {
        buildStart() {
            let dir = path.resolve(__dirname, vueSrcDir);
            empty(dir, false, () => { 
                console.log('\nFolder ' + dir + ' emptied.'); 
            });
        }
    };
}

export default {
    plugins: [reload, createVuePlugin(), emptyVueSrcDir()],
    server: {
        watch: {
            usePolling: true
        }
    },
    build: {
        minify: true,
        manifest: true,
        assetsDir: '.',
        emptyOutDir: true,
        rollupOptions: {
            input:  glob.sync(path.resolve(__dirname, "www/vue-development/app/*/", "index.js")),
            output: {
                dir: vueSrcDir
            }
        }
    }
}