import path from 'path';
import glob from 'glob';

const empty = require('empty-folder');

const fs = require('fs');

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

function customBuildPlugin() {
    return {
        buildStart() {
            let dir = path.resolve(__dirname, vueSrcDir);
            empty(dir, false, () => { 
                console.log('\nFolder ' + dir + ' emptied.'); 
            });
        },
        generateBundle(options, bundle) {
            // let manifestVue = path.resolve(__dirname, vueSrcDir, "manifest.json"); console.log('manifestVue', manifestVue);

            // fs.readFile('/www/vue-development/src/manifest.json', function(err, data) {
            //     console.log(data);
            // });

            console.log('\nBundle contains ' + Object.keys(bundle).length + ' file(s).');
            
            for (const key in bundle) {
                let item = bundle[key]; 

                if (item.type == 'chunk' && item.facadeModuleId) {  // scripts

                    let facadeModuleIdArr = item.facadeModuleId.split('/');
                    let appName = facadeModuleIdArr[facadeModuleIdArr.length - 2];

                    item.fileName = appName + '.min.js';
                
                } else if (item.type == 'asset') {    // stylesheets
                    
                    // This is a problem here

                }
            }

        }
    };
}

export default {
    plugins: [reload, createVuePlugin(), customBuildPlugin()],
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
                dir: vueSrcDir,
                chunkFileNames: "[name]-[hash].js" 
            }
        }
    }
}