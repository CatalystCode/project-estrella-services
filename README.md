# project-estrella-services
Backend services for project-estrella

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
			"cases" : {"type" :"integer"}, 
			"rain" : {"type" :"float"}
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
      "cases": {
        "type": "integer"
      },
      "rain": {
        "type": "float"
      }
    }
  }
}
```

### PUT api/model
```js
{
  "model_group" : "Mexico",
  "model_name" : "City",
	"model_interval" : 1,
	"model_arguments" :  {
			"cases" : 4, 
			"rain" : 3.5
		}
}
```

## Message posted to queue
```js
{
  "model_url": "https://estrellamldata.blob.core.windows.net/models/Indonesia/Bali",
  "model_query": {
    "model_group": "Indonesia",
    "model_name": "Bali",
    "model_interval": 1,
    "model_arguments": {
      "cases": 4,
      "rain": 3.5
    }
  }
}
```

