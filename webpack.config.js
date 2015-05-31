var webpack = require('webpack');
module.exports = {
	//configuration
    target: "node-webkit",
	entry: {
		main: ['./content/browser/styles/bootstrap.min.css', './content/browser/scripts/bootstrap.min.js', './content/browser/scripts/main.js']
	},
	output: {
		path: __dirname + '/dist',
		filename: '[name].bundle.js'
	},
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: "jquery"
        })
    ],
    externals: [
        {
            'node-notifier': 'require("node-notifier")'
        },
        function(context, request, callback){
            if(/^node--/.test(request))
                return callback(null, "require('../content/node/" + request.substr(6) + "')")
            callback();
        }
    ],
    module: {
        loaders: [
			// Needed for the css-loader when [bootstrap-webpack](https://github.com/bline/bootstrap-webpack)
			// loads bootstrap's css.
            { test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/, loader: 'url' },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url' },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'url' },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url' },
            { test: /\.png$/, exclude: /node_modules/, loader: 'url?limit=10000&mimetype=image/png' },
            { test: /\.gif$/, exclude: /node_modules/, loader: 'url?limit=10000&mimetype=image/gif' },
            { test: /\.js$/, exclude: /node_modules|bootstrap\.min\.js/, loader: 'jsx!babel!eslint' },
            { test: /\.css$/, loader: 'style-loader!css-loader' }
            //{ test: /\.jsx$/, loader: 'jsx!babel!eslint' }
        ]
    }
};
