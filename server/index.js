var server = require("./server");
var rewrite = require("./rewrite");
var opencitations = require("./providers/opencitations");

var handle = {};
handle["^/opencitations\\.net/([^/]+)$"] = opencitations.metadata;
handle["^/opencitations\\.net/([^/]+)/citations$"] = opencitations.citations;

server.start(rewrite.rewrite, handle);
