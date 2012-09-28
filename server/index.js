var server = require("./server");
var rewrite = require("./rewrite");
var opencitations = require("./providers/opencitations");

var handle = {};
handle["^/opencitations\\.net/([^/]+)$"] = opencitations.nodeinfo;

server.start(rewrite.rewrite, handle);
