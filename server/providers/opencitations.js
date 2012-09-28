var url = require("url");
var http = require("http");
var util = require("util");

var baseurl = "http://opencitations.net/sparql/";

var sparql = {
	metadata: "\
SELECT \
	?article ?publicationDate ?title ?pubMedId ?doi \
WHERE \
{\
{\
	?article a <http://purl.org/spar/fabio/JournalArticle> \
	\
	FILTER \
		(?article = <%s>) \
	OPTIONAL \
		{ \
			?article prism:publicationDate ?publicationDate . \
			?article dcterms:title ?title . \
			?article fabio:hasPubMedId ?pubMedId . \
			?article prism:doi ?doi \
		} \
}\
UNION \
{\
	?article a <http://purl.org/spar/fabio/JournalArticle> . \
	?article ?p \"%s\" \
	\
	FILTER \
		(?p in (prism:doi, fabio:hasPubMedId, fabio:hasPubMedCentralId, dcterms:identifier, rdfs:label, skos:prefLabel, dcterms:title)) \
	OPTIONAL \
		{ \
			?article prism:publicationDate ?publicationDate . \
			?article dcterms:title ?title . \
			?article fabio:hasPubMedId ?pubMedId . \
			?article prism:doi ?doi \
		} \
}\
}\
LIMIT 1\
",
	citations: "SELECT ?article ?publicationDate ?title ?pubMedId ?doi WHERE { ?article cito:cites <%s> OPTIONAL { ?article prism:publicationDate ?publicationDate .  ?article dcterms:title ?title .  ?article fabio:hasPubMedId ?pubMedId .  ?article prism:doi ?doi } } LIMIT 2000"
};

function nodeinfo(parts, query, response) {
	response.writeHeader(200, {
		"Content-Type": "application/json; charset=utf-8"
	});
	if (query.jsonp) {
		response.write(query.jsonp + "(");
	}

	var id = parts[1];

	var metadataf = function(id) {
		var _url = url.parse(baseurl);
		_url["query"] = {
			"query": util.format(sparql.metadata, id, id),
			"format": "srj",
			"common_prefixes": "on"
		};
		return _url;
	};
	var citationsf = function(id) {
		var _url = url.parse(baseurl);
		_url["query"] = {
			"query": util.format(sparql.citations, id),
			"format": "srj",
			"common_prefixes": "on"
		};
		return _url;
	};

	retrieve(metadataf(id), function(data) {
		var input = JSON.parse(data);
		var root = convert(input.results.bindings[0]);
		console.log(JSON.stringify(input, undefined, 4));
		retrieve(citationsf(root.id), function(data) {
			var input = JSON.parse(data);
			var children = input.results.bindings;
			for(var i = 0; i < children.length; ++i)
			{
				var node = convert(children[i]);
				node.children = undefined;
				root.children.push(node);
			}
			console.log(JSON.stringify(input, undefined, 4));
			response.write(JSON.stringify(root, undefined, 4));
			if (query.jsonp) {
				response.write(");");
			}
			response.end();
		});
	});
}

function convert(input) {
	var output = {
		id: null,
		name: null,
		data: {},
		children: []
	};

	if (!input)
		return output;

	if (input.article)
		output.id = input.article.value;
	if (input.title)
		output.name = input.title.value;
	if (input.pubMedId)
		output.data.pubMedId = input.pubMedId.value;
	if (input.doi)
		output.data.doi = input.doi.value;
	if (input.publicationDate)
		output.data.publicationDate = input.publicationDate.value;

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
