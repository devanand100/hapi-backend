'use strict';

const mongoose = require('mongoose');

const Joi = require('@hapi/joi');

const Bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const Uuidv4 = require('uuid/v4');

const Types = Schema.Types;

const modelName = 'user';

const errorHelper = require('utilities/error-helper');

const dbConn = require('plugins/mongoose.plugin').plugin.dbConn();

const UserSchema = new Schema(
  {
    firstName: {
      type: Types.String,
      // required:true ,
    },
    lastName: {
      type: Types.String,
      // required:true ,
    },
    email: {
      type: Types.String,
      required: true,
      unique: true,
      index: true,
      stringType: 'email',
      canSearch: true,
    },
    bloodGroup: {
      type: Types.String,
    },
    gender: {
      type: Types.String,
      // required:true ,
    },
    image: {
      type: Types.String,
    },
    password: {
      type: Types.String,
      exclude: true,
      // required: true,
    },
    role: {
      type: Types.String,
      ref: 'userRole',
      default: 'USER',
    },
    createdBy: {
      type: Types.String,
      stringType: 'email',
      canSearch: true,
    },
  },
  {
    collection: modelName,
    timestamps: true,
    versionKey: false,
  },
);

UserSchema.pre('save', async function (next) {
  let user = this;
  if (user.isNew) {
    // Set Password & hash before save it
    const passHash = await user.generateHash(user.password);
    user.password = passHash.hash;
    const emailHash = await user.generateHash();
    user.emailHash = emailHash.hash;
    user.wasNew = true;
  }
  next();
});

UserSchema.methods = {
  generateHash: async function (key) {
    try {
      if (key === undefined) {
        key = Uuidv4();
      }
      let salt = await Bcrypt.genSalt(10);
      let hash = await Bcrypt.hash(key, salt);
      return {
        key,
        hash,
      };
    } catch (err) {
      errorHelper.handleError(err);
    }
  },
};

UserSchema.statics = {
  findByCredentials: async function (username, password) {
    try {
      const self = this;

      let query = {
        email: username.toLowerCase(),
      };

      const schema = Joi.object({
        username: Joi.string().email().required(),
      });
      const emailValidate = schema.validate({ username });

      // if (emailValidate.error) {
      //   query = {
      //     phone: username,
      //   };
      // }

      let mongooseQuery = self.findOne(query);

      let user = await mongooseQuery.lean();

      if (!user) {
        return false;
      }

      const source = user.password;

      let passwordMatch = await Bcrypt.compare(password, source);

      if (passwordMatch) {
        return user;
      }
    } catch (err) {
      errorHelper.handleError(err);
    }
  },
  generateHash: async function (key) {
    try {
      if (key === undefined) {
        key = Uuidv4();
      }
      let salt = await Bcrypt.genSalt(10);
      let hash = await Bcrypt.hash(key, salt);
      return {
        key,
        hash,
      };
    } catch (err) {
      errorHelper.handleError(err);
    }
  },
};

module.exports.schema = dbConn.model(modelName, UserSchema);
