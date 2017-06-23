var azure = require('./common/azure'),
    fs = require('fs');

const modelDefinitionTableName = 'ModelDefinition';
const modelBlobContainer = 'models';

function deleteFile (file) { 
    fs.unlink(file, function (err) {
        if (err) {
            console.error(err.toString());
        }
    });
}

module.exports = {
    getDefinition: function (group, name, next) {
        azure.ReadEntity(modelDefinitionTableName, group, name).then(function (res) {
            next({
                model_group: res.PartitionKey._,
                model_name: res.RowKey._,
                model_url: res.Url._,
                model_intervals: res.Intervals._,
                model_frequency: res.Frequency._,
                model_parameters: JSON.parse(res.Parameters._)
            });
        },
            function (err) { next(err); }
        );
    },
    saveDefinition: function (modelDefinition, filePath, next) {
        var blobName = modelDefinition.model_group + "/" + modelDefinition.model_name;
        azure.UploadBlob(modelBlobContainer, blobName, filePath).then(function (res) { 
            // delete the temp file
            deleteFile(filePath);
            var modelUrl = res;
            var entGen = require('azure-storage').TableUtilities.entityGenerator;
            var entity = {
                PartitionKey: entGen.String(modelDefinition.model_group),
                RowKey: entGen.String(modelDefinition.model_name),
                Intervals: entGen.Int32(modelDefinition.model_intervals),
                Frequency: entGen.String(modelDefinition.model_frequency),
                Url: entGen.String(modelUrl),
                Parameters: entGen.String(JSON.stringify(modelDefinition.model_parameters))
            };
            azure.WriteEntity(modelDefinitionTableName, entity).then(
                function (res) { next(entity.Url._); },
                function (err) { next(err); }
            );
        },
            function (err) { next(err); }
        );
    }
};