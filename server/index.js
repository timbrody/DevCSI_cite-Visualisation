var server = require("./server");
var rewrite = require("./rewrite");
var requestMetadata = require("./handlers/metadata");
var requestCitations = require("./handlers/citations");

var handle = {};
handle["/metadata"] = requestMetadata.handle;
handle["/citations"] = requestCitations.handle;

server.start(rewrite.rewrite, handle);
