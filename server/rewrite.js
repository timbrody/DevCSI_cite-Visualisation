var querystring = require("querystring");

function rewrite(handle, pathname, query, response) {
	console.log("Rewriting " + pathname);

	for(var regexp in handle)
	{
		console.log("Does it match " + regexp);
		var _regexp = new RegExp(regexp);
		var parts = _regexp.exec(pathname);
		if (parts)
		{
			for(var i = 1; i < parts.length; ++i)
			{
				parts[i] = querystring.unescape(parts[i]);
			}
			handle[regexp](parts, query, response);
			return;
		}
	}
	console.log("No request handle found for " + pathname);
	response.writeHead(404, {"Content-Type": "text/plain"});
	response.write("404 Not found");
	response.end();
}

exports.rewrite = rewrite;
