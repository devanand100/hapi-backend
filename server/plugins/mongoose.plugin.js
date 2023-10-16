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
      const Doctor = require('models/doctor.model').schema
      // const User = require('models/user.model').schema
      const userRoles = await UserRole.find({});
      const doctors = await Doctor.find({});
      
      if(doctors.length === 0){
        await Doctor.insertMany( [
          {
            name: 'Dr. John Smith',
            speciality: 'Cardiologist',
          },
          {
            name: 'Dr. Sarah Johnson',
            speciality: 'Pediatrician',
          },
          {
            name: 'Dr. Michael Brown',
            speciality: 'Orthopedic Surgeon',
          },
          {
            name: 'Dr. Lisa Davis',
            speciality: 'Dermatologist',
          },
          {
            name: 'Dr. Robert Lee',
            speciality: 'Oncologist',
          },
          {
            name: 'Dr. Emily White',
            speciality: 'Neurologist',
          },
          {
            name: 'Dr. Maria Garcia',
            speciality: 'Gynecologist',
          },
          {
            name: 'Dr. William Clark',
            speciality: 'General Practitioner',
          },
          {
            name: 'Dr. Jennifer Adams',
            speciality: 'Psychiatrist',
          },
          {
            name: 'Dr. Daniel Turner',
            speciality: 'Dentist',
          },
        ])
      }
      if (userRoles.length === 0) {
        await UserRole.insertMany([
          { role: 'SUPERADMIN' },
          { role: 'ADMIN' },
          { role: 'USER' },
        ]);
        
        //   await User.create({email:"admin@gmail.com",password:"12345", role:"ADMIN"} )
        //   await User.create({email:"superadmin@gmail.com",password:"12345", role:"SUPERADMIN"})
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
