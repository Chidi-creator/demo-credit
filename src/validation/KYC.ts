import joi, { object } from "joi";
import { KYCSubmissionData } from "@services/types/verification";

export const validateKYCSubmission = (object: KYCSubmissionData) => {
  const schema = joi.object({
    phone_number: joi.string().required(),
    bvn: joi.string().required(),
    bvn_phone_number: joi.string().required(),
    dob: joi.string().required(),
    email: joi.string().required(),
    account_number: joi.string().required(),
    bank_code: joi.string().required(),
    state: joi.string().required(),
    lga: joi.string().required(),
    city: joi.string().required(),
    address: joi.string().required(),
    photo_url: joi.string().required(),
    documents: joi
      .array()
      .items(
        joi.object({
          url: joi.string().required(),
          type_id: joi.number().required(),
          sub_type_id: joi.number().required(),
        })
      )
      .required(),
  });

  return schema.validate(object);
};
