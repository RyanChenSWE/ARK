const collaboratorInput = document.querySelector("#addCollaborators");
const emailError = document.querySelector("#email-error");
let noFriends = document.querySelector("#no-friends");
let collaboratorContainer = document.querySelector("#collaborator-container");
let googleUser;
let accordions;
var calendars;
var startTimeString;
var endTimeString;
var collaboratorArray = [];
var startTime;
var endTime;
var roomId;
initiateEmbededCalendar();

document.querySelector("#myAppointments").addEventListener("click", openMyAppointments);
document
  .querySelector("#appointmentsModal")
  .querySelector("button")
  .addEventListener("click", () => {
    toggleAppointmentsModal();
  });
document.querySelector("#butt").addEventListener("click", toggleBookModal);
document.querySelector("#cancel").addEventListener("click", toggleBookModal);
document.querySelector("#book").addEventListener("click", bookRoom);
document.querySelector("#logOut").addEventListener("click", logOut);

window.onload = (event) => {
  // Use this to retain user state between html pages.
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      document.querySelector("#user").innerText = user.displayName || "Anonymous";
      googleUser = user;

      if (googleUser.email == "admin@cssiark.com") {
        document.querySelector("#user").innerText = "Admin";
        isAdmin();
      }
    } else {
      // If not logged in, navigate back to login page.
      window.location = "index.html";
    }
  });

  updateRoomOptions();
};

function toggleBookModal() {
  bookModal.classList.toggle("is-active");
  resetBookModal();
}

function bookRoom() {
  const roomEl = bookModal.querySelector("select");
  roomId = roomEl.options[roomEl.selectedIndex].value;
  console.log(roomId);
  startTime = calendars[0].time.start;
  endTime = calendars[0].time.end;

  startTime.setDate(calendars[0].date.start.getDate());
  endTime.setDate(calendars[0].date.start.getDate());
  addAppointment(roomId, startTime, endTime);
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

function updateRoomOptions() {
  const optionContainer = document.querySelector("#options-container");

  firebase
    .database()
    .ref(`rooms/`)
    .on("value", (snapshot) => {
      const data = snapshot.val();
      optionContainer.innerHTML = ``;

      for (let dataIndex in data) {
        let option = document.createElement("option");
        option.innerHTML = dataIndex;
        optionContainer.appendChild(option);
      }
    });
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
  alertText.innerHTML = msg;
  alertDiv.appendChild(alertBtn);
  alertDiv.appendChild(alertText);
  document.querySelector(".notification-container").appendChild(alertDiv);
}

function initiateEmbededCalendar() {
  let currentDate = new Date().toJSON().slice(0, 10);
  calendars = bulmaCalendar.attach('[type="datetime"]', {
    startDate: currentDate,
    startTime: getNearestHalfHourTime(),
    endTime: getNearestHalfHourTime(),
    minDate: currentDate,
    displayMode: "inline",
    color: "info",
    isRange: true,
    showHeader: false,
    showClearButton: false,
    showTodayButton: false,
    showFooter: false,
    minuteSteps: 30,
  });
  startTimeString = calendars[0].time.start.toJSON().toString();
  endTimeString = calendars[0].time.end.toJSON().toString();
  // console.log(startTimeString);
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

function isAdmin() {
  const navBar = document.querySelector("#navbar-end");

  let adminMenu = document.createElement("a");
  adminMenu.classList.add("navbar-item");
  adminMenu.innerHTML = "Admin Menu";
  adminMenu.setAttribute("href", "admin.html");
  navBar.prepend(adminMenu);
}

function addAppointment(roomId, startTime, endTime) {
  // Firebase will ignore the field if it has [](empty array)
  let guests = collaboratorArray;
  if (guests.length === 0) {
    guests = "None";
  }

  const appointmentsRef = firebase.database().ref(`rooms/${roomId}/appointments`);

  const resp = isOverlapped(appointmentsRef, startTime, endTime);

  if (!resp[0]) {
    appointmentsRef
      .push({
        name: googleUser.uid,
        guests,
        startTime: startTime.toJSON(),
        endTime: endTime.toJSON(),
      })
      .then(() => {
        bookModal.classList.toggle("is-active");
        createAlert(`Room ${roomId} booked!`, "success");
      });
  } else {
    createAlert(
      `Your appointment is conflicting with another event ends at <b>${moment(resp[1]).format(
        "MMMM Do YYYY, h:mm a"
      )}</b>.`,
      "warning"
    );
  }
}

document
  .querySelector("#bookModal")
  .querySelector("select")
  .addEventListener("change", (e) => {
    setRoomInfo();
  });

function setRoomInfo() {
  const selectEl = document.querySelector("#bookModal").querySelector("select");
  const roomId = selectEl.options[selectEl.selectedIndex].value;
  // Add short summary retrieved from firebase to book modal.
  const roomRef = firebase.database().ref(`rooms/${roomId}`);
  const summaryEl = document.querySelector("#bookModal").querySelector(".regulations");
  roomRef.on("value", (snapshot) => {
    const data = snapshot.val();
    summaryEl.querySelector("label").innerText = data.location;
    summaryEl.querySelector("p").innerText = "Capacity: " + data.capacity;
  });
}

function isOverlapped(appointmentsRef, startTime, endTime) {
  // Check if the event is overlapped with other events.
  // const startTimeObj = new Date(startTime);
  // const endTimeObj = new Date(endTime);
  let returnVal = [false, ""];
  appointmentsRef.once("value", (snapshot) => {
    const data = snapshot.val();
    for (let event in data) {
      // const eventStartTime = new Date(data[event].startTime);
      const eventEndTime = new Date(data[event].endTime);
      // Only check for overlapping if dates are the same.
      if (startTime.getDate() == eventEndTime.getDate() && startTime.getTime() <= eventEndTime.getTime()) {
        returnVal = [true, eventEndTime];
      }
    }
  });
  return returnVal;
}

function getNearestHalfHourTime() {
  let now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30);
  return now;
}

function openMyAppointments() {
  const accordionsEl = document.querySelector("#appointmentsModal").querySelector(".accordions");

  firebase
    .database()
    .ref(`rooms`)
    .on("value", (snapshot) => {
      const data = snapshot.val();
      accordionsEl.innerHTML = "";
      for (let room in data) {
        const allAppointments = data[room].appointments;
        if (allAppointments) {
          // Filter by name from https://stackoverflow.com/questions/37615086/how-to-filter-a-dictionary-by-value-in-javascript
          const myAppointments = Object.fromEntries(
            Object.entries(allAppointments).filter(([_, value]) => value.name == googleUser.uid)
          );
          for (const appointmentId in myAppointments) {
            const appointment = myAppointments[appointmentId];
            const item = _createAccordionItem(
              room,
              appointmentId,
              data[room].location,
              data[room].capacity,
              appointment.startTime,
              appointment.endTime,
              appointment.guests
            );
            accordionsEl.appendChild(item);
          }
        }
      }
      accordions = bulmaAccordion.attach(); // Initalize bulma Accordion
    });
  toggleAppointmentsModal();
}

function _createAccordionItem(roomId, appointmentId, location, capacity, startTime, endTime, guests) {
  const parentEl = document.createElement("article");
  parentEl.className = "accordion";

  const header = document.createElement("div");
  header.className = "accordion-header toggle";
  const headerText = document.createElement("p");
  headerText.innerText = `${moment(startTime).format("MMMM Do, hh:mm A")} - ${moment(endTime).format(
    "MMMM Do, hh:mm A"
  )}`;
  header.appendChild(headerText);

  const body = document.createElement("div");
  body.className = "accordion-body";
  const bodyContent = document.createElement("div");
  bodyContent.className = "accordion-content columns";
  bodyContent.innerHTML = `
    <div class="column">
      <p>Room: ${roomId}</p>
      <p>Location: ${location}</p>
      <p>Capacity: ${capacity}</p>
    </div>
  `;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "button is-danger is-outlined";
  deleteBtn.innerText = "Delete Appointment";
  deleteBtn.addEventListener("click", (e) => {
    deleteAppointment(e, roomId, appointmentId);
  });

  bodyContent.querySelector(".column").appendChild(deleteBtn);
  const guestsCol = document.createElement("div");
  guestsCol.className = "column is-flex-direction-row";
  guestsCol.appendChild(addGuests(guests));
  bodyContent.appendChild(guestsCol);
  body.appendChild(bodyContent);

  parentEl.appendChild(header);
  parentEl.appendChild(body);

  return parentEl;
}

function addGuests(guests) {
  const dropdown = document.createElement("div");
  dropdown.className = "dropdown";

  const dropdownTrigger = document.createElement("div");
  dropdownTrigger.className = "dropdown-trigger";
  const triggerBtn = document.createElement("button");
  triggerBtn.className = "button";
  triggerBtn.setAttribute("aria-haspopup", "true");
  triggerBtn.setAttribute("aria-controls", "dropdown-menu");
  triggerBtn.innerHTML = `
    <span>Guests</span>
    <span class="icon is-small">
      <i class="fas fa-angle-down" aria-hidden="true"></i>
    </span>
  `;
  triggerBtn.addEventListener("click", (e) => {
    // Go all the way up to <div class="dropdown">
    e.target.parentNode.parentNode.parentNode.classList.toggle("is-active");
  });
  dropdownTrigger.appendChild(triggerBtn);

  const dropdownMenu = document.createElement("div");
  dropdownMenu.className = "dropdown-menu";
  dropdownMenu.id = "dropdown-menu";
  dropdownMenu.setAttribute("role", "menu");

  const dropdownMenuContent = document.createElement("div");
  dropdownMenuContent.className = "dropdown-content";

  if (guests !== "None") {
    guests.forEach((guest) => {
      const dropdownItem = document.createElement("a");
      dropdownItem.className = "dropdown-item";
      dropdownItem.setAttribute("href", "#");
      dropdownItem.innerText = guest;
      dropdownMenuContent.appendChild(dropdownItem);
    });
  }

  dropdownMenu.appendChild(dropdownMenuContent);
  dropdown.appendChild(dropdownTrigger);
  dropdown.appendChild(dropdownMenu);

  return dropdown;
}

function toggleAppointmentsModal() {
  document.querySelector("#appointmentsModal").classList.toggle("is-active");
}
function getStartTime() {
  return startTime;
}
function getEndTime() {
  return endTime;
}
function getRoomId() {
  return roomId;
}

function deleteAppointment(e, roomId, appointmentId) {
  firebase.database().ref(`rooms/${roomId}/appointments/${appointmentId}`).remove();
  accordions - bulmaAccordion.attach();
  // console.log(e);
  // const thisAccordion = e.target.parentNode.parentNode.parentNode.parenNode;
  // const accordionsContainer = thisAccordion.parentNode;
  // accordionsContainer.removeChild(thisAccordion);
}

export { startTimeString, endTimeString, getEndTime, getStartTime, getRoomId };
