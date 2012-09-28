var url = require("url");
var http = require("http");
var util = require("util");

var baseurl = "http://opencitations.net/sparql/";

var sparql = {
	metadata: " ",
	citations: "SELECT ?article ?publicationData ?title ?pubMedId ?doi WHERE { ?article cito:cites <%s> OPTIONAL { ?article prism:publicationDate ?publicationDate .  ?article dcterms:title ?title .  ?article fabio:hasPubMedId ?pubMedId .  ?article prism:doi ?doi } } LIMIT 2000"
};

function nodeinfo(parts, query, response) {
	var id = parts[1];
	var _url = url.parse(baseurl);
	_url["query"] = {
		"query": util.format(sparql.citations, id),
		"format": "srj",
		"common_prefixes": "on"
	};
	console.log(query.jsonp);
	response.writeHeader(200, {
		"Content-Type": "application/json"
	});
	if (query.jsonp) {
		response.write(query.jsonp + "(");
	}
	retrieve(_url, function(data) {
		var input = JSON.parse(data);
		var root = convert({});
		var children = input.results.bindings;
		for(var i = 0; i < children.length; ++i)
		{
			var node = convert(children[i]);
			node.children = undefined;
			root.children.push(node);
		}
//		response.write(JSON.stringify(input, undefined, 4));
		response.write(JSON.stringify(root, undefined, 4));
		if (query.jsonp) {
			response.write(");");
		}
		response.end();
	});
}

function convert(input) {
	var output = {
		id: null,
		name: null,
		data: {},
		children: []
	};

	if (input.article)
		output.id = input.article.value;
	if (input.title)
		output.name = input.title.value;
	if (input.pubMedId)
		output.data.pubMedId = input.pubMedId.value;
	if (input.doi)
		output.data.doi = input.doi.value;

	return output;
}

function retrieve(options, finish) {
	options = url.parse(url.format(options));
	console.log("Requesting " + url.format(options));
	var buffer = "";
	http.request(options, function(res) {
		res.on("data", function(data) {
			buffer += data;
		});
		res.on("end", function() {
			finish(buffer);
		});
	}).on("error", function(e) {
		finish();
		console.log(e);
	}).end();
}

exports.nodeinfo = nodeinfo;
