'use strict'
module.exports = {
    plugin:{
    async register (server, options)  {
        const API = require('api/consult.api');
        server.route([
            { 
                method:"POST",
                path:"/save",
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
                      tags: ['api', 'consulting'],
                      description: 'saving consulting',
                      notes: 'saving consulting',
                      validate: API.addConsultion.validate,
                      pre: API.addConsultion.pre,
                      handler: API.addConsultion.handler,
                }
            },{
                 
                method:"GET",
                path:"/count",
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
                      tags: ['api', 'consulting'],
                      description: 'get consult count',
                      notes: 'get consult count',
                    //   validate: API.getAbhaCard.validate,
                    //   pre: API.getAbhaCard.pre,
                      handler: API.consultionsCount.handler,
                }
            }
        ])
    } ,
     version: require('../../package.json').version,
    name: 'consult-routes',
    },
    
}