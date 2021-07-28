import path from 'path';
import glob from 'glob';

const empty = require('empty-folder');

const fs = require('fs');
const fsreplace = require('replace-in-file');

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
            let scripts = [];
            
            for (const key in bundle) {
                let item = bundle[key]; 

                if (item.type == 'chunk' && item.facadeModuleId) {  // scripts
                    let facadeModuleIdArr = item.facadeModuleId.split('/');
                    let appName = facadeModuleIdArr[facadeModuleIdArr.length - 2];

                    item.fileName = appName + '.min.js';
                    scripts.push(appName);
                } 
            }
        },
        writeBundle(options, bundle) {
            let manifest = JSON.parse(bundle['manifest.json'].source);
            let stylesheetsOld = [];
            let stylesheetsNew = [];

            for (const key in manifest) {
                let item = manifest[key];

                if (item.isEntry) {
                    let appName = item.file.split('.')[0];
    
                    if (item.css && item.css.length > 0) {
                        let stylesheets = item.css;
    
                        for (var i = 0; i < stylesheets.length; i++) {
                            let stylesheetNameOld = bundle[stylesheets[i]].fileName;
                            let stylesheetNameNew = appName + '.min.css';

                            bundle[stylesheets[i]].fileName = stylesheetNameNew;
                            bundle[stylesheets[i]].name = stylesheetNameNew;

                            manifest[key].css[i] = stylesheetNameNew;
                            
                            stylesheetsOld.push(stylesheetNameOld);
                            stylesheetsNew.push(stylesheetNameNew);

                            Object.defineProperty(bundle, stylesheetNameNew, Object.getOwnPropertyDescriptor(bundle, stylesheetNameOld));
                            delete bundle[stylesheetNameOld];
                        }
                    }
                }
            }

            for (var i = 0; i < stylesheetsOld.length; i++) { 
                fs.rename(path.resolve(__dirname, vueSrcDir, stylesheetsOld[i]), path.resolve(__dirname, vueSrcDir, stylesheetsNew[i]), function(err) {
                    if (err) throw err;
                });
            }

            let manifestFile = path.resolve(__dirname, vueSrcDir, 'manifest.json');
            let stylesheetsOldRegexp = stylesheetsOld.map(el => new RegExp(el, 'gm'));
            fsreplace({
                files: manifestFile,
                from: stylesheetsOldRegexp,
                to: stylesheetsNew

            }).then(changedFiles => {
                    console.log('File manifest.json has been modified');
                })
                .catch(error => {
                    console.error('Error while modifying manifest.json:', error);
                });
                
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