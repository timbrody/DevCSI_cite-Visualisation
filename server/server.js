var http = require("http");
var url = require("url");
var querystring = require("querystring");

function start(rewrite, handle) {
	function onRequest(request, response) {
		var pathname = url.parse(request.url).pathname;
		var query = url.parse(request.url).query;
		if (query === undefined) {
			query = {};
		}
		else {
			query = querystring.parse(query);
		}
		console.log("Request for " + pathname + " received.");

		rewrite(handle, pathname, query, response);
	}

	http.createServer(onRequest).listen(8888);
	console.log("Server has started.");
}

exports.start = start;
