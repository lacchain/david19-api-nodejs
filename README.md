# david19-api-nodejs

API for DAVID19's map provided by LACChain.

## Map
1. Embed map into iframe
    
    Endpoint: https://map.lacchain.net
    
    Query Params:
    
    - lat: Latitude to center map
    - lon: Longitude to center map
    - zoom: Zoom level of map, from 2 to 18, where 2 is a continent level and 18 is a street level
    - lang: Language of map (es,en,pt)
    
    Example:
    
    ``<iframe src="https://map.lacchain.net?lat=12&lon=-100&zoom=5&lang=en" width="100%" height="100%"/>``
    
## API

**Main Endpoint**: https://backend.lacchain.net

**Content-Type**: application/json

1. **Get Country Summary**

    Gets the summary status of users grouped by country
    
    Path: /
    
    Method: GET
    
    Response:
    ```json
   [
      	{
      		"_id": "US",
      		"healthyCount": 29,
      		"withSymptomsCount": 0,
      		"affectedCount": 3,
      		"recoveredCount": 0,
      		"usersCount": 32,
      		"transactionsCount": 121
      	}
      	...
      	{
      		"_id": "BR",
      		"healthyCount": 9,
      		"withSymptomsCount": 1,
      		"affectedCount": 0,
      		"recoveredCount": 0,
      		"usersCount": 10,
      		"transactionsCount": 33
      	}
      ] 

2. **Get Users By Age Range**

    Gets the number of users by gender grouped by age range, using the filters in body request
    
    Path: /ages
    
    Method: POST
    
    Body Request:
    ```json
       {
        "filter": {
            "country": Two letter country code ISO 3166-2,
            "state": State code from ISO 3166-2,
            "gender": Gender code (see Genders catalog)
        },
        "status": Status code (see Statuses catalog)
       }
   ```
   
    Response:
    ```json
     [
       {
            "_id": "0_13",
            "count": 2,
            "maleCount": 1,
            "femaleCount": 0,
            "unspecifiedCount": 0,
            "otherCount": 1
       }
       ...
       {
            "_id": "18_30",
            "count": 41,
            "maleCount": 17,
            "femaleCount": 22,
            "unspecifiedCount": 1,
            "otherCount": 1
        }
     ]

3. **Get Cluster Points by Area and Filter**

    Gets the cluster of points by area and filter. Returns an array of cluster with the coordinates of the cluster center, 
    as well as number of users in the cluster by: gender, status, symptoms and interruption reason.
    
    If you want all the clusters of the world, you need to specify the bigger box of map.
    The box parameter is a 2D array of coordinates, where first element represent the coordinates of 
    bottom-left point of a rectangle and the second element represent the top-right point of a rectangle.
    Each pair of coordiantes are in the [longitude, latitude] format.
    
    The filter is optional, but the parameter is required, this means that if you don't want to use the filters,
    the parameters must be null.
    
    Path: /query
    
    Method: POST
    
    Body Request:
    ```json
       {
        "filter": {
            "country": Two letter country code ISO 3166-2 or null,
            "state": State code from ISO 3166-2 or null,
            "gender": Gender code (see Genders catalog) or null
            "age": Age range in years ("10-20", "40-60", etc) or null
        },
        "box": [
            [
                -77.24499605313326,
                39.08431815809267
            ],
            [
                -77.23426721707342,
                39.08809060784259
            ]
        ]
       }
   ```
   
    Response:
    ```json
     [
     	{
     		"_id": "dqcn67",
     		"usersCount": 8,
     		"maleCount": 2,
     		"femaleCount": 5,
     		"unspecifiedCount": 0,
     		"otherCount": 1,
     		"confinedCount": 5,
     		"healthyCount": 8,
     		"withSymptomsCount": 0,
     		"affectedCount": 0,
     		"recoveredCount": 0,
     		"feverCount": 0,
     		"coughCount": 0,
     		"breathingIssuesCount": 0,
     		"lostSmellCount": 0,
     		"headacheCount": 0,
     		"musclePainCount": 0,
     		"soreThroatCount": 0,
     		"foodCount": 0,
     		"workCount": 1,
     		"medicinesCount": 1,
     		"doctorCount": 0,
     		"movingCount": 0,
     		"assistCount": 0,
     		"financialCount": 0,
     		"forceCount": 3,
     		"petsCount": 0,
     		"otherReasonCount": 1,
     		"location": [
     			-77.2393798828125,
     			39.08660888671875
     		],
     		"latAvg": 39.08660888671875,
     		"lonAvg": -77.2393798828125
     	}
     ]


4. **Get Points Accumulated by Country**

    Gets the total points accumulated for users by every country. 
    The _id attribute in the response, represents the country in ISO 3166-2 format
    
    Path: /points
    
    Method: GET
    
    Response Example:
    ```json
    [
        {
            "_id": "MX",
            "points": 100
        }
       ...
        {
            "_id": "AR",
            "points": 200
        }
   ]
   
5. **Get Top 100 Users Ranking**

    Gets the top 100 users in all world by accumulated points in descending order.
    
    Path: /points/ranking
    
    Method: GET
    
    Response Example:
    ```json
    [
    	{
    		"subjectId": "0x87c4db9814a822d1b62a25721a1fba203622b4ce13fc15ae2ecdee34a87dec7f",
    		"country": "DO",
    		"region": "01",
    		"status": 0,
    		"points": 40
    	}
        ...
    	{
    		"subjectId": "0xa31830daed06afbad03b20ae86f6a04e3c978311ead09f796f427eae9294debe",
    		"country": "AR",
    		"region": "B",
    		"status": 0,
    		"points": 0
    	}
   ]
   
6. **Get User Ranking**

    Gets the user ranking position in all world and their country. The subject id parameter in URL represents the 
    user unique identifier in blockchain. The method also returns the country of specified user.
    
    Path: /points/user/:subjectId/ranking
    
    Method: GET
    
    Response Example:
    ```json
    {
    	"country": "DO",
    	"globalPosition": 0,
    	"countryPosition": 0
    }
   
7. **Get User Points**

    Gets the user accumulated points. The subject id parameter in URL represents the 
    user unique identifier in blockchain. The method also returns the country of specified user.
    
    Path: /points/user/:subjectId
    
    Method: GET
    
    Response Example:
    ```json
    {
    	"points": 40
    }
   
## Catalogs

1. **Status Catalog**
    ````
    Healthy: 0
    WithSymptoms: 1
    Affected: 2
    Recovered: 3
   

2. **Genders Catalog**
    ````
    Male: 0
    Female: 1
    Unspecified: 2
    Other: 3
