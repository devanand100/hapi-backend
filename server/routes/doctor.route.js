'use strict'
module.exports = {
    plugin:{
    async register (server, options)  {
        const API = require('api/doctor.api');
        server.route([
            {
                method:"GET",
                path:"/specialities",
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
                      tags: ['api', 'Doctor'],
                      description: 'Doctor Specialities',
                      notes: 'Doctor Specialities',
                    //   validate: API.uniqueSpecialities.validate,
                      pre: API.uniqueSpecialities.pre,
                      handler: API.uniqueSpecialities.handler,
                }
            },{
                method:"GET",
                path:"/doctors/{speciality}",
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
                      tags: ['api', 'Doctor'],
                      description: 'Doctor by speciality',
                      notes: 'Doctor by speciality',
                      validate: API.doctorsBySpeciality.validate,
                      pre: API.doctorsBySpeciality.pre,
                      handler: API.doctorsBySpeciality.handler,
                }
            }
        ])

    } ,
     version: require('../../package.json').version,
    name: 'doctor-routes',
    },
    
}