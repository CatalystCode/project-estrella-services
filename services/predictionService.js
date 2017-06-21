var azure = require('azure-storage'),
    nconf  =  require('nconf'),
    fs = require('fs');
nconf.env().argv().defaults({ config: 'localConfig.json' });
var configFile = nconf.get('config');
var config = nconf.file({ file: configFile, search: true });

var account = nconf.get('AZURE_STORAGE_ACCOUNT');
var key = nconf.get('AZURE_STORAGE_ACCESS_KEY');
var tableSvc = azure.createTableService(account, key);

const predictionTableName = 'Prediction';

function ReadEntity(tableName, partitionKey, rowKey) {
    return new Promise(function (fulfill, reject) {
        tableSvc.createTableIfNotExists(tableName, function (error, result, response) {
            tableSvc.retrieveEntity(tableName, partitionKey, rowKey, function (error, result, response) {
                if (!error) {
                    fulfill(result);
                }
                else {
                    reject(error);
                }
            });
        });
    });
}
function ReadEntities(tableName, groupName, modelName, interval) {
    return new Promise(function (fulfill, reject) {
        tableSvc.createTableIfNotExists(tableName, function (error, result, response) {
            var query = new azure.TableQuery().
                where('PartitionKey eq ?', interval).
                and('RowKey eq ?',groupName + '_' + modelName);
            tableSvc.queryEntities(tableName, query, null, function (error, result, response) {
                if (!error) {
                    fulfill(result);
                }
                else {
                    reject(error);
                }
            });
        });
    });
}

module.exports = {
    getPrediction: function (group, name, interval, next) {
        ReadEntity(predictionTableName, interval, group + '_' + name).then(
            function (res) {
            next({
                model_group: group,
                model_name: name,
                model_interval: interval,
                model_arguments: res.Arguments._,
                model_prediction: JSON.parse(res.Prediction._)
            });
        },
        function (err) { next(err); })
        ;
    }
};