var azure = require('./common/azure');

const modelQueryInputQueue = 'modelqueryinput';
const predictionTableName = 'Prediction';

module.exports = {
    getPrediction: function (group, name, interval, next) {
        if (interval == -1) {
            // we provide all predictions for the specified model 
            azure.ReadAllIntervals(predictionTableName, group + '_' + name).then(
                function (res) {
                    var intervals = [];
                    for (var i=0; i<res.entries.length; i++) {
                        intervals.push({
                            model_group: group,
                            model_name: name,
                            model_interval: JSON.parse(res.entries[i].PartitionKey._),
                            model_arguments: JSON.parse(res.entries[i].Arguments._),
                            model_prediction: JSON.parse(res.entries[i].Prediction._)
                         });
                    }
                    return next(intervals);
                },
                function (err) { return next(err); }
            );   
        }
        else {
             // we provide only the requested predictions for the specified model 
            azure.ReadEntity(predictionTableName, interval, group + '_' + name).then(
                function (res) {
                return next({
                    model_group: group,
                    model_name: name,
                    model_interval: interval,
                    model_arguments: JSON.parse(res.Arguments._),
                    model_prediction: JSON.parse(res.Prediction._)
                });
                
            },
            function (err) { return next(err); });
        }
    },
    postPrediction: function (predictionArgs, next) {
        var msg = JSON.stringify({
            model_query: predictionArgs
        });
        azure.AddMessage(modelQueryInputQueue, msg).then(function(res) {
            return next("/api/prediction?model_group="+predictionArgs.model_group+"&model_name="+predictionArgs.model_name+"&interval="+predictionArgs.model_interval); 
        },
        function(err) { return next(error); });
    }
};