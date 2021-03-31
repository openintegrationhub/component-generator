
 const newjs = require("./newjs")
 const newone = require("./newone")
 const lastJira = require("./lastJira")


 let successResp = "200";
 console.log("lastjira:",lastJira);

 let resp200 = JSON.parse(newjs);
 resp200 = resp200[successResp];

    let path;

    let schemaOut = {
        type: 'object',
        properties: {}
    };

    const recursiveSearch = (resp) => {
    let value; 
    console.log("recursive search with new value",value);
    //    
    if(typeof resp === "object"){   


       Object.keys(resp).forEach(key => {
       console.log("current key -->",key);
        value = resp[key];

        if(typeof value === 'object' ){   
            path = path +"."+ key;
            console.log("path -->",path);

            if (key === "properties" && ((!value.data) && (!value.items) && (!value.orders) )){
                console.log("value found 1:", value);
                finalResult(value)
                return false;
            // }else if (path.split(".").pop() === "attributes" && (!value.data) && (!value.items)){
            //     console.log("value found 2:", value);
            //     return value;
            } else {
                console.log("need to call recursion again");
                console.log("resp :",resp)
                return recursiveSearch(value);            
            }
            
        } else { 
            console.log("Not an Object");
            return false;
            }

        })   
        return {title:"not found"}
    }
    // }else { return "Not found"}

}
     function finalResult(res){
         console.log("final result",res);
         schemaOut.properties = res;
    }

 
        recursiveSearch(resp200);
        console.log("result:",schemaOut.properties);


                                                  //string.split(/-(.*)/)[1]
            //  %% 1.Mailchimp  Responses."200".content.application/json.schema.properties.batchesOrCampaigns.items.properties
            //  %% 2.Personio Responses."200".content.application/json.schema.$ref
            //  %% 3.Meisterplan Responses."200".schema.$ref
            //  %% 4.Asana Responses."200".content.application/json.schema.properties.data.items.$ref
            // end of the road -- means no data, no items , no schema etc.