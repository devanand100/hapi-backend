const Joi = require('@hapi/joi');
const config = require('config');
const Boom = require('@hapi/boom');
const errorHelper = require('utilities/error-helper');
const Abha = require('models/abhaCard.model').schema;
const User = require('models/user.model').schema;
const Consultion = require('models/consultions.model').schema;
const Pin = require('models/pin.model').schema;
const NodeMailer = require('nodemailer');
const Token = require('utilities/create-token');

module.exports = {
  getAbhaCard: { 
    pre:[
    {
      assign:"card" , 
      method: async (request,h) => {
        try{
          const  card = await Abha.findOne({ user: request.auth.credentials.user._id })
        if(!card){
          const card  = await Abha.create({ number:new Date().getTime() ,user:request.auth.credentials.user._id })
          return card
        }
        return card
        }catch(err){
          errorHelper.handleError(err)
        }
        
      } 

    }
  ],
    handler: async (request, h) => {
      const card = request.pre.card;
      const user = request.auth.credentials.user;
      return {card:card , userDetail:user } ;
    },
  },
  getOtp: {
    validate: {
      payload: Joi.object({
        email: Joi.string().email().required(),
      }),
    },
    pre: [
      {
        assign: 'user',
        method: findUser,
      },
      {
        assign: 'counts',
        method: async (request, h) => {
          try {
            const consultionCounts = await Consultion.count({
              user: request.pre.user._id,
            });
            if (consultionCounts === 0) {
              errorHelper.handleError(Boom.badRequest('Take consultion first'));
            }
            return consultionCounts;
          } catch (err) {
            errorHelper.handleError(err);
          }
        },
      },
      {
        assign: 'pin',
        method: async (request, h) => {
          try {
            
            randomPin = Math.floor(Math.random() * 9000) + 1000;
            expiresDate = new Date(new Date().getTime() + 15 * 60 * 1000);
            const filter = { email: request.pre.user.email };
            const update = { $set: { pin: randomPin, expires: expiresDate } };
            const options = { upsert: true, new: true };

            const pin = await Pin.findOneAndUpdate(filter, update, options);

            return pin;
          } catch (err) {
            errorHelper.handleError(err);
          }
        },
      },
      {
        assign: 'emailSent',
        method: async (request, h) => {
          try {
            const transport = NodeMailer.createTransport({
              host: 'smtp.gmail.com',
              sender: true,
              auth: {
                user: 'devanand.kariya@techivies.com',
                pass: 'Qazwsxed#108',
              },
            });
            const info = await transport.sendMail({
              from: 'devanand.kariya@techivies.com',
              to: request.pre.user.email,
              subject: 'Abha verification pin ',
              text: `Your  pin is ${request.pre.pin.pin} and it is valid for 15 minutes `,
            });
            if (info?.messageId) {
              return { message: 'Otp sent successfully' };
            } else {
              errorHelper.handleError(
                Boom.badRequest('Failed to generate otp'),
              );
            }
          } catch (err) {
            errorHelper.handleError(err);
          }
        },
      },
    ],
    handler: async (req, h) => {
      return req.pre.emailSent;
    },
  },
  verifyOtp: {
    validate: {
      payload: Joi.object({
        email: Joi.string().email().required(),
        pin: Joi.number().required(),
      }),
    },
    pre: [
      {
        assign: 'isOtpValid',
        method: async (request, h) => {
          const usersPin = await Pin.findOne({ email: request.payload.email });
          
          if (!usersPin) {
            errorHelper.handleError(Boom.badRequest('pin not found'));
          }

          if (new Date() > usersPin.expires) {
            errorHelper.handleError(Boom.badRequest('pin expired'));
          }

          if (usersPin.pin === request.payload.pin) {
            return { usersPin };
          }
          errorHelper.handleError(Boom.badRequest('invalid Pin'));
        },
      },
      {
        assign:"user" ,
        method:findUser 
      },
      {
        assign: 'accessToken',
        method: (request, h) => {
          return Token(request.pre.user, config.constants.EXPIRATION_PERIOD);
        },
      },
    ],
    handler: async (request, h) => {
      return {accessToken : request.pre.accessToken}
    },
  },
};

  async function findUser(request, h)  {
    try {
      const user = await User.findOne({ email: request.payload.email });
      if (!user) {
        errorHelper.handleError(Boom.badRequest('User not found , Enter correct email'));
      }
      return user;
    } catch (err) {
      errorHelper.handleError(err);
    }
  }
