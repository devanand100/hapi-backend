'use strict';

const mongoose = require('mongoose');

const Joi = require('@hapi/joi');

const Bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const Uuidv4 = require('uuid/v4');

const Types = Schema.Types;

const modelName = 'abha';

const errorHelper = require('utilities/error-helper');

const dbConn = require('plugins/mongoose.plugin').plugin.dbConn();

const AbhaSchema = new Schema(
  {
    number:{
        type:Types.Number,
        required:true
    },
    user: {
      type: Types.ObjectId,
      ref:"user",
      required:true ,      
    },
    // lastName: {
    //   type: Types.String,
    //   required:true,
    // },
    // firstName: {
    //     type: Types.String,
    //     required:true,
    //   },
    // email: {
    //   type: Types.String,
    //   required: true,
    //   unique: true,
    //   index: true,
    //   stringType: 'email',
    //   canSearch: true,
    // },
    // bloodGroup: {
    //   type: Types.String,
    //   required:true
    // },
    // gender: {
    //   type: Types.String,
    // //   required:true ,
    // },
    // image: {
    //   type: Types.String,
    // },
    // password: {
    //   type: Types.String,
    //   exclude: true,
    //   // required: true,
    // },
    // role: {
    //   type: Types.String,
    //   ref: 'userRole',
    //   default: 'USER',
    // },
    // createdBy: {
    //   type: Types.String,
    //   stringType: 'email',
    //   canSearch: true,
    // },
  },
  {
    collection: modelName,
    timestamps: true,
    versionKey: false,
  },
);



module.exports.schema = dbConn.model(modelName, AbhaSchema);
