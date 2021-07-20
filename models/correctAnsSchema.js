const mongoose = require("mongoose");

const CorrectAnsSchema = new mongoose.Schema({
  ans: {
    type: Array,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
});

const CorrectAns = mongoose.model("correct_answer", CorrectAnsSchema);
module.exports = CorrectAns;
