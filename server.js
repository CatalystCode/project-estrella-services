var restify = require('restify'),
    restifyValidator  =  require('restify-validator'),
    fs = require('fs'),
    model = require(`./controller/model`),
    prediction = require(`./controller/prediction`);

var server = restify.createServer({
    name: 'Estrella'
});

server.use(restify.CORS());
restify.CORS.ALLOW_HEADERS.push("x-requested-with");
restify.CORS.ALLOW_HEADERS.push("cache-control");
restify.CORS.ALLOW_HEADERS.push("content-type");
restify.CORS.ALLOW_HEADERS.push("accept");
restify.CORS.ALLOW_HEADERS.push("authorization");
restify.CORS.ALLOW_HEADERS.push("metadata");

server.use(restify.queryParser());
server.use(restifyValidator);

server.post('/api/model', model.post);
server.get('/api/model', model.get);
server.put('/api/model', restify.bodyParser(), model.put);

server.get('/api/prediction', prediction.get);

var port = process.env.PORT || 8080;
server.listen(port, function () {
    console.log('%s listening at %s', server.name, server.url);
});
