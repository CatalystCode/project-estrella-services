# project-estrella-services
Backend services for project-estrella

## Configure
Ensure the following AppSettings are provided (either as env settings or within the `localConfig.json`):
```
{
    "AZURE_STORAGE_ACCOUNT" : "YOUR_ACCOUNT_NAME",
    "AZURE_STORAGE_ACCESS_KEY" : "YOUR_ACCOUNT_KEY",
    "PORT" : 8080
}
```

## api/prediction
The `prediction` api returns a stored value of a prediction (which has been initiated through a previous call to a `api/model` `PUT`)

### GET api/prediction/model?model_name=City&model_group=Mexico&interval=11
Returns a prediction for the specified model and interval

### POST api/prediction
Runs a prediction using the specified model

```js
{
  "model_group" : "Mexico",
  "model_name" : "City",
	"model_interval" : 2,
	"model_arguments" :  {
      "meantemp": 4,
      "rainsum": 3.5
		}
}
```

This posts the following message to the queue:
```js
{
   "model_query": {
    "model_group": "Mexico",
    "model_name": "City",
    "model_interval": 2,
    "model_arguments": {
      "meantemp": 4,
      "rainsum": 3.5
    }
  }
}
```

## api/model
The `model` api is used to interact with the model definition:
`POST` uploads the model
`GET` returns the model definition

### POST api/model 
```js
{
	"model_group" : "Mexico",
	"model_name" : "City",
	"model_intervals" : 52,
	"model_frequency" : "weekly",
	"model_parameters" : 	{
		"interval" : {"type" :"integer"},
		"arguments" :  {
			"meantemp" : {"type" :"integer"}, 
			"rainsum" : {"type" :"float"}
		}
	}
}
```
### GET api/model?model_name=City&model_group=Mexico 
```js
{
  "model_group": "Mexico",
  "model_name": "City",
  "model_url": "demoUrl",
  "model_intervals": 52,
  "model_frequency": "weekly",
  "model_parameters": {
    "interval": {
      "type": "integer"
    },
    "arguments": {
      "meantemp": {
        "type": "integer"
      },
      "rainsum": {
        "type": "float"
      }
    }
  }
}
```



