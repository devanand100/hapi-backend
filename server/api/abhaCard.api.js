const Joi = require('@hapi/joi');
const config = require('config');
const Boom = require('@hapi/boom');
const errorHelper = require('utilities/error-helper');
const Abha = require('models/abhaCard.model').schema;

module.exports = {
  getAbhaCard: {
    handler: async (request, h) =>{
        const card  = await Abha.findOne({user : request.auth.credentials._id})
        if(!card){
            errorHelper.handleError(Boom.badRequest("AbhaCard Not found"))
        }
        return card;
    } ,
    checkEligibility : {
        
    }
  },
//   doctorsBySpeciality:{
//     validate:{
//         params:Joi.object({
//             speciality:Joi.string().required()
//         })
//     } ,
//     pre:[{
//         assign:"doctors" , method: async (request , h)=>{
//             const speciality = request.params.speciality
//             const doctors = await Doctor.find({speciality:speciality})
//             if(doctors.length === 0){
//               errorHelper.handleError(Boom.badRequest("Doctors not found"))
//             }
//             return doctors;
//         }
//     }] ,
//     handler:async(request , h) =>{
//         return request.pre.doctors
//     }

//   }


};
