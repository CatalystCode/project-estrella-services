var restify = require('restify'),
    restifyValidator  =  require('restify-validator'),
    fs = require('fs'),
    model = require(`./controller/model`);

var server = restify.createServer({
    name: 'Estrella'
});

server.use(restify.CORS());
server.use(restify.queryParser());
server.use(restifyValidator);

server.post('/api/model', model.post);
server.get('/api/model', model.get);
server.put('/api/model', restify.bodyParser(), model.put);

var port = process.env.PORT || 8080;
server.listen(port, function () {
    console.log('%s listening at %s', server.name, server.url);
});
