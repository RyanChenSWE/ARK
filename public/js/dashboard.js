const collaboratorInput = document.querySelector("#addCollaborators");
const emailError = document.querySelector("#email-error");
let noFriends = document.querySelector("#no-friends");
let collaboratorContainer = document.querySelector("#collaborator-container");
let googleUser;
var calendars;
var collaboratorArray = [];

initiateEmbededCalendar();

window.onload = (event) => {
  // Use this to retain user state between html pages.
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      document.querySelector("#user").innerText =
        user.displayName || "Anonymous";
      googleUser = user;
    } else {
      // If not logged in, navigate back to login page.
      window.location = "index.html";
    }
  });
};

function toggleBookModal() {
  bookModal.classList.toggle("is-active");
  resetBookModal();
}

function bookRoom() {
  bookModal.classList.toggle("is-active");
  console.log(calendars[0]);
  const roomEl = bookModal.querySelector("select");
  const roomId = roomEl.options[roomEl.selectedIndex].value;
  let date = calendars[0].date.start.toJSON().slice(0, 10); //YYYY-MM-DD
  let time =
    calendars[0].time.start.toJSON().slice(11, 13) -
    7 +
    calendars[0].time.start.toJSON().slice(13, 16);
  console.log("Room Booked!", date, time);
  addAppointment(
    roomId,
    calendars[0].time.start.toJSON(),
    calendars[0].time.end.toJSON()
  );
  createAlert(`Room ${roomId} booked!`, "success");
}

function validateEmail(email) {
  const regexExpression =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regexExpression.test(email);
}

function addressHTML(email) {
  let address = document.createElement("a");
  address.innerHTML = `${collaboratorInput.value}`;
  address.classList.add("collaborator-email");

  address.onclick = function () {
    removeFromArray(collaboratorArray, this.innerHTML);
    this.parentElement.removeChild(this);
    checkCollaboratorEmpty();
  };
  return address;
}

function removeFromArray(array, content) {
  const index = array.indexOf(content);
  if (index > -1) {
    array.splice(index, 1);
  }
}

function checkCollaboratorEmpty() {
  collaboratorContainer = document.querySelector("#collaborator-container");

  if (collaboratorContainer.childElementCount <= 1) {
    noFriends = document.querySelector("#no-friends");
    noFriends.style = "";
  }
}

function resetBookModal() {
  collaboratorContainer.innerHTML = `<p class="no-friends" id="no-friends">Currently no one invited</p>`;
  collaboratorInput.value = "";
  collaboratorInput.classList.remove("is-danger");
  collaboratorInput.classList.remove("is-success");
  noFriends.style.display = "";
  emailError.style.display = "none";
}

collaboratorInput.addEventListener("change", (key) => {
  if (validateEmail(collaboratorInput.value)) {
    noFriends = document.querySelector("#no-friends");

    noFriends.style.display = "none";
    emailError.style.display = "none";
    collaboratorInput.classList.add("is-success");
    collaboratorInput.classList.remove("is-danger");
    collaboratorContainer.appendChild(addressHTML(collaboratorInput.value));
    collaboratorArray.push(addressHTML(collaboratorInput.value).innerHTML);
    collaboratorInput.value = "";
  } else {
    emailError.style.display = "block";
    collaboratorInput.classList.add("is-danger");
  }
});

function createAlert(msg, state) {
  const alertDiv = document.createElement("div");
  alertDiv.className = `notification is-${state} is-light has-text-centered`;
  const alertBtn = document.createElement("button");
  alertBtn.className = "delete";
  alertBtn.addEventListener("click", () => {
    alertDiv.parentNode.removeChild(alertDiv);
  });
  const alertText = document.createElement("p");
  alertText.className = "subtitle";
  alertText.innerText = msg;
  alertDiv.appendChild(alertBtn);
  alertDiv.appendChild(alertText);
  document.querySelector(".notification-container").appendChild(alertDiv);
}

function initiateEmbededCalendar() {
  let currentDate = new Date().toJSON().slice(0, 10);

  calendars = bulmaCalendar.attach('[type="datetime"]', {
    startDate: currentDate,
    minDate: currentDate,
    showHeader: false,
    displayMode: "inline",
    showClearButton: false,
    showTodayButton: false,
    showFooter: false,
    color: "info",
    minuteSteps: 30,
  });
}

function logOut() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      window.location = "index.html";
    })
    .catch((err) => {
      createAlert(err.message, "danger");
    });
}

function addAppointment(roomId, startTime, endTime) {
  firebase
    .database()
    .ref(`rooms/${roomId}/appointments`)
    .push({
      name: googleUser.uid || "Anonymous",
      guests: collaboratorArray,
      startTime,
      endTime,
    })
    .then((data) => {
      console.log(data);
    });
}
