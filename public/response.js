var table = document.getElementById("myTable");
async function getResponse() {
  let token = localStorage.getItem("token");
  // console.log(token);
  const origin = document.location.origin;
  const response = await fetch(origin + "/api/response", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token
    },
  });
  // 200->OK
  if (response.ok) {
    const result = await response.json();
    console.log(result.result);
    // console.log(typeof result);
    fillData(result.result);
  }
  // Something went wrong
  else {
    var err = await response.text();
    alert("Something went wrong..." + err);
  }
}
// helper function
function fillData(responses) {
  responses.forEach((resp, i) => {
    var row = table.insertRow(i + 1);
    const cell0 = row.insertCell(0);
    const cell1 = row.insertCell(1);
    const cell2 = row.insertCell(2);
    const cell3 = row.insertCell(3);
    const cell4 = row.insertCell(4);
    const cell5 = row.insertCell(5);
    const cell6 = row.insertCell(6);
    cell0.innerHTML = i + 1;
    cell1.innerHTML = resp.code;
    cell2.innerHTML = resp.title;
    cell3.innerHTML = resp.submitted_by;
    cell4.innerHTML = resp.correct;
    cell5.innerHTML = resp.inCorrect;
    cell6.innerHTML = resp.notAttemped;
  });
}

// to log-out the user 
function LogOut() {
  const origin = document.location.origin;
  localStorage.removeItem('token');
  document.location.href=origin;
} 
setTimeout(getResponse, 5000);
// getResponse();
