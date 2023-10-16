const Joi = require('@hapi/joi');
const config = require('config');
const Boom = require('@hapi/boom');
const errorHelper = require('utilities/error-helper');
const { request } = require('http');
const Consultion = require('models/consultions.model').schema;
const User  = require('models/user.model').schema;
module.exports = {
  addConsultion: {
    validate: {
        payload:Joi.object({
            speciality:Joi.string().required(),
            symptoms:Joi.string().required(),
            doctor:Joi.string().required(),
        })
    },
    pre: [
      {
        assign: 'consult',
        method: async (request, h) => {
            try{
                request.payload.user = request.auth.credentials.user._id
                const consult = await Consultion.create(request.payload);
                return consult;
            }catch(err){
                errorHelper.handleError(err);
            }
         
        },
      },
    ],
    handler: async (request, h) => {
      return request.pre.consult;
    },
  },
  consultionsCount:{
    pre:[
    {assign:'user' , method: async (request , h) => { 
        const user = await User.findOne({email:request.payload.email});
        if(!user){
            errorHelper.handleError(Boom.badRequest("User not found"))
        }
        return user
    }, 
 },
 {
    assign:'counts' , method: async (request , h) => {
        const consultionCounts = await Consultion.count({user:request.pre.user._id})
        return consultionCounts;
    }
 }
    ],
    handler:async (request , h) => {  
        return {count:request.pre.counts};
    }
  }
};
