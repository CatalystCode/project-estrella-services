var restify = require('restify');
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var model = require('../services/model-service');
var validate = require('jsonschema').validate;
validate.throwError = true;

var modelPostSchema = {
    "id": "/ModelPost",
    "type": "object",
    "properties": {
        "model_group": { "type": "string" },
        "model_name": { "type": "string" },
        "model_intervals": { "type": "int" },
        "model_frequency": { "type": "string" },
        "model_parameters": { "type": "object" }
    },
    "required": ["model_group", "model_name", "model_intervals", "model_frequency"]
}



module.exports = {
    get: function (req, res, next) {
        req.assert('model_group', 'Invalid model_group').notEmpty();
        req.assert('model_name', 'Invalid model_name').notEmpty();
        if (!req.validationErrors()) {
            model.getDefinition(req.query.model_group, req.query.model_name, function (result) {
                res.send(result);
                next();
            });
        }
        else {
            next(new restify.ResourceNotFoundError("query format is ?model_name=xyz&model_group=xyz or ?model_name=xyz"));
        }
    },
    post: function (req, res, next) {
        // create an incoming form object
        var form = new formidable.IncomingForm();
        var filePath = "undefined";
        var metadata = JSON.parse(req.headers["metadata"]);

        // specify that we want to allow the user to upload multiple files in a single request
        form.multiples = true;

        // store all uploads in the tmp dir
        form.uploadDir = require('os').tmpdir();

        // every time a file has been uploaded successfully,
        // rename it to it's orignal name
        form.on('file', function (field, file) {
            filePath = path.join(form.uploadDir, file.name);
            fs.rename(file.path, filePath);
        });

        // log any errors that occur
        form.on('error', function (err) {
            console.log('An error has occured: \n' + err);
        });

        // once all the files have been uploaded, send a response to the client
        form.on('end', function () {
            metadata["model_intervals"] = parseInt(metadata["model_intervals"]);
            metadata["model_parameters"] = JSON.parse(metadata["model_parameters"]);
            var validated = validate(metadata, modelPostSchema);
            if (validated.valid) {
                jsonBody = metadata;
                model.saveDefinition(jsonBody, filePath, function (result) {
                    res.send(result);
                    next();
                });
            }
            else {
                next(new restify.InvalidArgumentError("invalid schema - correct schema is " + JSON.stringify(modelPostSchema)));
            }
        });

        // parse the incoming request containing the form data
        form.parse(req);
    }
}