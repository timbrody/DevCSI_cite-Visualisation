var url = require("url");
var http = require("http");
var util = require("util");

var baseurl = "http://opencitations.net/sparql/";

function metadata(parts, response) {
	var _url = url.parse(baseurl);
	_url["query"] = {
		"query": undefined,
		"format": "srj",
		"common_prefixes": "on"
	};
	reflect(_url, response);
}

function citations(parts, response) {
	var id = parts[1];
	var _url = url.parse(baseurl);
	_url["query"] = {
		"query": util.format("SELECT ?subject WHERE { ?subject cito:cites <%s> } LIMIT 200", id),
		"format": "srj",
		"common_prefixes": "on"
	};
	reflect(_url, response);
}

function reflect(options, response) {
	options = url.parse(url.format(options));
	console.log("Requesting " + url.format(options));
	http.request(options, function(res) {
		response.writeHeader(res.statusCode, {
			"Content-Type": res.headers["Content-Type"]
		});
		res.on("data", function(data) {
			response.write(data);
		});
		res.on("end", function() {
			response.end();
		});
	}).on("error", function(e) {
		response.end();
		console.log(e);
	}).end();
}

exports.metadata = metadata;
exports.citations = citations;
