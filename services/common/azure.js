var azure = require('azure-storage'),
    config  =  require('./config').config;
 
var account = config.get('AZURE_STORAGE_ACCOUNT');
var key = config.get('AZURE_STORAGE_ACCESS_KEY');
var tableSvc = azure.createTableService(account, key);
var retryOperations = new azure.ExponentialRetryPolicyFilter();
var queueSvc = azure.createQueueService(account, key).withFilter(retryOperations);
var blobSvc = azure.createBlobService(account, key);


module.exports = {
    ReadEntity : function (tableName, partitionKey, rowKey) {
        return new Promise(function (fulfill, reject) {
            tableSvc.createTableIfNotExists(tableName, function (error, result, response) {
                if (!error) {                
                    tableSvc.retrieveEntity(tableName, partitionKey, rowKey, function (error, result, response) {
                        if (!error) {
                            fulfill(result);
                        }
                        else {
                            reject(error);
                        }
                    });
                }
                else {
                    reject(error);
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
                            fulfill(entity);
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
    },
    AddMessage : function (queueName, msg) {    
        return new Promise(function (fulfill, reject) {
            queueSvc.createQueueIfNotExists(queueName, function (error, result, response) {
                if (!error) {
                    queueSvc.createMessage(queueName, msg, function (error, result, response) {
                        if (!error) {
                            fulfill(result); 
                        }
                        else {
                            reject(error);
                        }
                    });
                }
                else {
                    reject(error);
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
                            fulfill("https://"+account+".blob.core.windows.net/"+containerName+"/"+blobName);
                        }
                        else {
                            reject(error);
                        }
                    });  
                }
                else{
                    reject(error);
                }
            });
        });
    }
}
