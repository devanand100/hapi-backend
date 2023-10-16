'use strict';

const mongoose = require('mongoose');

const Joi = require('@hapi/joi');

const Bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const Uuidv4 = require('uuid/v4');

const Types = Schema.Types;

const modelName = 'doctor';

const errorHelper = require('utilities/error-helper');
const { schema } = require('./userRole.model');

const dbConn = require('plugins/mongoose.plugin').plugin.dbConn();

const DoctorSchema = new Schema({
    name:{
        type:Types.String,
        required:true
    } ,
    speciality:{
        type:Types.String,
        required:true
    }
})


module.exports.schema = dbConn.model(modelName, DoctorSchema);
