
 const newjs = require("./newjs")
 const newone = require("./newone")


                                    let schemaOut = {
                                        type: 'object',
                                        properties: {}
                                    };

                                    let successResp = "200";
                                    let resp200 = JSON.parse(newone)[successResp];

                                    let searchKey = ["items","schema","attributes"];

                                    //  console.log("resp200 -->",resp200);
                                    let counter = 0;
                                    let path = "";
                                    const recursiveSearch = (respNew) => {
                                        counter++;
                                        console.log("counter", counter)
                                        Object.keys(respNew).forEach(key => {
                                        //    console.log("new key -->",key);
                                            
                                           const value = respNew[key];
                                        //    console.log("values: ",value)

                                        // console.log("resp 200 new -- :" ,resp200[key]);

                                            if(typeof value === 'object' ){
                                                path = path +"."+ key;
                                                
                                                console.log("path -->",path);
                                                // console.log("path type: ", typeof path);

                                                if (path.split(".").pop() === "properties" && ((!value.data) && (!value.items) && (!value.orders) )){
                                                    console.log("fired1");
                                                    console.log("new value:", value);
                                                    return value;
                                                }else if (path.split(".").pop() === "attributes" && (!value.data) && (!value.items)){
                                                    console.log("fired2");
                                                   console.log("attributes: ", value)
                                                    return value; 
                                                   
                                                } else {
                                                    recursiveSearch(value);
                                                }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
                                            }
                                            else { 
                                                return value
                                                    }
                                        //         if(key==="properties" && !objPath.data && (properties.value !== response.split("/").pop())){
                                        //             schemaOut.properties = "1243";
                                        //         }        
                                        //     }else if(typeof value === 'object'){
                                        //       recursiveSearch(objPath, searchKey);
                                        //    }
                                        // });
                                     })};
                                     let result = recursiveSearch(resp200);
                                    //  console.log("result: ",result)
                                    //  console.log("recurs -->",recursiveSearch(resp200,searchKey));


                                                  //string.split(/-(.*)/)[1]
            //  %% 1.Mailchimp  Responses."200".content.application/json.schema.properties.batchesOrCampaigns.items.properties
            //  %% 2.Personio Responses."200".content.application/json.schema.$ref
            //  %% 3.Meisterplan Responses."200".schema.$ref
            //  %% 4.Asana Responses."200".content.application/json.schema.properties.data.items.$ref
            // end of the road -- means no data, no items , no schema etc.