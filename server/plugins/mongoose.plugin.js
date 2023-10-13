'use strict';

const db = require('mongoose');
const Glob = require('glob');

db.Promise = require('bluebird');

let dbConn = null;

module.exports.plugin = {
  async register(server, options) {
    try {
      dbConn = await db.createConnection(options.connections.db);

      // When the connection is connected
      dbConn.on('connected', () => {
        server.log(['mongoose', 'info'], 'dbConn Mongo Database connected');
      });

      // When the connection is disconnected
      dbConn.on('disconnected', () => {
        server.log(['mongoose', 'info'], 'dbConn Mongo Database disconnected');
      });

      server.decorate('server', 'db', dbConn);

      // If the node process ends, close the mongoose connection
      process.on('SIGINT', async () => {
        await dbConn.close();
        server.log(
          ['mongoose', 'info'],
          'Mongo Database disconnected through app termination',
        );
        process.exit(0);
      });

      // Load models
      const models = Glob.sync('server/models/*.js');
      models.forEach((model) => {
        require(`${process.cwd()}/${model}`);
      });

      // adding roles and users
      const UserRole = require('models/userRole.model').schema;
      const User = require('models/user.model').schema
      const userRoles = await UserRole.find({});


      if(userRoles.length === 0){
        await UserRole.insertMany([{role:"SUPERADMIN"}, {role:"ADMIN"} , {role:"USER"}])
        await User.create({email:"admin@gmail.com",password:"12345", role:"ADMIN"} )
        await User.create({email:"superadmin@gmail.com",password:"12345", role:"SUPERADMIN"})
      }


    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  dbConn() {
    return dbConn;
  },
  name: 'mongoose_connector',
  version: require('../../package.json').version,
};