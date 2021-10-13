# <p align="center" width="100%"> <img src="./logo.png" width="250" height="250"> </p> 
# <p align="center" width="100%"> Pipedrive API v1 OIH Connector </p>

## Description

A generated OIH connector for the Pipedrive API v1 API (version 1.0.0).

Generated from: https://developers.pipedrive.com/docs/api/v1/openapi.yaml<br/>
Generated at: 2021-10-13T12:26:11+02:00

## API Description

<br/>

## Authorization

Supported authorization schemes:
- API Key

- OAuth2 - For more information, see https://pipedrive.readme.io/docs/marketplace-oauth-authorization

For OAuth 2.0 you need to specify OAuth Client credentials as environment variables in the connector repository:
* `OAUTH_CLIENT_ID` - your OAuth client id
* `OAUTH_CLIENT_SECRET` - your OAuth client secret

## Actions

### Delete multiple Activities in bulk
> Marks multiple Activities as deleted<br/>

*Tags:* `Activities`

#### Input Parameters
* `ids` - _required_ - Comma-separated IDs of Activities that will be deleted<br/>

### Add an Activity
> Adds a new Activity. Includes `more_activities_scheduled_in_context` property in response's `additional_data` which indicates whether there are more undone Activities scheduled with the same Deal, Person or Organization (depending on the supplied data). For more information on how to add an Activity, see <a href="https://pipedrive.readme.io/docs/adding-an-activity" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `Activities`

### Delete an Activity
> Deletes an Activity<br/>

*Tags:* `Activities`

#### Input Parameters
* `id` - _required_ - The ID of the Activity<br/>

### Get details of an Activity
> Returns details of a specific Activity<br/>

*Tags:* `Activities`

#### Input Parameters
* `id` - _required_ - The ID of the Activity<br/>

### Edit an Activity
> Modifies an Activity. Includes `more_activities_scheduled_in_context` property in response's `additional_data` which indicates whether there are more undone activities scheduled with the same Deal, Person or Organization (depending on the supplied data).<br/>

*Tags:* `Activities`

#### Input Parameters
* `id` - _required_ - The ID of the Activity<br/>

### Delete multiple ActivityTypes in bulk
> Marks multiple ActivityTypes as deleted.<br/>

*Tags:* `ActivityTypes`

#### Input Parameters
* `ids` - _required_ - Comma-separated ActivityType IDs<br/>

### Add new ActivityType
> Adds a new ActivityType and returns it upon success.<br/>

*Tags:* `ActivityTypes`

### Delete an ActivityType
> Marks an ActivityType as deleted.<br/>

*Tags:* `ActivityTypes`

#### Input Parameters
* `id` - _required_ - The ID of the ActivityType<br/>

### Edit an ActivityType
> Updates an ActivityType.<br/>

*Tags:* `ActivityTypes`

#### Input Parameters
* `id` - _required_ - The ID of the ActivityType<br/>

### Add a call log
> Adds a new call log<br/>

*Tags:* `CallLogs`

### Delete a call log
> Deletes a call log. If there is an audio recording attached to it, it will also be deleted. The related activity will not be removed by this request. If you want to remove the related activities, please use the endpoint which is specific for activities.<br/>

*Tags:* `CallLogs`

#### Input Parameters
* `id` - _required_ - The ID received when you create the call log<br/>

### Get details of a call log
> Returns details of a specific call log<br/>

*Tags:* `CallLogs`

#### Input Parameters
* `id` - _required_ - The ID received when you create the call log<br/>

### Attach an audio file to the call log
> Adds an audio recording to the call log. That audio can be played by those who have access to the call log object.<br/>

*Tags:* `CallLogs`

#### Input Parameters
* `id` - _required_ - The ID received when you create the call log<br/>

### Add a deal
> Adds a new deal. Note that you can supply additional custom fields along with the request that are not described here. These custom fields are different for each Pipedrive account and can be recognized by long hashes as keys. To determine which custom fields exists, fetch the dealFields and look for `key` values. For more information on how to add a deal, see <a href="https://pipedrive.readme.io/docs/creating-a-deal" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `Deals`

### Delete multiple deals in bulk
> Marks multiple deals as deleted.<br/>

*Tags:* `Deals`

#### Input Parameters
* `ids` - _required_ - Comma-separated IDs that will be deleted<br/>

### Delete a deal
> Marks a deal as deleted.<br/>

*Tags:* `Deals`

#### Input Parameters
* `id` - _required_ - ID of the deal<br/>

### Get details of a deal
> Returns details of a specific deal. Note that this also returns some additional fields which are not present when asking for all deals - such as deal age and stay in pipeline stages. Also note that custom fields appear as long hashes in the resulting data. These hashes can be mapped against the `key` value of dealFields. For more information on how to get all details of a deal, see <a href="https://pipedrive.readme.io/docs/getting-details-of-a-deal" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `Deals`

#### Input Parameters
* `id` - _required_ - ID of the deal<br/>

### Update a deal
> Updates the properties of a deal. For more information on how to update a deal, see <a href="https://pipedrive.readme.io/docs/updating-a-deal" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `Deals`

#### Input Parameters
* `id` - _required_ - ID of the deal<br/>

### Duplicate deal
> Duplicate a deal<br/>

*Tags:* `Deals`

#### Input Parameters
* `id` - _required_ - ID of the deal<br/>

### Add a follower to a deal
> Adds a follower to a deal.<br/>

*Tags:* `Deals`

#### Input Parameters
* `id` - _required_ - ID of the deal<br/>

### Delete a follower from a deal
> Deletes a follower from a deal.<br/>

*Tags:* `Deals`

#### Input Parameters
* `id` - _required_ - ID of the deal<br/>
* `follower_id` - _required_ - ID of the follower<br/>

### Merge two deals
> Merges a deal with another deal. For more information on how to merge two deals, see <a href="https://pipedrive.readme.io/docs/merging-two-deals" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `Deals`

#### Input Parameters
* `id` - _required_ - ID of the deal<br/>

### Add a participant to a deal
> Adds a participant to a deal.<br/>

*Tags:* `Deals`

#### Input Parameters
* `id` - _required_ - ID of the deal<br/>

### Delete a participant from a deal
> Deletes a participant from a deal.<br/>

*Tags:* `Deals`

#### Input Parameters
* `id` - _required_ - ID of the deal<br/>
* `deal_participant_id` - _required_ - ID of the deal participant<br/>

### Add a product to the deal, eventually creating a new item called a deal-product
> Adds a product to the deal.<br/>

*Tags:* `Deals`

#### Input Parameters
* `id` - _required_ - ID of the deal<br/>

### Update product attachment details of the deal-product (a product already attached to a deal)
> Updates product attachment details.<br/>

*Tags:* `Deals`

#### Input Parameters
* `id` - _required_ - ID of the deal<br/>
* `product_attachment_id` - _required_ - ID of the deal-product (the ID of the product attached to the deal)<br/>

### Delete an attached product from a deal
> Deletes a product attachment from a deal, using the `product_attachment_id`.<br/>

*Tags:* `Deals`

#### Input Parameters
* `id` - _required_ - ID of the deal<br/>
* `product_attachment_id` - _required_ - Product attachment ID. This is returned as `product_attachment_id` after attaching a product to a deal or as id when listing the products attached to a deal.<br/>

### Add a new deal field
> Adds a new deal field. For more information on adding a new custom field, see <a href="https://pipedrive.readme.io/docs/adding-a-new-custom-field" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `DealFields`

### Delete multiple deal fields in bulk
> Marks multiple fields as deleted.<br/>

*Tags:* `DealFields`

#### Input Parameters
* `ids` - _required_ - Comma-separated field IDs to delete<br/>

### Get one deal field
> Returns data about a specific deal field.<br/>

*Tags:* `DealFields`

#### Input Parameters
* `id` - _required_ - ID of the field<br/>

### Delete a deal field
> Marks a field as deleted. For more information on how to delete a custom field, see <a href="https://pipedrive.readme.io/docs/deleting-a-custom-field" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `DealFields`

#### Input Parameters
* `id` - _required_ - ID of the field<br/>

### Update a deal field
> Updates a deal field. See an example of updating custom fields' values in <a href=" https://pipedrive.readme.io/docs/updating-custom-field-value " target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `DealFields`

#### Input Parameters
* `id` - _required_ - ID of the field<br/>

### Add file
> Lets you upload a file and associate it with Deal, Person, Organization, Activity or Product. For more information on how to add a file, see <a href="https://pipedrive.readme.io/docs/adding-a-file" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `Files`

### Create a remote file and link it to an item
> Creates a new empty file in the remote location (`googledrive`) that will be linked to the item you supply. For more information on how to add a remote file, see <a href="https://pipedrive.readme.io/docs/adding-a-remote-file" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `Files`

### Link a remote file to an item
> Links an existing remote file (`googledrive`) to the item you supply. For more information on how to link a remote file, see <a href="https://pipedrive.readme.io/docs/adding-a-remote-file" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `Files`

### Delete a file
> Marks a file as deleted.<br/>

*Tags:* `Files`

#### Input Parameters
* `id` - _required_ - ID of the file<br/>

### Get one file
> Returns data about a specific file.<br/>

*Tags:* `Files`

#### Input Parameters
* `id` - _required_ - ID of the file<br/>

### Update file details
> Updates the properties of a file.<br/>

*Tags:* `Files`

#### Input Parameters
* `id` - _required_ - ID of the file<br/>

### Delete multiple filters in bulk
> Marks multiple filters as deleted.<br/>

*Tags:* `Filters`

#### Input Parameters
* `ids` - _required_ - Comma-separated filter IDs to delete<br/>

### Add a new filter
> Adds a new filter, returns the ID upon success. Note that in the conditions JSON object only one first-level condition group is supported, and it must be glued with 'AND', and only two second level condition groups are supported of which one must be glued with 'AND' and the second with 'OR'. Other combinations do not work (yet) but the syntax supports introducing them in future. For more information on how to add a new filter, see <a href="https://pipedrive.readme.io/docs/adding-a-filter" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `Filters`

### Delete a filter
> Marks a filter as deleted.<br/>

*Tags:* `Filters`

#### Input Parameters
* `id` - _required_ - The ID of the filter<br/>

### Get one filter
> Returns data about a specific filter. Note that this also returns the condition lines of the filter.<br/>

*Tags:* `Filters`

#### Input Parameters
* `id` - _required_ - The ID of the filter<br/>

### Update filter
> Updates an existing filter.<br/>

*Tags:* `Filters`

#### Input Parameters
* `id` - _required_ - The ID of the filter<br/>

### Dismiss a global message
> Removes global message from being shown, if message is dismissible<br/>

*Tags:* `GlobalMessages`

#### Input Parameters
* `id` - _required_ - ID of global message to be dismissed.<br/>

### Add a new goal
> Adds a new goal. Along with adding a new goal, a report is created to track the progress of your goal.<br/>

*Tags:* `Goals`

### Update existing goal
> Updates existing goal.<br/>

*Tags:* `Goals`

#### Input Parameters
* `id` - _required_ - ID of the goal to be updated.<br/>

### Delete existing goal
> Marks goal as deleted.<br/>

*Tags:* `Goals`

#### Input Parameters
* `id` - _required_ - ID of the goal to be deleted.<br/>

### Add a lead
> Creates a Lead. A Lead always has to be linked to a Person or an Organization or both. All Leads created through the Pipedrive API will have a Lead Source `API` assigned. Here's the tutorial for <a href="https://pipedrive.readme.io/docs/adding-a-lead" target="_blank" rel="noopener noreferrer">adding a Lead</a>. If a Lead contains custom fields, the fields' values will be included in the response in the same format as with the `Deals` endpoints. If a custom field's value hasn't been set for the Lead, it won't appear in the response. Please note that Leads do not have a separate set of custom fields, instead they inherit the custom fields' structure from Deals. See an example given in the <a href="https://pipedrive.readme.io/docs/updating-custom-field-value" target="_blank" rel="noopener noreferrer">updating custom fields' values tutorial</a>.<br/>

*Tags:* `Leads`

### Get one lead
> Returns details of a specific Lead. If a Lead contains custom fields, the fields' values will be included in the response in the same format as with the `Deals` endpoints. If a custom field's value hasn't been set for the Lead, it won't appear in the response. Please note that Leads do not have a separate set of custom fields, instead they inherit the custom fields' structure from Deals.<br/>

*Tags:* `Leads`

#### Input Parameters
* `id` - _required_ - The ID of the Lead<br/>

### Update a lead
> Updates one or more properties of a Lead. Only properties included in the request will be updated. Send `null` to unset a property (applicable for example for `value`, `person_id` or `organization_id`). If a Lead contains custom fields, the fields' values will be included in the response in the same format as with the `Deals` endpoints. If a custom field's value hasn't been set for the Lead, it won't appear in the response. Please note that Leads do not have a separate set of custom fields, instead they inherit the custom fields' structure from Deals. See an example of updating custom fields' values in <a href="https://pipedrive.readme.io/docs/updating-custom-field-value" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `Leads`

#### Input Parameters
* `id` - _required_ - The ID of the Lead<br/>

### Delete a lead
> Deletes a specific Lead<br/>

*Tags:* `Leads`

#### Input Parameters
* `id` - _required_ - The ID of the Lead<br/>

### Add a lead label
> Creates a Lead Label<br/>

*Tags:* `LeadLabels`

### Update a lead label
> Updates one or more properties of a Lead Label. Only properties included in the request will be updated.<br/>

*Tags:* `LeadLabels`

#### Input Parameters
* `id` - _required_ - The ID of the Lead Label<br/>

### Delete a lead label
> Deletes a specific Lead Label<br/>

*Tags:* `LeadLabels`

#### Input Parameters
* `id` - _required_ - The ID of the Lead Label<br/>

### Get one mail message
> Returns data about specific mail message.<br/>

*Tags:* `Mailbox`

#### Input Parameters
* `id` - _required_ - ID of the mail message to fetch.<br/>
* `include_body` - _optional_ - Whether to include full message body or not. `0` = Don't include, `1` = Include<br/>
    Possible values: 0, 1.

### Delete mail thread
> Marks mail thread as deleted.<br/>

*Tags:* `Mailbox`

#### Input Parameters
* `id` - _required_ - ID of the mail thread<br/>

### Get one mail thread
> Returns specific mail thread.<br/>

*Tags:* `Mailbox`

#### Input Parameters
* `id` - _required_ - ID of the mail thread<br/>

### Update mail thread details
> Updates the properties of a mail thread.<br/>

*Tags:* `Mailbox`

#### Input Parameters
* `id` - _required_ - ID of the mail thread<br/>

### Add a note
> Adds a new note.<br/>

*Tags:* `Notes`

### Delete a note
> Deletes a specific note.<br/>

*Tags:* `Notes`

#### Input Parameters
* `id` - _required_ - ID of the note<br/>

### Get one note
> Returns details about a specific note.<br/>

*Tags:* `Notes`

#### Input Parameters
* `id` - _required_ - ID of the note<br/>

### Update a note
> Updates a note.<br/>

*Tags:* `Notes`

#### Input Parameters
* `id` - _required_ - ID of the note<br/>

### Add a comment to a note
> Adds a new comment to a note.<br/>

*Tags:* `Notes`

#### Input Parameters
* `id` - _required_ - ID of the note<br/>

### Get one comment
> Returns details about a comment<br/>

*Tags:* `Notes`

#### Input Parameters
* `id` - _required_ - ID of the note<br/>
* `commentId` - _required_ - ID of the comment<br/>

### Update a comment related to a note
> Updates a comment related to a note.<br/>

*Tags:* `Notes`

#### Input Parameters
* `id` - _required_ - ID of the note<br/>
* `commentId` - _required_ - ID of the comment<br/>

### Delete a comment related to a note
> Deletes a comment.<br/>

*Tags:* `Notes`

#### Input Parameters
* `id` - _required_ - ID of the note<br/>
* `commentId` - _required_ - ID of the comment<br/>

### Delete multiple organizations in bulk
> Marks multiple organizations as deleted.<br/>

*Tags:* `Organizations`

#### Input Parameters
* `ids` - _required_ - Comma-separated IDs that will be deleted<br/>

### Add an organization
> Adds a new organization. Note that you can supply additional custom fields along with the request that are not described here. These custom fields are different for each Pipedrive account and can be recognized by long hashes as keys. To determine which custom fields exists, fetch the organizationFields and look for `key` values. For more information on how to add an organization, see <a href="https://pipedrive.readme.io/docs/adding-an-organization" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `Organizations`

### Delete an organization
> Marks an organization as deleted.<br/>

*Tags:* `Organizations`

#### Input Parameters
* `id` - _required_ - The ID of the Organization<br/>

### Get details of an organization
> Returns details of an organization. Note that this also returns some additional fields which are not present when asking for all organizations. Also note that custom fields appear as long hashes in the resulting data. These hashes can be mapped against the `key` value of organizationFields.<br/>

*Tags:* `Organizations`

#### Input Parameters
* `id` - _required_ - The ID of the Organization<br/>

### Update an organization
> Updates the properties of an organization.<br/>

*Tags:* `Organizations`

#### Input Parameters
* `id` - _required_ - The ID of the Organization<br/>

### Add a follower to an organization
> Adds a follower to an organization.<br/>

*Tags:* `Organizations`

#### Input Parameters
* `id` - _required_ - The ID of the Organization<br/>

### Delete a follower from an organization
> Deletes a follower from an organization. You can retrieve the `follower_id` from the <a href="https://developers.pipedrive.com/docs/api/v1/Organizations#getOrganizationFollowers">List followers of an organization</a> endpoint.<br/>

*Tags:* `Organizations`

#### Input Parameters
* `id` - _required_ - The ID of the Organization<br/>
* `follower_id` - _required_ - The ID of the follower<br/>

### Merge two organizations
> Merges an organization with another organization. For more information on how to merge two organizations, see <a href="https://pipedrive.readme.io/docs/merging-two-organizations" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `Organizations`

#### Input Parameters
* `id` - _required_ - The ID of the Organization<br/>

### Add a new organization field
> Adds a new organization field. For more information on adding a new custom field, see <a href="https://pipedrive.readme.io/docs/adding-a-new-custom-field" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `OrganizationFields`

### Delete multiple organization fields in bulk
> Marks multiple fields as deleted.<br/>

*Tags:* `OrganizationFields`

#### Input Parameters
* `ids` - _required_ - Comma-separated field IDs to delete<br/>

### Get one organization field
> Returns data about a specific organization field.<br/>

*Tags:* `OrganizationFields`

#### Input Parameters
* `id` - _required_ - ID of the field<br/>

### Delete an organization field
> Marks a field as deleted. For more information on how to delete a custom field, see <a href="https://pipedrive.readme.io/docs/deleting-a-custom-field" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `OrganizationFields`

#### Input Parameters
* `id` - _required_ - ID of the field<br/>

### Update an organization field
> Updates an organization field. See an example of updating custom fields' values in <a href=" https://pipedrive.readme.io/docs/updating-custom-field-value " target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `OrganizationFields`

#### Input Parameters
* `id` - _required_ - ID of the field<br/>

### Create an organization relationship
> Creates and returns an organization relationship.<br/>

*Tags:* `OrganizationRelationships`

### Delete an organization relationship
> Deletes an organization relationship and returns the deleted id.<br/>

*Tags:* `OrganizationRelationships`

#### Input Parameters
* `id` - _required_ - ID of the organization relationship<br/>

### Get one organization relationship
> Finds and returns an organization relationship from its ID.<br/>

*Tags:* `OrganizationRelationships`

#### Input Parameters
* `id` - _required_ - ID of the organization relationship<br/>
* `org_id` - _optional_ - ID of the base organization for the returned calculated values<br/>

### Update an organization relationship
> Updates and returns an organization relationship.<br/>

*Tags:* `OrganizationRelationships`

#### Input Parameters
* `id` - _required_ - ID of the organization relationship<br/>

### Get one Permission Set

*Tags:* `PermissionSets`

#### Input Parameters
* `id` - _required_ - ID of the permission set<br/>

### Delete multiple persons in bulk
> Marks multiple persons as deleted.<br/>

*Tags:* `Persons`

#### Input Parameters
* `ids` - _optional_ - Comma-separated IDs that will be deleted<br/>

### Add a person
> Adds a new person. Note that you can supply additional custom fields along with the request that are not described here. These custom fields are different for each Pipedrive account and can be recognized by long hashes as keys. To determine which custom fields exists, fetch the personFields and look for `key` values.<br/>

*Tags:* `Persons`

### Delete a person
> Marks a person as deleted.<br/>

*Tags:* `Persons`

#### Input Parameters
* `id` - _required_ - ID of a person<br/>

### Get details of a person
> Returns details of a person. Note that this also returns some additional fields which are not present when asking for all persons. Also note that custom fields appear as long hashes in the resulting data. These hashes can be mapped against the `key` value of personFields.<br/>

*Tags:* `Persons`

#### Input Parameters
* `id` - _required_ - ID of a person<br/>

### Update a person
> Updates the properties of a person. For more information on how to update a person, see <a href="https://pipedrive.readme.io/docs/updating-a-person" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `Persons`

#### Input Parameters
* `id` - _required_ - ID of a person<br/>

### Add a follower to a person
> Adds a follower to a person.<br/>

*Tags:* `Persons`

#### Input Parameters
* `id` - _required_ - ID of a person<br/>

### Deletes a follower from a person.
> Delete a follower from a person<br/>

*Tags:* `Persons`

#### Input Parameters
* `id` - _required_ - ID of a person<br/>
* `follower_id` - _required_ - ID of the follower<br/>

### Merge two persons
> Merges a person with another person. For more information on how to merge two persons, see <a href="https://pipedrive.readme.io/docs/merging-two-persons" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `Persons`

#### Input Parameters
* `id` - _required_ - ID of a person<br/>

### Delete person picture

*Tags:* `Persons`

#### Input Parameters
* `id` - _required_ - ID of a person<br/>

### Add person picture
> Add a picture to a person. If a picture is already set, the old picture will be replaced. Added image (or the cropping parameters supplied with the request) should have an equal width and height and should be at least 128 pixels. GIF, JPG and PNG are accepted. All added images will be resized to 128 and 512 pixel wide squares.<br/>

*Tags:* `Persons`

#### Input Parameters
* `id` - _required_ - ID of a person<br/>

### Add a new person field
> Adds a new person field. For more information on adding a new custom field, see <a href="https://pipedrive.readme.io/docs/adding-a-new-custom-field" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `PersonFields`

### Delete multiple person fields in bulk
> Marks multiple fields as deleted.<br/>

*Tags:* `PersonFields`

#### Input Parameters
* `ids` - _required_ - Comma-separated field IDs to delete<br/>

### Get one person field
> Returns data about a specific person field.<br/>

*Tags:* `PersonFields`

#### Input Parameters
* `id` - _required_ - ID of the field<br/>

### Delete a person field
> Marks a field as deleted. For more information on how to delete a custom field, see <a href="https://pipedrive.readme.io/docs/deleting-a-custom-field" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `PersonFields`

#### Input Parameters
* `id` - _required_ - ID of the field<br/>

### Update a person field
> Updates a person field. See an example of updating custom fields' values in <a href=" https://pipedrive.readme.io/docs/updating-custom-field-value " target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `PersonFields`

#### Input Parameters
* `id` - _required_ - ID of the field<br/>

### Add a new pipeline
> Adds a new pipeline<br/>

*Tags:* `Pipelines`

### Delete a pipeline
> Marks a pipeline as deleted.<br/>

*Tags:* `Pipelines`

#### Input Parameters
* `id` - _required_ - ID of the pipeline<br/>

### Get one pipeline
> Returns data about a specific pipeline. Also returns the summary of the deals in this pipeline across its stages.<br/>

*Tags:* `Pipelines`

#### Input Parameters
* `id` - _required_ - ID of the pipeline<br/>
* `totals_convert_currency` - _optional_ - 3-letter currency code of any of the supported currencies. When supplied, `per_stages_converted` is returned in `deals_summary` which contains the currency-converted total amounts in the given currency per each stage. You may also set this parameter to `default_currency` in which case users default currency is used.<br/>

### Edit a pipeline
> Updates pipeline properties<br/>

*Tags:* `Pipelines`

#### Input Parameters
* `id` - _required_ - ID of the pipeline<br/>

### Add a product
> Adds a new product to the Products inventory. For more information on how to add a product, see <a href="https://pipedrive.readme.io/docs/adding-a-product" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `Products`

### Delete a product
> Marks a product as deleted.<br/>

*Tags:* `Products`

#### Input Parameters
* `id` - _required_ - ID of the product<br/>

### Get one product
> Returns data about a specific product.<br/>

*Tags:* `Products`

#### Input Parameters
* `id` - _required_ - ID of the product<br/>

### Update a product
> Updates product data.<br/>

*Tags:* `Products`

#### Input Parameters
* `id` - _required_ - ID of the product<br/>

### Add a follower to a product
> Adds a follower to a product.<br/>

*Tags:* `Products`

#### Input Parameters
* `id` - _required_ - ID of the product<br/>

### Delete a follower from a product
> Deletes a follower from a product.<br/>

*Tags:* `Products`

#### Input Parameters
* `id` - _required_ - ID of the product<br/>
* `follower_id` - _required_ - ID of the follower<br/>

### Delete multiple product fields in bulk
> Marks multiple fields as deleted.<br/>

*Tags:* `ProductFields`

#### Input Parameters
* `ids` - _required_ - Comma-separated field IDs to delete<br/>

### Add a new product field
> Adds a new product field. For more information on adding a new custom field, see <a href="https://pipedrive.readme.io/docs/adding-a-new-custom-field" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `ProductFields`

### Delete a product field
> Marks a field as deleted. For more information on how to delete a custom field, see <a href="https://pipedrive.readme.io/docs/deleting-a-custom-field" target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `ProductFields`

#### Input Parameters
* `id` - _required_ - ID of the Product Field<br/>

### Get one product field
> Returns data about a specific product field.<br/>

*Tags:* `ProductFields`

#### Input Parameters
* `id` - _required_ - ID of the Product Field<br/>

### Update a product field
> Updates a product field. See an example of updating custom fields' values in <a href=" https://pipedrive.readme.io/docs/updating-custom-field-value " target="_blank" rel="noopener noreferrer">this tutorial</a>.<br/>

*Tags:* `ProductFields`

#### Input Parameters
* `id` - _required_ - ID of the Product Field<br/>

### Add a role

*Tags:* `Roles`

### Delete a role

*Tags:* `Roles`

#### Input Parameters
* `id` - _required_ - ID of the role<br/>

### Get one role

*Tags:* `Roles`

#### Input Parameters
* `id` - _required_ - ID of the role<br/>

### Update role details

*Tags:* `Roles`

#### Input Parameters
* `id` - _required_ - ID of the role<br/>

### Delete a role assignment
> Delete assignment from a role<br/>

*Tags:* `Roles`

#### Input Parameters
* `id` - _required_ - ID of the role<br/>

### Add role assignment
> Add assignment for a role<br/>

*Tags:* `Roles`

#### Input Parameters
* `id` - _required_ - ID of the role<br/>

### Add or update role setting

*Tags:* `Roles`

#### Input Parameters
* `id` - _required_ - ID of the role<br/>

### Delete multiple stages in bulk
> Marks multiple stages as deleted.<br/>

*Tags:* `Stages`

#### Input Parameters
* `ids` - _required_ - Comma-separated stage IDs to delete<br/>

### Add a new stage
> Adds a new stage, returns the ID upon success.<br/>

*Tags:* `Stages`

### Delete a stage
> Marks a stage as deleted.<br/>

*Tags:* `Stages`

#### Input Parameters
* `id` - _required_ - ID of the stage<br/>

### Get one stage
> Returns data about a specific stage.<br/>

*Tags:* `Stages`

#### Input Parameters
* `id` - _required_ - ID of the stage<br/>

### Update stage details
> Updates the properties of a stage.<br/>

*Tags:* `Stages`

#### Input Parameters
* `id` - _required_ - ID of the stage<br/>

### Get details of a subscription
> Returns details of an installment or a recurring Subscription.<br/>

*Tags:* `Subscriptions`

#### Input Parameters
* `id` - _required_ - ID of the Subscription<br/>

### Delete a subscription
> Marks an installment or a recurring Subscription as deleted.<br/>

*Tags:* `Subscriptions`

#### Input Parameters
* `id` - _required_ - ID of the Subscription<br/>

### Find subscription by deal
> Returns details of an installment or a recurring Subscription by Deal ID.<br/>

*Tags:* `Subscriptions`

#### Input Parameters
* `dealId` - _required_ - ID of the Deal<br/>

### Add a recurring subscription
> Adds a new recurring Subscription.<br/>

*Tags:* `Subscriptions`

### Add an installment subscription
> Adds a new installment Subscription.<br/>

*Tags:* `Subscriptions`

### Update a recurring subscription
> Updates a recurring Subscription.<br/>

*Tags:* `Subscriptions`

#### Input Parameters
* `id` - _required_ - ID of the Subscription<br/>

### Update an installment subscription
> Updates an installment Subscription.<br/>

*Tags:* `Subscriptions`

#### Input Parameters
* `id` - _required_ - ID of the Subscription<br/>

### Cancel a recurring subscription
> Cancels a recurring Subscription.<br/>

*Tags:* `Subscriptions`

#### Input Parameters
* `id` - _required_ - ID of the Subscription<br/>

### Add a new team
> Adds a new team to the company and returns the created object<br/>

*Tags:* `Teams`

### Get a single team
> Returns data about a specific team<br/>

*Tags:* `Teams`

#### Input Parameters
* `id` - _required_ - ID of the team<br/>
* `skip_users` - _optional_ - When enabled, the teams will not include IDs of member users<br/>
    Possible values: 0, 1.

### Update a team
> Updates an existing team and returns the updated object<br/>

*Tags:* `Teams`

#### Input Parameters
* `id` - _required_ - ID of the team<br/>

### Add users to a team
> Adds users to an existing team<br/>

*Tags:* `Teams`

#### Input Parameters
* `id` - _required_ - ID of the team<br/>

### Delete users from a team
> Deletes users from an existing team<br/>

*Tags:* `Teams`

#### Input Parameters
* `id` - _required_ - ID of the team<br/>

### Get all teams of a user
> Returns data about all teams which have specified user as a member<br/>

*Tags:* `Teams`

#### Input Parameters
* `id` - _required_ - ID of the user<br/>
* `order_by` - _optional_ - Field name to sort returned teams by<br/>
    Possible values: id, name, manager_id, active_flag.
* `skip_users` - _optional_ - When enabled, the teams will not include IDs of member users<br/>
    Possible values: 0, 1.

### Add a new user
> Adds a new user to the company, returns the ID upon success.<br/>

*Tags:* `Users`

### Get one user
> Returns data about a specific user within the company<br/>

*Tags:* `Users`

#### Input Parameters
* `id` - _required_ - ID of the user<br/>

### Update user details
> Updates the properties of a user. Currently, only `active_flag` can be updated.<br/>

*Tags:* `Users`

#### Input Parameters
* `id` - _required_ - ID of the user<br/>

### Delete a role assignment
> Delete a role assignment for a user<br/>

*Tags:* `Users`

#### Input Parameters
* `id` - _required_ - ID of the user<br/>

### Add role assignment
> Add role assignment for a user<br/>

*Tags:* `Users`

#### Input Parameters
* `id` - _required_ - ID of the user<br/>

### Create a new webhook
> Creates a new webhook and returns its details. Note that specifying an event which triggers the webhook combines 2 parameters - `event_action` and `event_object`. E.g., use `*.*` for getting notifications about all events, `added.deal` for any newly added deals, `deleted.persons` for any deleted persons, etc. See <a href="https://pipedrive.readme.io/docs/guide-for-webhooks?ref=api_reference">https://pipedrive.readme.io/docs/guide-for-webhooks</a> for more details.<br/>

*Tags:* `Webhooks`

### Delete existing webhook
> Deletes the specified webhook.<br/>

*Tags:* `Webhooks`

#### Input Parameters
* `id` - _required_ - The ID of the webhook to delete<br/>

## License

: pipedrive-component<br/>
                    <br/>

All files of this connector are licensed under the Apache 2.0 License. For details
see the file LICENSE on the toplevel directory.
