var ques = [];
var ans = [];
var i = 0;
var exam_code = "";
var exam_title = "";
var duration = "";
var schedule_time = "";
var conducted_by = "";

async function loadExam(exam_code) {
  const origin = document.location.origin;
  // Storing response
  const response = await fetch(origin + "/api/exam/" + exam_code);
  // Storing data in form of JSON
  if (response.ok) {
    // either exam is yet to start or exam has started
    document.getElementById("exam-body").removeAttribute("class", "hide");

    const result = await response.json();
    if (result.status == "pending") {
      // Show exam details only
      schedule_time = new Date(result.schedule_time);
      document.getElementById("exam-title").innerHTML = result.title;
      document.getElementById("exam-code").innerHTML = exam_code;
      document.getElementById("duration").innerHTML = result.duration;
      examWillStartIn();
    } else {
      // show everything
      document.getElementById("exam-status").innerText = "active";
      document.getElementById("exam-will-start-in-label").innerText =
        "Time Left :   ";
      schedule_time = new Date(result.schedule_time);
      conducted_by = result.conducted_by;
      duration = result.duration;
      exam_title = result.title;
      ques = result.questions;
      for (let index = 0; index < ques.length; index++) {
        ans[index] = 0;
      }
      document.getElementById("exam-title").innerHTML = result.title;
      document.getElementById("exam-code").innerHTML = exam_code;
      document.getElementById("duration").innerHTML = result.duration;
      document.getElementById("question-number").innerHTML = ques[i]["name"];
      document.getElementById("label-A").innerHTML = ques[i]["option_1"];
      document.getElementById("label-B").innerHTML = ques[i]["option_2"];
      document.getElementById("label-C").innerHTML = ques[i]["option_3"];
      document.getElementById("label-D").innerHTML = ques[i]["option_4"];
      examWillEndIn();
    }
  } else {
    // alert No such exam exists or you have entered wrong code
    alert(":) No such exam exists");
  }
}

// next functon
function Next() {
  Save();
  if (i + 1 >= ques.length) {
    // document.getElementById("next-btn").setAttribute("disabled", "true");
    alert("This is the last question");
  } else {
    i = i + 1;
    let q = document.getElementById("question-number");
    q.innerHTML = ques[i]["name"];
    document.getElementById("label-A").innerHTML = ques[i]["option_1"];
    document.getElementById("label-B").innerHTML = ques[i]["option_2"];
    document.getElementById("label-C").innerHTML = ques[i]["option_3"];
    document.getElementById("label-D").innerHTML = ques[i]["option_4"];
    if (ans[i] == 0) {
      document.getElementById("A").checked = false;
      document.getElementById("B").checked = false;
      document.getElementById("C").checked = false;
      document.getElementById("D").checked = false;
    } else {
      document.getElementById(ans[i]).checked = true;
    }
  }
}

// prev functon
function Prev() {
  Save();
  if (i <= 0) {
    // document.getElementById("prev-btn").setAttribute("disabled", "true");
    alert("This is the first question");
  } else {
    i = i - 1;
    let q = document.getElementById("question-number");
    q.innerHTML = ques[i]["name"];
    document.getElementById("label-A").innerHTML = ques[i]["option_1"];
    document.getElementById("label-B").innerHTML = ques[i]["option_2"];
    document.getElementById("label-C").innerHTML = ques[i]["option_3"];
    document.getElementById("label-D").innerHTML = ques[i]["option_4"];
    if (ans[i] == 0) {
      document.getElementById("A").checked = false;
      document.getElementById("B").checked = false;
      document.getElementById("C").checked = false;
      document.getElementById("D").checked = false;
    } else {
      document.getElementById(ans[i]).checked = true;
    }
  }
}

// clear functon
function Clear() {
  // uncheck radio button
  let options = document.getElementsByName("radio-option");
  Array.from(options).forEach((option) => (option.checked = false));
  // ans[i] = 0;
}

// save function
function Save() {
  // save checked radio button value
  let options = document.getElementsByName("radio-option");
  let checked_ans = Array.from(options).filter((option) => option.checked);
  if (checked_ans[0]) {
    ans[i] = checked_ans[0].value;
  } else {
    ans[i] = 0;
  }
}

// finish functon
function Finish() {
  // post answers to server
  if (confirm("Do you really want to finish?")) {
    Save();
    let token = localStorage.getItem("token");
    PostAnswers(token);
  } else {
    console.log("pressed cancel");
  }
}
// code submit
function SubmitCode() {
  let examcode = document.getElementById("code").value;
  exam_code = examcode;
  document.getElementById("code-input-body").setAttribute("class", "hide");
  loadExam(examcode);
}

// post answers' to server
async function PostAnswers(token) {
  const origin = document.location.origin;
  const response = await fetch(origin + "/api/exam/" + exam_code, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: "Bearer" + " " + token,
    },
    body: JSON.stringify({
      answers: ans,
      conducted_by: conducted_by,
      title: exam_title,
    }),
  });
  if (response.ok) {
    const result = await response.text();
    alert(result);
    document.location.href = origin+'/dashboard'; 
  }
}

// countdown timer exam will start in
function examWillStartIn() {
  // Update the count down every 1 second
  var x = setInterval(function () {
    // Get today's date and time
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = schedule_time.getTime() - now;
    /*
    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    */
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the element with id="demo"
    document.getElementById("exam-will-start-in").innerHTML =
      minutes + "m " + seconds + "s ";

    // If the count down is finished, write some text
    if (distance < 0) {
      clearInterval(x);
      document.location.reload();
    }
  }, 1000);
}
// exam will end in
function examWillEndIn() {
  // Update the count down every 1 second
  var x = setInterval(function () {
    var endTime = schedule_time.getTime() + parseInt(duration, 10) * 60 * 1000;
    // Get today's date and time
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = endTime - now;
    /*
    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    */
    var hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the element with id=""
    document.getElementById("exam-will-start-in").innerHTML =
      hours + "h" + minutes + "m " + seconds + "s ";

    // If the count down is finished, write some text
    if (distance < 0) {
      clearInterval(x);
      // finish function will be called
      setTimeout(Finish, 2000);
    }
  }, 1000);
}
