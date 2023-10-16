'use strict';

const mongoose = require('mongoose');

const Joi = require('@hapi/joi');

const Bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const Uuidv4 = require('uuid/v4');

const Types = Schema.Types;

const modelName = 'consult';

const errorHelper = require('utilities/error-helper');

const dbConn = require('plugins/mongoose.plugin').plugin.dbConn();
const ConsultSchema = new Schema({
    user:{
        type:Types.ObjectId,
        ref:'user' ,
        required:true
    } ,
    doctor:{
        type:Types.ObjectId,
        ref:'doctor' ,
        required:true
    } ,
    symptoms:{
        type:Types.String ,
        required:true
    }
})

module.exports.schema = dbConn.model(modelName, ConsultSchema);
