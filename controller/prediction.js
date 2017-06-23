var restify = require('restify');
var prediction = require('../services/prediction-service');
var validate = require('jsonschema').validate;
validate.throwError = true;

var predictionPostSchema = {
    "id": "/PredictionPost",
    "type": "object",
    "properties": {
        "model_group": { "type": "string" },
        "model_name": { "type": "string" },
        "model_interval": { "type": "int" },
        "model_arguments": { "type": "object" }
    },
    "required": ["model_group", "model_name", "model_interval", "model_arguments"]
}
module.exports = {
    get: function (req, res, next) {
        req.assert('model_group', 'Invalid model_group').notEmpty();
        req.assert('model_name', 'Invalid model_name').notEmpty();
        if (!req.validationErrors()) {
            var interval = req.query.interval ? req.query.interval : -1;
            prediction.getPrediction(req.query.model_group, req.query.model_name, interval, function (result) {
                res.send(result);
                next();
            });
        }
        else {
            next(new restify.ResourceNotFoundError("query format is ?model_name=xyz&model_group=xyz or ?model_name=xyz&model_group=xyz&interval=xyz"));
        }
    },
    post: function (req, res, next) {
        if (validate(req.body, predictionPostSchema).valid) {
            var jsonBody = req.body;
            prediction.postPrediction(jsonBody, function (result) {
                var url = "http://"+req.headers.host + result;
                res.send(url);
                next();
            });
        }
        else {
            next(new restify.InvalidArgumentError("invalid schema - correct schema is " + JSON.stringify(predictionPostSchema)));
        }
    }
}