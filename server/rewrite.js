function rewrite(handle, pathname, response) {
	console.log("Rewriting " + pathname);

	if (typeof handle[pathname] === 'function') {
		handle[pathname](response);
	} else {
		console.log("No request handle found for " + pathname);
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not found");
		response.end();
	}
}

exports.rewrite = rewrite;
