'use strict';

const mongoose = require('mongoose');

const Joi = require('@hapi/joi');

const Bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const Types = Schema.Types;

const modelName = 'pin';

const errorHelper = require('utilities/error-helper');

const dbConn = require('plugins/mongoose.plugin').plugin.dbConn();

const Pin = new Schema(
  {
    pin: {
      type: Types.Number,
      required: true,
    },
    expires: {
      type: Types.Date,
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: 'user',
    },
  },
  {
    collection: modelName,
    timestamps: true,
    versionKey: false,
  },
);

Pin.methods = {
  generatePin: async function () {
    try {
      const pin = Math.floor(Math.random() * 9000) + 1000;
      return { pin, expires: new Date().toISOString() };
    } catch (err) {
      errorHelper.handleError(err);
    }
  },
};

Pin.statics.verifyPin = async function (id, pin) {
  try {
    const usersPin = this.findOne({ _id: id });

    if (!usersPin) {
      return { valid: false, message: 'Invalid Pin' };
    }
    if (usersPin.expires < new Date()) {
      return { valid: false, message: 'Pin expired' };
    }
    console.log('//////////////////////////////////////', usersPin.pin, pin);
    if (usersPin.pin === pin) {
      return { valid: true, message: 'pin is Valid' };
    }
  } catch (error) {
    errorHelper.handleError(error);
  }
};

module.exports.schema = dbConn.model(modelName, Pin);
