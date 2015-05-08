module.exports = {
	//configuration
	entry: {
		main: ['./content/scripts/main.js']
	},
	output: {
		path: __dirname + '/dist',
		filename: '[name].bundle.js'
	},
    module: {
        loaders: [
			// Needed for the css-loader when [bootstrap-webpack](https://github.com/bline/bootstrap-webpack)
			// loads bootstrap's css.
			//{ test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=application/font-woff' },
			//{ test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=application/octet-stream' },
			//{ test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
			//{ test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=image/svg+xml' },
            { test: /\.js$/, exclude: /node_modules/, loader: 'jsx!babel!eslint' },
            { test: /\.css$/, loader: 'style-loader!css-loader' }
            //{ test: /\.jsx$/, loader: 'jsx!babel!eslint' }
        ]
    }
};
