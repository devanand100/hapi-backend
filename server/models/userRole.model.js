'use strict';

const mongoose = require('mongoose');

const Joi = require('@hapi/joi');

const Bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const Uuidv4 = require('uuid/v4');

const Types = Schema.Types;

const modelName = 'userRole';

const errorHelper = require('utilities/error-helper');

const dbConn = require('plugins/mongoose.plugin').plugin.dbConn();

const UserRoleSchema = new Schema(
  {
    role :{
      type:Types.String,
      required:true
    }
  },
  {
    collection: modelName,
    timestamps: true,
    versionKey: false,
  },
);




module.exports.schema = dbConn.model(modelName, UserRoleSchema);
