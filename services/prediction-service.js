var azure = require('./common/azure');

const modelQueryInputQueue = 'modelqueryinput';
const predictionTableName = 'Prediction';

module.exports = {
    getPrediction: function (group, name, interval, next) {
        azure.ReadEntity(predictionTableName, interval, group + '_' + name).then(
            function (res) {
            next({
                model_group: group,
                model_name: name,
                model_interval: interval,
                model_arguments: JSON.parse(res.Arguments._),
                model_prediction: JSON.parse(res.Prediction._)
            });
        },
        function (err) { next(err); });
    },
    postPrediction: function (predictionArgs, next) {
        var msg = JSON.stringify({
            model_query: predictionArgs
        });
        azure.AddMessage(modelQueryInputQueue, msg).then(function(res) {
            next("/api/prediction?model_group="+predictionArgs.model_group+"&model_name="+predictionArgs.model_name+"&interval="+predictionArgs.model_interval); 
        },
        function(err) { next(error); });
    }
};