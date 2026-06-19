const mongoose = require("mongoose");
const Joi = require("joi");

const jobSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  hiringManagerEmail: { type: String, required: true },
  jobPostTitle: { type: String, required: true },
  jobDepartment: { type: String, required: true },
  jobLocation: { type: String, required: true },
  jobType: { type: String, required: true },
  jobSalary: { type: String },
  jobDescription: { type: String, required: true },
  companyName: { type: String, required: true },
  shortJobDescription: { type: String, required: true },
  postDate: { type: Date, required: true }, // Added postDate
  deadlineDate: { type: Date, required: true }, // Added deadlineDate
  photo: { type: String }, // Store base64 string of the image
}, { timestamps: true }); // Added timestamps for created/updated dates

const Job = mongoose.model("Job", jobSchema);

const validateJob = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().required().label("Full Name"),
    hiringManagerEmail: Joi.string().email().required().label("Hiring Manager Email"),
    jobPostTitle: Joi.string().required().label("Job Post Title"),
    jobDepartment: Joi.string().required().label("Job Department"),
    jobLocation: Joi.string().required().label("Job Location"),
    jobType: Joi.string().required().label("Job Type"),
    jobSalary: Joi.string().label("Job Salary"),
    jobDescription: Joi.string().required().label("Job Description"),
    companyName: Joi.string().required().label("Company Name"),
    shortJobDescription: Joi.string().required().label("Short Job Description"),
    postDate: Joi.date().required().label("Post Date"), // Added validation
    deadlineDate: Joi.date().required().min(Joi.ref('postDate')).label("Deadline Date"), // Added validation
    photo: Joi.string().allow("").optional().label("Photo"),
  });
  return schema.validate(data);
};

module.exports = { Job, validateJob };