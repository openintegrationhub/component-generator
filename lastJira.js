module.exports = `{"200": {
    "description": "Returned if the request is successful.",
    "content": {
    "application/json": {
    "schema": {
    "type": "array",
    "items": {
    "$ref": "#/components/schemas/ApplicationProperty"
    }
    },
    "example": "[{\"id\":\"jira.home\",\"key\":\"jira.home\",\"value\":\"/var/jira/jira-home\",\"name\":\"jira.home\",\"desc\":\"Jira home directory\",\"type\":\"string\",\"defaultValue\":\"\"},{\"id\":\"jira.clone.prefix\",\"key\":\"jira.clone.prefix\",\"value\":\"CLONE -\",\"name\":\"The prefix added to the Summary field of cloned issues\",\"type\":\"string\",\"defaultValue\":\"CLONE -\"}]"
    }
    }
    }}`