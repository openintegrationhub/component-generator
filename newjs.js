module.exports = `{
    "200": {
        "description": "",
        "schema": {
            "type": "object",
            "title": "Orders",
            "description": "A collection of orders in an account.",
            "properties": {
                "orders": {
                    "type": "array",
                    "title": "Orders",
                    "description": "An array of objects, each representing an order resource.",
                    "items": {
                        "type": "object",
                        "title": "E-commerce Order",
                        "description": "Information about a specific order.",
                        "properties": {
                            "id": {
                                "type": "string",
                                "title": "Order Foreign ID",
                                "description": "A unique identifier for the order.",
                                "readOnly": true
                            },
                            "customer": {
                                "type": "object",
                                "title": "E-commerce Customer",
                                "description": "Information about a specific customer.",
                                "properties": {
                                    "id": {
                                        "type": "string",
                                        "title": "Customer Foreign ID",
                                        "description": "A unique identifier for the customer.",
                                        "readOnly": true
                                    }}}}}}}}}} 
                                    `