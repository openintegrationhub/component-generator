function addInterceptor () {
    path=$1
    for entry in "$path"/*; do
    echo $entry
    sed -i -e '/parameters: parameters,/a\'$'\n''\    requestInterceptor: (req) =>  { \'$'\n''\      req.headers["Content-Type"] = "application/json"; \'$'\n''\      return req; \'$'\n''\    },\'$'\n' $entry
    rm $entry-e
    done
}
function runScript () {
    snapshotKey=$1
    componentName=$2
    url=$3
    branchName=$4
    node bin/oih-gen.js -s $snapshotKey -o ./generation-bin -n $componentName $url
    if [ $componentName == sevdesk-contacts-component ] || [ $componentName == sevdesk-inventory-component ] || [ $componentName == sevdesk-order-component ]
    then
    addInterceptor generation-bin/$componentName/lib/triggers
    addInterceptor generation-bin/$componentName/lib/actions

    else 
    echo "done"
    fi
    
    cp -r generation-bin/$componentName/lib ../components/$componentName
    cp generation-bin/$componentName/package.json ../components/$componentName
    cp generation-bin/$componentName/component.json ../components/$componentName
    cd ..
    cd components/$componentName
    git branch $branchName
    git checkout $branchName
    git add .
    git commit -m "New generated version"
    git push origin $branchName
    gh auth login --with-token < token.txt
    gh pr create --title "New generated version" --body "A new feature is added" --reviewer russojrv
    cd ../../component-generator
}


onoff=off
cmd=(dialog --output-fd 1 --separate-output --extra-button --extra-label 'Select All' --cancel-label 'Select None' --checklist 'Choose the components you wish to generate:' 44 90 20)
    options=(
                1 'mailchimp-component' $onoff
                2 'slack-component' $onoff
                3 'jira-component' $onoff
                4 'weclapp-component' $onoff
                5 'sevdesk-contacts-component' $onoff
                6 'sevdesk-inventory-component' $onoff
                7 'sevdesk-order-component' $onoff
                8 'maccoa-component' $onoff
                9 'meisterplan-component' $onoff
                10 'trello-component' $onoff
                11 'shopify-component' $onoff
                12 'apacta-component' $onoff
                13 'clickup-component' $onoff
                14 'asana-component' $onoff
                15 'outsmart-component' $onoff
                16 'personio-component' $onoff
                17 'placetel-component' $onoff
                18 'samdock-component' $onoff
                19 'sage-people-component' $onoff
                20 'sage-accounting-component' $onoff
                21 'sipgate-component' $onoff
                22 'pipedrive-component' $onoff
                23 'stripe-component' $onoff
                24 'miro-component' $onoff                    
    )
    choices=$("${cmd[@]}" "${options[@]}")
exit_code="$?"
while [[ $exit_code -ne 0 ]]; do
case $exit_code in
    1) clear; onoff=off; load-dialog;;
    3) clear; onoff=on; load-dialog;;
esac
exit_code="$?"
done
clear
echo "Type the name of the branch you want to create a github PR from, followed by [ENTER]:"

read branchName

for choice in $choices
do
    case $choice in
        1)  
            runScript updated_at mailchimp-component https://api.mailchimp.com/schema/3.0/Swagger.json\?expand $branchName
            ;;
        2) 
            runScript updated slack-component https://raw.githubusercontent.com/openintegrationhub/slack-component/main/lib/spec.json $branchName
            ;;
        3) 
            runScript updated jira-component https://developer.atlassian.com/cloud/jira/platform/swagger-v3.v3.json $branchName
            ;;
        4) 
            runScript lastModifiedDate weclapp-component https://raw.githubusercontent.com/CloudEcosystemDev/weclapp-component/main/lib/spec.json $branchName
            ;;
        5) 
            runScript update sevdesk-contacts-component https://raw.githubusercontent.com/openintegrationhub/sevdesk-contacts-component/main/lib/spec.json $branchName
            ;;
        6) 
            runScript update sevdesk-inventory-component https://raw.githubusercontent.com/openintegrationhub/sevdesk-inventory-component/master/lib/spec.json $branchName
            ;;
        7) 
            runScript update sevdesk-order-component https://raw.githubusercontent.com/openintegrationhub/sevdesk-order-component/master/lib/spec.json $branchName
            ;;
        8) 
            runScript updated_at maccoa-component https://raw.githubusercontent.com/openintegrationhub/macooa-component/master/lib/spec.json $branchName
            ;;
        9) 
            runScript finish meisterplan-component https://api.eu.meisterplan.com/swagger.json $branchName
            ;;
        10) 
            runScript lastModifiedDate trello-component https://raw.githubusercontent.com/APIs-guru/unofficial_openapi_specs/master/trello.com/1.0/swagger.yaml $branchName
            ;;
        11) 
            runScript updated_at shopify-component https://raw.githubusercontent.com/allengrant/shopify_openapi/master/shopify_openapi.json $branchName
            ;;
        12) 
            runScript modified apacta-component https://raw.githubusercontent.com/openintegrationhub/apacta-component/master/lib/spec.json $branchName
            ;;
        13) 
            runScript date_updated clickup-component https://raw.githubusercontent.com/openintegrationhub/apacta-component/master/lib/spec.json $branchName
            ;;
        14) 
            runScript modified_at asana-component https://raw.githubusercontent.com/Asana/developer-docs/master/defs/asana_oas.yaml $branchName
            ;;
        15) 
            runScript pre_timestamp_modified outsmart-component https://raw.githubusercontent.com/CloudEcosystemDev/outsmart-component/master/lib/spec.json $branchName
            ;;
        16) 
            runScript last_modified_at personio-component https://raw.githubusercontent.com/personio/api-docs/master/personio-personnel-data-api.yaml $branchName
            ;;
        17) 
            runScript updated_at placetel-component https://raw.githubusercontent.com/CloudEcosystemDev/Placetel-component/main/lib/spec.json $branchName
            ;;
        18) 
            runScript updatedAt samdock-component https://raw.githubusercontent.com/CloudEcosystemDev/samdock-component/main/lib/spec.json $branchName
            ;;
        19) 
            runScript startDate sage-people-component file:///Users/ioannislafiotis/Downloads/openapi.json $branchName
            ;;
        20) 
            runScript updated_at sage-accounting-component file:///Users/ioannislafiotis/Downloads/swagger.full.json $branchName
            ;;
        21) 
            runScript lastModified sipgate-component https://api.sipgate.com/v2/swagger.json $branchName
            ;;
        22) 
            runScript update_time pipedrive-component https://developers.pipedrive.com/docs/api/v1/openapi.yaml $branchName
            ;;
        23) 
            runScript updated stripe-component https://raw.githubusercontent.com/CloudEcosystemDev/stripe-component/main/lib/spec.json $branchName
            ;;
        24)  
            runScript modifiedAt miro-component https://developers.miro.com/openapi/5f8d7f6a34ac11001889fc6e $branchName
            ;;
    esac
done
sleep infinity




# runScript ($snapshotKey,$componentName,$url) {
#     node bin/oih-gen.js -s modifiedAt -o ./generation-bin -n miro-component https://developers.miro.com/openapi/5f8d7f6a34ac11001889fc6e  
# }
