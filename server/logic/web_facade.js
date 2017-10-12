global.requestHandler = require("./requestHandler.js");

var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');

var app = express();
var server = http.createServer(app);

var exports = module.exports = {};

var fileRoot = __dirname + '/../../client';


exports.startServer = function(args) {
    var port = 10000;
    if (args && args.port) {
        port = args.port;
    }
    //global.webSocketServer = socketsWrapper.initSocketServer(server);
    server.listen(port);
    console.log('blackjack started on port ' + port);
};

exports.initRoutes = function() {

    app.use(bodyParser.json());

    app.use('/', express.static(fileRoot + '/'));
    app.use('/:view', express.static(fileRoot + '/'));
    app.use('/:view/:subView', express.static(fileRoot + '/'));

    app.get('*', function(req, res) {
        //TODO: move to 404
        res.status(404).send('Resource not found');
    });
};

exports.initApi = function() {
    global.requestHandler.init(app);
};
