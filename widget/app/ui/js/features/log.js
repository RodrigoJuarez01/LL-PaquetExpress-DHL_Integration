export function logRequest(requestOptions, response) {
    
    let successResponse = {};
    let rawResponse = {};
    if (response.hasOwnProperty('data')  
        && response.data.hasOwnProperty('body')
        && response.data.body.length > 1500) {

        successResponse = {
            body: response.data.body.substring(0, 1500)
        };
        if(response.data.hasOwnProperty('status_code')) {
            successResponse.status_code = response.data.status_code;
        }
        rawResponse = successResponse;
          
    } else {
        rawResponse = response;
    }


    const logOptions = {
        url: 'https://www.zohoapis.com/inventory/v1/settings/incomingwebhooks/iw_log_dhl_request/execute?auth_type=apikey&encapiKey=wSsVR60lqB%2BkXPh%2FlWakLuc6yFgEBFz2HFN63Qfy6XH%2BHaqU8I87xhbGDQGvSJ5wTjYpTWlH7dRG4VZiumph1ppClgdXZxOy9VSTd08oO1Be',
        method: "POST" ,
        header:[{
                key: 'Content-Type',
                value: 'application/json'
            },
            {
                key:'Connection',
                value:'keep-alive'
            }],
        body: {
            mode: 'raw',
            raw:{
                'options': requestOptions,
                'response': rawResponse,
                'user': currentUser || '',
                'salesorderNumber': salesorderNumber || '',
                'salesorderId': salesorderId || ''
            }
        },
        connection_link_name: inventoryConnectionLinkName
    };
    
    ZFAPPS.request(logOptions).then(function(logAPIResponse) {
        spinnerWrapper.style.display = 'none';
        console.log('Log API Response:', logAPIResponse);
        
    }).catch(function(error) {
        spinnerWrapper.style.display = 'none';
        console.log('Error on request to log: ');
        console.log(error);
        
    });
    
        
    const mockOptions = {
        url: 'https://c5a8c1af-675a-4704-ada3-d3d129aad650.mock.pstmn.io/rates',
        method: "POST" ,
        header:[{
                key: 'Content-Type',
                value: 'application/json'
            },
            {
                key:'Connection',
                value:'keep-alive'
            }],
        body: {
            mode: 'raw',
            raw:{
                'options': 'these are my options',
                
            }
        },
        connection_link_name: dhlConnectionLinkName
    };
    
    ZFAPPS.request(mockOptions).then(function(logMockResponse) {
        spinnerWrapper.style.display = 'none';
        console.log('Log MOCK Response:', logMockResponse);
        
    }).catch(function(error) {
        spinnerWrapper.style.display = 'none';
        console.log('Error on request to MOCK server: ');
        console.log(error);
        
    });



}