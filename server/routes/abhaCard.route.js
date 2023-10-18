'use strict';
module.exports = {
  plugin: {
    async register(server, options) {
      const API = require('api/abhaCard.api');
      server.route([
        {
          method: 'GET',
          path: '/card',
          options: {
            auth: 'auth',
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
              // validate: API.getAbhaCard.validate,
              pre: API.getAbhaCard.pre,
            handler: API.getAbhaCard.handler,
          },
        },
        {
          method: 'POST',
          path: '/generate-otp',
          options: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
            },
            tags: ['api', 'abhaCard'],
            description: 'get otp',
            notes: 'get otp',
            validate: API.getOtp.validate,
            pre: API.getOtp.pre,
            handler: API.getOtp.handler,
          },
        },
        {
          method: 'POST',
          path: '/verify-otp',
          options: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
            },
            tags: ['api', 'abhaCard'],
            description: 'verify otp',
            notes: 'verify otp',
            validate: API.verifyOtp.validate,
            pre: API.verifyOtp.pre,
            handler: API.verifyOtp.handler,
          },
        },
      ]);
    },
    version: require('../../package.json').version,
    name: 'abha-routes',
  },
};
