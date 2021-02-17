# ![LOGO](logo.png) <%= api.info.title %> **flow**ground Connector

## Description

A generated **flow**ground connector for the <%= api.info.title %> API (version <%= api.info.version %>).

Generated from: <%= openapiUrl %><br/>
Generated at: <%= moment().format() %>

## API Description

<%= toMD(api.info.description, {minHeaderLevel: 3}) %>

## Authorization

<%
    let schemes = api.components && api.components.securitySchemes;

    if(_.isEmpty(schemes)) {
        print('This API does not require authorization.\n');
    } else {
        print('Supported authorization schemes:\n');
    }

    let hasOauth2 = false;
    _.forOwn(schemes, (scheme, key) => {
        if (scheme.type === 'apiKey') print('- API Key\n');
        else if (scheme.type === 'http' && scheme.scheme === 'basic') print('- Basic Authentication');
        else if (scheme.type === 'http' && scheme.scheme === 'bearer') print('- Bearer Token');
        else if (scheme.type === 'oauth2') {print('- OAuth2'); hasOauth2 = true;}
        else if (scheme.type === 'openIdConnect') print('- OpenId Connect');
        else print('- ' + scheme.type);
        
        if(scheme.description) {
            print(' - ' + scheme.description);
        }
        
        print('\n');
        
    });

    if(hasOauth2) {
        print('\nFor OAuth 2.0 you need to specify OAuth Client credentials as environment variables in the connector repository:\n');
        print('* `OAUTH_CLIENT_ID` - your OAuth client id\n');
        print('* `OAUTH_CLIENT_SECRET` - your OAuth client secret\n');
    }
%>
## Actions
<%
    _.forOwn(componentJson.actions, action => {
        print('\n### ' + toText(action.$$$title) + '\n');
        if(action.$$$title !== action.$$$description && action.$$$description) {
            print(toMD(action.$$$description, {quote: true}));
            print('\n');
        }
        if(!_.isEmpty(action.$$$tags)) {
            print('\n*Tags:* ');
            print(action.$$$tags.map(tag => '`' + tag +'`').join(' '));
            print('\n');
        }
        if(!_.isEmpty(action.$$$params)) {
            print('\n#### Input Parameters\n');
            _.each(action.$$$params, param => {
                print('* `' + param.name + '` - _');
                print(param.required ? 'required' : 'optional');
                print('_');
                if(param.description) {
                    print(' - ' + toMD(param.description));
                }
                print('\n');
                if(param.schema && !_.isEmpty(param.schema.enum)) {
                    print('    Possible values: ' + param.schema.enum.join(', ') + '.\n');
                }
            });
        }

    });
%>
## License

: <%= packageName %><br/>
                    <br/>

All files of this connector are licensed under the Apache 2.0 License. For details
see the file LICENSE on the toplevel directory.
