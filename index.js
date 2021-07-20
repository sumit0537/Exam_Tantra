// For importing modules
const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");
const Exam = require("./models/examSchema");
const Response = require("./models/responseSchema");
const CorrectAns = require("./models/correctAnsSchema");
const User = require("./models/userSchema");

// middleware to verify token {function}
function verifyToken(req, res, next) {
  // Get the Auth header value
  const authHeader = req.headers["authorization"];
  // Check if bearer is unidentified
  if (typeof authHeader !== "undefined") {
    // Split at the space
    const bearer = authHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }
}
// Express stuff
const port = process.env.PORT || 80;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// for serving static files only
app.use("/public", express.static(path.join(__dirname, "public")));

// set the views directory
app.set("views", path.join(__dirname, "views"));

// conneting to database
const DB =
  "mongodb+srv://chanshu:Casd@805131@exam-tantra.sweey.mongodb.net/exam-tantra?retryWrites=true&w=majority&ssl=true";
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("connection successful");
  })
  .catch((err) => console.log(err));

// +++++++++++++++++++++++++++++++++ FOR ENDPOINTS +++++++++++++++++++++++
// To render html page of home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/home.html"));
});
// Renders dashboard
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/dashboard.html"));
});

app.post("/", (req, res) => {
  console.log(req.body);
  res.render("finish.pug");
});

// To render html page for login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/login.html"));
});

// To render html page for register
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/register.html"));
});

// To render html page for giving exam
app.get("/exam", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/exam.html"));
});

// To render html page for conduncting exam
app.get("/conduct_exam", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/conduct_exam.html"));
});

// To render html page for response
app.get("/response", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/response.html"));
});
// --------------------------------------------------------------------------
//                     for api or microservices
// --------------------------------------------------------------------------
// To find a user
app.get("/api/user/:username", (req, res) => {
  User.findOne({ name: req.params.username }).then((user) => {
    if (user) {
      res.send(user);
    } else {
      // Not found
      res.send("not exists");
    }
  });
});

// To create a new user
app.post("/api/register", (req, res) => {
  user = new User({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });

  user.save().then((result) => {
    res.send(result);
  });
});

// To log in a user
app.post("/api/login", (req, res) => {
  const token = jwt.sign({ username: req.body.username }, "secretKey", {
    expiresIn: "28800s",
  });
  res.send(token);
});

// To get user-profles
app.post("/api/profile", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretKey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.send(authData.username);
    }
  });
});
// To get questions along with instructions
app.get("/api/exam/:exam_code", (req, res) => {
  Exam.findOne({ code: req.params.exam_code }).then((exam) => {
    if (exam) {
      let scheduleDate = new Date(exam.schedule_time);
      let endDate =
        scheduleDate.getTime() + parseInt(exam.duration, 10) * 60 * 1000;
      let currDate = new Date();
      let distance = scheduleDate.getTime() - currDate.getTime();
      if (distance > 0) {
        // except questions send everything
        console.log(distance);
        res.json({
          code: exam.code,
          duration: exam.duration,
          schedule_time: exam.schedule_time,
          title: exam.title,
          status: "pending",
        });
      } else if (endDate - currDate <= 0) {
        // exam over
        res.sendStatus(404);
      } else {
        // send exam
        res.send(exam);
      }
    } else {
      // Not found
      res.sendStatus(404);
    }
  });
});

// To submit qustions' answers
app.post("/api/exam/:code", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretKey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      CorrectAns.findOne({
        code: req.params.code,
      }).then((correct_answer) => {
        console.log(correct_answer.ans);
        const ansResponse = new Response({
          correct: noOfCorrect(correct_answer.ans, req.body.answers),
          inCorrect: noOfInCorrect(correct_answer.ans, req.body.answers),
          notAttemped: notAttemped(req.body.answers),
          code: req.params.code,
          conducted_by: req.body.conducted_by,
          submitted_by: authData.username,
          title: req.body.title,
        });
        ansResponse.save().then(() => res.send("!! Submitted Successfully !!"));
      });
    }
  });
});

// To create qustions' by admin or teacher
app.post("/api/conduct_exam", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretKey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      console.log(req.body);
      const exam = new Exam({
        code: req.body.title + authData.username,
        conducted_by: authData.username,
        duration: req.body.duration,
        schedule_time: req.body.schedule_time,
        title: req.body.title,
        questions: req.body.questions,
      });
      // upload correct answer
      const correct_ans = new CorrectAns({
        code: req.body.title + authData.username,
        ans: req.body.correct_answer,
      });
      correct_ans.save();
      exam.save().then(() => res.send(req.body.title + authData.username));
    }
  });
});

// To get respones of students
app.post("/api/response",verifyToken, (req, res) => {
  jwt.verify(req.token, "secretKey", (err, authData) => {
    if (err) {
      res.status(404).send(err);
    } else {
      Response.find({
        conducted_by: authData.username,
      }).then((resp) => {
        if (resp) {
          res.json({
            result:resp
          });
        } else {
          res.sendStatus(403);
        }
      });
    }
  });
});

// To get correct answers
app.get("/api/correct_answers/:code", (req, res) => {
  CorrectAns.findOne({
    code: req.params.code,
  }).then((resp) => {
    if (resp) {
      res.json({
        correct_ans: resp,
      });
    } else {
      // Not found
      res.sendStatus(404);
    }
  });
});

// helper functions
function noOfCorrect(correct_ans, ans) {
  let no_correct = 0;
  for (let index = 0; index < ans.length; index++) {
    if (ans[index] == correct_ans[index]) {
      no_correct++;
    }
  }
  return no_correct;
}

function noOfInCorrect(correct_ans, ans) {
  let no_in_correct = 0;
  for (let index = 0; index < ans.length; index++) {
    if (ans[index] != correct_ans[index]) {
      no_in_correct++;
    }
  }
  return no_in_correct;
}

function notAttemped(ans) {
  let noOfNotAttemped = 0;
  ans.forEach((a) => {
    if (a == 0) {
      noOfNotAttemped++;
    }
  });
  return noOfNotAttemped;
}
// ++++++++++ FOR LISTENING +++++++++++++++++++++++
app.listen(port, () => console.log(`Server is listening at port ${port}`));
