const Joi = require('@hapi/joi');
const config = require('config');
const Boom = require('@hapi/boom');
const errorHelper = require('utilities/error-helper');
const { request } = require('http');
const Doctor = require('models/doctor.model').schema;

module.exports = {
  uniqueSpecialities: {
    pre: [{ assign: 'specialities', method: async (request, h) => {
        const specialities = await Doctor.distinct('speciality');
        return specialities
    } }],
    handler: async (request, h) =>{

        return request.pre.specialities;
    }
  },
  doctorsBySpeciality:{
    validate:{
        params:Joi.object({
            speciality:Joi.string().required()
        })
    } ,
    pre:[{
        assign:"doctors" , method: async (request , h)=>{
            const speciality = request.params.speciality
            const doctors = await Doctor.find({speciality:speciality})
            if(doctors.length === 0){
              errorHelper.handleError(Boom.badRequest("Doctors not found"))
            }
            return doctors;
        }
    }] ,
    handler:async(request , h) =>{
        return request.pre.doctors
    }

  }


};
