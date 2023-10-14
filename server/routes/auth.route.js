'use strict';
// Never take constants here
module.exports = {
  plugin: {
    async register(server, options) {
      const API = require('api/auth.api');
      server.route([
        {
          method: 'POST',
          path: '/login',
          options: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
            },
            tags: ['api', 'Authentication'],
            description: 'Login',
            notes: 'Login',
            validate: API.login.validate,
            pre: API.login.pre,
            handler: API.login.handler,
          },
        },
        {
          method: 'POST',
          path: '/signup',
          options: {
            auth: null,
            plugins: {
              policies: ['log.policy'],
            },

            tags: ['api', 'Authentication'],
            description: 'Signup',
            notes: 'Signup',
            validate: API.signup.validate,
            pre: API.signup.pre,
            handler: API.signup.handler,
          },
        },
        {
          method: 'PATCH',
          path: '/update-profile',
          options: {
            auth: 'auth',
            payload: {
              parse: true,
              multipart: {
                output: 'stream',
              },
              maxBytes: 1000 * 1000 * 50,
            },
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
            tags: ['api', 'Authentication'],
            description: 'profile update',
            pre: API.updateUser.pre,
            handler: API.updateUser.handler,
          },
        },

        {
          method: 'POST',
          path: '/admin/signUp',
          options: {
            auth: {
              strategy: 'auth',
              scope: ['ADMIN', 'SUPERADMIN'],
            },
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
            tags: ['api', 'Authentication'],
            description: 'adminSignup',
            notes: 'adminSignup',
            validate: API.adminSignUp.validate,
            pre: API.adminSignUp.pre,
            handler: API.adminSignUp.handler,
          },
        },
        {
          method: 'POST',
          path: '/superAdmin/signUp',
          options: {
            auth: {
              strategy: 'auth',
              scope: ['SUPERADMIN'],
            },
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
            tags: ['api', 'Authentication'],
            description: 'superAdminSignup',
            notes: 'superAdminSignup',
            validate: API.superAdminSignUp.validate,
            pre: API.superAdminSignUp.pre,
            handler: API.superAdminSignUp.handler,
          },
        },
        {
          method: 'GET',
          path: '/getroles',
          options: {
            auth: {
              strategy: 'auth',
              scope: ['ADMIN', 'SUPERADMIN'],
            },
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
            tags: ['api', 'Authentication'],
            description: 'getRoles',
            notes: 'getRoles',
            pre: API.fetchRoles.pre,
            handler: API.fetchRoles.handler,
          },
        },
        {
          method: 'GET',
          path: '/getCreatedUsers',
          options: {
            auth: {
              strategy: 'auth',
              scope: ['ADMIN', 'SUPERADMIN'],
            },
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
            tags: ['api', 'Authentication'],
            description: 'getcreatedUsers',
            notes: 'getcreatedUsers',
            pre: API.getCreatedUsers.pre,
            handler: API.getCreatedUsers.handler,
          },
        },
        {
          method: 'POST',
          path: '/forgot-password',
          options: {
            auth: null,
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
            tags: ['api', 'Authentication'],
            description: 'forgot Password',
            validate: API.forgotPassword.validate,
            pre: API.forgotPassword.pre,
            handler: API.forgotPassword.handler,
          },
        },
        {
          method: 'POST',
          path: '/set-password',
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
            tags: ['api', 'Authentication'],
            description: 'set Password',
            validate: API.setPassword.validate,
            pre: API.setPassword.pre,
            handler: API.setPassword.handler,
          },
        },
        {
          method: 'GET',
          path: '/me',
          options: {
            auth: 'auth',
            plugins: {
              policies: [],
              'hapi-swagger': {
                security: [
                  {
                    ApiKeyAuth: [],
                  },
                ],
              },
            },
            tags: ['api', 'Authentication'],
            description: 'me',
            notes: 'me',
            validate: API.me.validate,
            pre: API.me.pre,
            handler: API.me.handler,
          },
        },
      ]);
    },
    version: require('../../package.json').version,
    name: 'auth-routes',
  },
};
