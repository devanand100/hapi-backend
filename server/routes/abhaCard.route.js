'use strict'
module.exports = {
    plugin:{
    async register (server, options)  {
        const API = require('api/abhaCard.api');
        server.route([
            { 
                method:"GET",
                path:"/Card",
                options:{
                    auth:'auth',
                    plugins: {
                        policies: ['log.policy'],
                        'hapi-swagger': {
                            security: [
                              {
                                ApiKeyAuth: [],
                              },
                            ],
                          },
                      },
                      tags: ['api', 'abhaCard'],
                      description: 'get AbhaCard',
                      notes: 'get AbhaCard',
                    //   validate: API.getAbhaCard.validate,
                    //   pre: API.getAbhaCard.pre,
                      handler: API.getAbhaCard.handler,
                }
            }
        ])
    } ,
     version: require('../../package.json').version,
    name: 'abha-routes',
    },
    
}