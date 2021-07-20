const mongoose = require("mongoose");

const ResponseSchema = new mongoose.Schema({
  correct: {
    type: String,
    required: true,
  },
  inCorrect: {
    type: String,
    required: true,
  },
  notAttemped: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  submitted_by: {
    type: String,
    reuired: true,
  },
  title: {
    type: String,
    required: true,
  },
  conducted_by: {
    type: String,
    required: true,
  },
});

const Response = mongoose.model("response", ResponseSchema);
module.exports = Response;
