'use strict';
const Path = require('path');

// Never take constants here
module.exports = {
  plugin: {
    async register(server, options) {
      server.route([
        {
          method: 'GET',
          path: '/images/{filename}',
          options: {
            auth: null,
            plugins: {
              policies: [],
            },
            tags: ['api', 'images'],
            description: 'public images',
            notes: 'public images',
            handler: {
              file: function (request) {
                return `images/${request.params.filename}`;
              },
            },
          },
        },
      ]);
    },
    version: require('../../package.json').version,
    name: 'image-routes',
  },
};
