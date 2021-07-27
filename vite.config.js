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
            console.log('\nBundle contains ' + Object.keys(bundle).length + ' file(s).');
            let scriptsCount = 0;
            
            for (const key in bundle) {
                let item = bundle[key]; 

                if (item.type == 'chunk' && item.facadeModuleId) {  // scripts
                    let facadeModuleIdArr = item.facadeModuleId.split('/');
                    let appName = facadeModuleIdArr[facadeModuleIdArr.length - 2];

                    item.fileName = appName + '.min.js';
                    scriptsCount++;
                } 
            }

            console.log(scriptsCount + ' scripts renamed.');
        },
        writeBundle(options, bundle) {
            let manifest = JSON.parse(bundle['manifest.json'].source);
            let stylesheetsCount = 0;

            for (const key in manifest) {
                let item = manifest[key];

                if (item.isEntry) {
                    let appName = item.file.split('.')[0];
    
                    if (item.css && item.css.length > 0) {
                        let stylesheets = item.css;
    
                        for (var i = 0; i < stylesheets.length; i++) {
                            bundle[stylesheets[i]].fileName = appName + '.min.css';
                            stylesheetsCount++;
                        }
                    }
                }
            }

            console.log(stylesheetsCount + ' stylesheets renamed.');
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
                dir: vueSrcDir
            }
        }
    }
}