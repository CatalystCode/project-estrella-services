var azure = require('azure-storage'),
    nconf  =  require('nconf'),
    fs = require('fs');
nconf.env().argv().defaults({ config: 'localConfig.json' });
var configFile = nconf.get('config');
var config = nconf.file({ file: configFile, search: true });

var account = nconf.get('AZURE_STORAGE_ACCOUNT');
var key = nconf.get('AZURE_STORAGE_ACCESS_KEY');
var tableSvc = azure.createTableService(account, key);
var blobSvc = azure.createBlobService(account, key);

const modelDefinitionTableName = 'ModelDefinition';
const datapointTableName = 'ModelDatapoint';
const modelBlobContainer = 'models';

function deleteFile (file) { 
    fs.unlink(file, function (err) {
        if (err) {
            console.error(err.toString());
        }
    });
}

function UploadBlob(containerName, blobName, filePath){
    return new Promise(function (fulfill, reject) {
        blobSvc.createContainerIfNotExists(containerName, function(error, result, response){
            if(!error){
                blobSvc.createBlockBlobFromLocalFile(containerName, blobName, filePath, function(error, result, response){
                    // delete the temp file
                    deleteFile(filePath);
                    if (!error) {
                        fulfill("https://"+account+".blob.core.windows.net/"+modelBlobContainer+"/"+blobName);
                    }
                    else {
                        console.error("Couldn't upload file - error: ", error);
                        reject(error);
                    }
                });  
            }
            else{
                console.error("Couldn't create container - error: ", error);
                reject(error);
            }
        });
    });
}

function WriteEntity(tableName, entity) {
    return new Promise(function (fulfill, reject) {
        tableSvc.createTableIfNotExists(tableName, function (error, result, response) {
            if (!error) {
                tableSvc.insertOrReplaceEntity(tableName, entity, function (error, result, response) {
                    if (!error) {
                        fulfill(entity.Url._);
                    }
                    else {
                        reject(error);
                    }
                });
            }
            else {
                console.error(error);
            }
        });
    });
}

function ReadEntity(tableName, partitionKey, rowKey) {
    return new Promise(function (fulfill, reject) {
        tableSvc.retrieveEntity(tableName, partitionKey, rowKey, function (error, result, response) {
            if (!error) {
                fulfill(result);
            }
            else {
                reject(error);
            }
        });
    });
}
function ReadEntities(tableName, partitionKey, rowKey, interval) {
    return new Promise(function (fulfill, reject) {
        var query = new azure.TableQuery().
            where('PartitionKey eq ?', partitionKey).
            and('RowKey gt ?', rowKey + '_').
            and('RowKey le ?', rowKey + '_' + interval);
        tableSvc.queryEntities(tableName, query, null, function (error, result, response) {
            if (!error) {
                fulfill(result);
            }
            else {
                reject(error);
            }
        });
    });
}

module.exports = {
    getDefinition: function (group, name, next) {
        ReadEntity(modelDefinitionTableName, group, name).then(function (res) {
            next({
                model_group: res.PartitionKey._,
                model_name: res.RowKey._,
                model_url: res.Url._,
                model_intervals: res.Intervals._,
                model_frequency: res.Frequency._,
                model_parameters: JSON.parse(res.Parameters._)
            });
        });
    },
    saveDefinition: function (modelDefinition, filePath, next) {
        var blobName = modelDefinition.model_group + "/" + modelDefinition.model_name;
        UploadBlob(modelBlobContainer, blobName, filePath).then(function (res) { 
            var modelUrl = res;
            var entGen = azure.TableUtilities.entityGenerator;
            var entity = {
                PartitionKey: entGen.String(modelDefinition.model_group),
                RowKey: entGen.String(modelDefinition.model_name),
                Intervals: entGen.Int32(modelDefinition.model_intervals),
                Frequency: entGen.String(modelDefinition.model_frequency),
                Url: entGen.String(modelUrl),
                Parameters: entGen.String(JSON.stringify(modelDefinition.model_parameters))
            };
            WriteEntity(modelDefinitionTableName, entity).then(
                function (res) { next(res); },
                function (err) { next(err); }
            );
        },
            function (err) { next(err); }
        );
    }
};