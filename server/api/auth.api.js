'use strict';

const Joi = require('@hapi/joi');
const config = require('config');
const Boom = require('@hapi/boom');
const Bcrypt = require('bcrypt');
const NodeMailer = require('nodemailer');
const errorHelper = require('utilities/error-helper');
const Token = require('utilities/create-token');
const _fileHandler = require('utilities/file-upload');
const User = require('models/user.model').schema;
const userRole = require('models/userRole.model').schema;
const path = require('path');
module.exports = {
  login: {
    validate: {
      payload: Joi.object().keys({
        email: Joi.string().required().trim().label('Username'),
        password: Joi.string().required().trim().label('Password'),
      }),
    },
    pre: [
      {
        assign: 'user',
        method: async (request, h) => {
          try {
            const username = request.payload.email;
            const password = request.payload.password;

            let user = await User.findByCredentials(username, password);
            if (user) {
              return user;
            } else {
              errorHelper.handleError(
                Boom.badRequest('Wrong username or password'),
              );
            }
          } catch (err) {
            errorHelper.handleError(err);
          }
          return h.continue;
        },
      },
      {
        assign: 'accessToken',
        method: (request, h) => {
          return Token(request.pre.user, config.constants.EXPIRATION_PERIOD);
        },
      },
      {
        assign: 'emailVerified',
        method: (request, h) => {
          // TODO: Create Email service to send emails
          return h.continue;
        },
      },
      {
        assign: 'lastLogin',
        method: async (request, h) => {
          try {
            const lastLogin = Date.now();
            await User.findByIdAndUpdate(request.pre.user._id, {
              lastLogin: lastLogin,
            });
            return lastLogin;
          } catch (err) {
            errorHelper.handleError(err);
          }
          return h.continue;
        },
      },
    ],
    handler: async (request, h) => {
      let accessToken = request.pre.accessToken;
      let response = {};

      delete request.pre.user.password;
      delete request.pre.user.createdAt;
      delete request.pre.user.role;
      delete request.pre.user.updatedAt;

      response = {
        user: request.pre.user,
        accessToken,
        expiresIn: config.constants.EXPIRATION_PERIOD,
      };
      return h.response(response).code(200);
    },
  },
  signup: {
    validate: {
      payload: Joi.object().keys({
        email: Joi.string().email().required().trim().label('Email'),
        password: Joi.string().required().trim().label('Password'),
        gender: Joi.string().required().label('gender'),
        firstName: Joi.string().required().label('FirstName'),
        lastName: Joi.string().required().label('LastName'),
        bloodGroup: Joi.string().allow(''),
      }),
    },
    pre: [
      {
        assign: 'uniqueEmail',
        method: uniqueMailVerify,
      },
      {
        assign: 'signup',
        method: createUser,
      },
    ],
    handler: async (request, h) => {
      return h.response(request.pre.signup).code(201);
    },
  },
  // loginWithMail: {
  //   validate: Joi.object({}),
  // },
  adminSignUp: {
    validate: {
      payload: Joi.object({
        email: Joi.string().email().required().label('Email'),
        password: Joi.string().min(5).required().label('password'),
        role: Joi.string().required(),
        createdBy: Joi.string().email().required(),
      }),
    },
    pre: [
      {
        assign: 'uniqueEmail',
        method: uniqueMailVerify,
      },
      {
        assign: 'signup',
        method: createUser,
      },
    ],
    handler: async (request, h) => {
      return h.response(request.pre.signup).code(201);
    },
  },
  superAdminSignUp: {
    validate: {
      payload: Joi.object({
        email: Joi.string().email().required().label('Email'),
        password: Joi.string().min(5).required().label('password'),
        role: Joi.string().required(),
        createdBy: Joi.string().email().required(),
      }),
    },
    pre: [
      {
        assign: 'uniqueEmail',
        method: uniqueMailVerify,
      },
      {
        assign: 'signup',
        method: createUser,
      },
    ],
    handler: async (request, h) => {
      return h.response(request.pre.signup).code(201);
    },
  },
  fetchRoles: {
    pre: [
      {
        assign: 'roles',
        method: async (request, h) => {
          const scope = request.auth.credentials.user.role;
          const roles = await userRole.find({});
          if (scope === 'ADMIN') {
            return roles.filter((role) => role.role === 'USER');
          }
          if (scope === 'SUPERADMIN') {
            return roles.filter(
              (role) => role.role === 'ADMIN' || role.role === 'USER',
            );
          }
          return errorHelper.handleError(Boom.badRequest('Role is invalid'));
        },
      },
    ],
    handler: async (request, h) => {
      return request.pre.roles;
    },
  },
  getCreatedUsers: {
    pre: [
      {
        assign: 'users',
        method: async (request, h) => {
          const user = request.auth.credentials.user;
          const users = await User.find({ createdBy: user.email });
          return users;
        },
      },
    ],
    handler: async (request, h) => {
      return request.pre.users;
    },
  },
  forgotPassword: {
    validate: {
      payload: Joi.object({
        email: Joi.string().email().required(),
      }),
    },
    pre: [
      {
        assign: 'user',
        method: async (request, h) => {
          const user = await User.findOne({ email: request.payload.email });

          if (!user) {
            errorHelper.handleError(Boom.badRequest('Email is not registered'));
          }
          return user;
        },
      },
      {
        assign: 'accessToken',
        method: async (request, h) => {
          const user = { id: request.pre.user._id };
          return Token({ user }, 15 * 60);
        },
      },
      {
        assign: 'mailSender',
        method: async (request, h) => {
          try {
            const transport = NodeMailer.createTransport({
              host: 'smtp.gmail.com',
              sender: true,
              auth: {
                user: 'devanand.kariya@techivies.com',
                pass: '*******',
              },
            });
            const info = await transport.sendMail({
              from: 'devanand.kariya@techivies.com',
              to: request.pre.user.email,
              subject: 'Hello ✔',
              text: 'Hello world?',
              html: ` <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background-color: #3498db;
                        color: #fff;
                        text-align: center;
                        padding: 20px;
                    }
                    .content {
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 5px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #333;
                        font-size: 24px;
                    }
                    p {
                        font-size: 16px;
                    }
                    .button {
                        display: inline-block;
                        background-color: #3498db;
                        color: #fff;
                        text-decoration: none;
                        padding: 10px 20px;
                        margin-top: 20px;
                        border-radius: 5px;
                    }
                    .button:hover {
                        background-color: #258cd1;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>We received a request to reset your password. To reset your password, click the button below:</p>
                        <a href=http://localhost:4200/new-password/${request.pre.accessToken} class="button">Reset Password </a>
                        <p>If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
                    </div>
                </div>
            </body>
            </html>
            `,
            });

            return info;
          } catch (error) {
            errorHelper.handleError(Boom.badRequest(error.message));
          }
        },
      },
    ],
    handler: async (request, h) => {
      return {
        redirectTo: 'new-password',
        id: request.pre.user._id,
        accessToken: request.pre.accessToken,
      };
    },
  },
  setPassword: {
    validate: {
      payload: Joi.object({
        password: Joi.string().min(5).required(),
      }),
    },
    pre: [
      {
        assign: 'updates',
        method: async (request, h) => {
          const id = request.auth.credentials.user;
          const hashPassword = Bcrypt.hashSync(request.payload.password, 10);
          const { n, ok } = await User.updateOne(
            { _id: id },
            { password: hashPassword },
          );

          if (n === 0 || ok === 0) {
            errorHelper.handleError(Boom.expectationFailed('Update failed'));
          }
          return n;
        },
      },
    ],
    handler: async (request, h) => {
      return { updates: request.pre.updates };
    },
  },
  me: {
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).options({
        allowUnknown: true,
      }),
    },
    pre: [],
    handler: async (request, h) => {
      const { userService } = request.server.services();

      const user = await userService.getUserById(
        request.auth.credentials.user._id,
      );

      return h.response(user);
    },
  },
  updateUser: {
    pre: [
      {
        assign: 'imageUrl',
        method: async (request, h) => {
          try {
            if (typeof request.payload.image === 'object') {
              const fileHandlerResponse = await _fileHandler(
                request.payload.image,
                {
                  dest: path.join(__dirname + '/../../' + 'images/'),
                },
              );
              const filename = fileHandlerResponse.filename;
              const host = request.info.host;
              const protocol = request.server.info.protocol;
              delete request.payload.image;
              return `${protocol}://${host}/v1/images/${filename}`;
            }
            return request.payload?.image || '';
          } catch (error) {
            errorHelper.handleError(Boom.expectationFailed(error.message));
          }
        },
      },
    ],
    handler: async (request, h) => {
      try {
        if (request.pre?.imageUrl) {
          request.payload.image = request.pre.imageUrl;
        }
        if (request.payload?.password) {
          request.payload.password = Bcrypt.hashSync(
            request.payload.password,
            10,
          );
        }
        const id = request.auth.credentials.user._id;
        console.log('id.........', id);
        const updates = await User.updateOne({ _id: id }, request.payload);
        console.log('updates.....', updates);
        if (!updates?.ok) {
          return Boom.badRequest('profile update failed');
        }
        return { message: 'profile updated Successfully' };
      } catch (error) {
        errorHelper.handleError(Boom.expectationFailed(error.message));
      }
    },
  },
};

async function uniqueMailVerify(request, h) {
  try {
    let user = await User.findOne({
      email: request.payload.email,
    });
    if (user) {
      errorHelper.handleError(
        Boom.badRequest('Email address is already exist'),
      );
    }
  } catch (err) {
    errorHelper.handleError(err);
  }
  return h.continue;
}

async function createUser(request, h) {
  let userPayload = request.payload;
  try {
    let createdUser = await User.create(userPayload);
    return createdUser;
  } catch (err) {
    errorHelper.handleError(err);
  }
}
