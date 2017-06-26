var azure = require('azure-storage'),
    config  =  require('./config').config;
 
const account = config.get('AZURE_STORAGE_ACCOUNT');
const key = config.get('AZURE_STORAGE_ACCESS_KEY');
var tableSvc = azure.createTableService(account, key);
var retryOperations = new azure.ExponentialRetryPolicyFilter();
var queueSvc = azure.createQueueService(account, key).withFilter(retryOperations);
queueSvc.messageEncoder = new azure.QueueMessageEncoder.TextBase64QueueMessageEncoder();
var blobSvc = azure.createBlobService(account, key);


module.exports = {
    ReadEntity : function (tableName, partitionKey, rowKey) {
        return new Promise(function (fulfill, reject) {
            tableSvc.createTableIfNotExists(tableName, function (error, result, response) {
                if (!error) {                
                    tableSvc.retrieveEntity(tableName, partitionKey, rowKey, function (error, result, response) {
                        if (!error) {
                            return fulfill(result);
                        }
                        else {
                            return reject(error);
                        }
                    });
                }
                else {
                    return reject(error);
                } 
            });
        });
    },

    ReadAllIntervals : function (tableName, rowKey) {
        return new Promise(function (fulfill, reject) {
            // if this scan becomes too slow, we need to add a search range for the PartionKey
            var query = new azure.TableQuery().
                where('RowKey eq ?', rowKey);
            tableSvc.queryEntities(tableName, query, null, function (error, result, response) {
                if (!error) {
                    return fulfill(result);
                }
                else {
                    return reject(error);
                }
            });
        });
    },

    WriteEntity : function (tableName, entity) {
        return new Promise(function (fulfill, reject) {
            tableSvc.createTableIfNotExists(tableName, function (error, result, response) {
                if (!error) {
                    tableSvc.insertOrReplaceEntity(tableName, entity, function (error, result, response) {
                        if (!error) {
                            return fulfill(entity);
                        }
                        else {
                            return reject(error);
                        }
                    });
                }
                else {
                    return reject(error);
                }
            });
        });
    },
    AddMessage : function (queueName, msg) {    
        return new Promise(function (fulfill, reject) {
            queueSvc.createQueueIfNotExists(queueName, function (error, result, response) {
                if (!error) {
                    queueSvc.createMessage(queueName, msg, function (error, result, response) {
                        if (!error) {
                            return fulfill(result); 
                        }
                        else {
                            return reject(error);
                        }
                    });
                }
                else {
                    return reject(error);
                }
            });
        });
    },
    UploadBlob : function (containerName, blobName, filePath){
        return new Promise(function (fulfill, reject) {
            blobSvc.createContainerIfNotExists(containerName, function(error, result, response){
                if(!error){
                    blobSvc.createBlockBlobFromLocalFile(containerName, blobName, filePath, function(error, result, response){
                        if (!error) {
                            return fulfill("https://"+account+".blob.core.windows.net/"+containerName+"/"+blobName);
                        }
                        else {
                            return reject(error);
                        }
                    });  
                }
                else{
                    return reject(error);
                }
            });
        });
    }
}
