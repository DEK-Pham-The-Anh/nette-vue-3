const path = require('path');
const { VueLoaderPlugin } = require('vue-loader')
//https://webpack.js.org/api/cli/
module.exports = function (env) {
	return {
		mode: env.environment,
		entry: ['./www/vue-development/app/' + env.appname + '/index.js'],
		module: {
			rules: [
				{
					test: /\.vue$/,
					use: 'vue-loader'
				},
				{
					test: /\.js$/,
					loader: 'babel-loader',
					exclude: /node_modules/
				}
			]
		},
		resolve: {
			alias: {
				'vue$': 'vue/dist/vue.esm.js'// https://vuejs.org/v2/guide/installation.html#Runtime-Compiler-vs-Runtime-only
			},
		},
		output: {
			path: path.join(__dirname, '../www'),
			filename: './vue-development/src/' + env.appname.toLowerCase() + '.min.js',
		},
		plugins: [
			new VueLoaderPlugin()
		]
	}
};