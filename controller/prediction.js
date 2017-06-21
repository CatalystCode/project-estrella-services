var restify = require('restify');
var prediction = require('../services/predictionService');
var validate = require('jsonschema').validate;
validate.throwError = true;

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
    }
}