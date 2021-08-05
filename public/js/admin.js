console.log("working");
let currentroomHTML = document.querySelector("#white-box");

window.onload = (event) => {
  document.querySelector("#user").innerText = "Admin";
  updateRoomHTML();
};

function deleteRoom(element) {
  firebase
    .database()
    .ref(`rooms/${element.parentElement.firstElementChild.innerHTML}`)
    .remove()
    .then((data) => {
      console.log(data);
    });

  element.parentElement.parentElement.parentElement.parentElement.remove();
}

function addRoom() {
  const roomName = document.querySelector("#roomName");
  const roomLocation = document.querySelector("#roomLocation");
  const roomCapacity = document.querySelector("#roomCapacity");

  if (roomName.value == "") {
    alert("Required!");
    return;
  }

  if (roomCapacity.value == "") {
    roomCapacity.value = "None";
  } else if (isNaN(roomCapacity.value)) {
    alert("Capacity needs to be an integer!");
    return;
  }

  if (roomLocation.value == "") {
    roomLocation.value = "None";
  }

  addRoomDatabase(roomName.value, roomCapacity.value, roomLocation.value);
  updateRoomHTML();

  roomName.value = "";
  roomLocation.value = "";
  roomCapacity.value = "";
}

function addRoomDatabase(roomName, roomCapacity, roomLocation) {
  firebase
    .database()
    .ref(`rooms/${roomName}`)
    .set({
      capacity: roomCapacity,
      location: roomLocation,
    })
    .then((data) => {
      console.log(data);
    });
}

function updateRoomHTML() {
  firebase
    .database()
    .ref(`rooms/`)
    .on("value", (snapshot) => {
      const data = snapshot.val();
      let finalHTML = ``;

      for (dataIndex in data) {
        let roomHTML = `
                <div class="dropdown is-hoverable room-label">
                    <div class="dropdown-trigger">
                        <button class="button">
                            <span>${dataIndex}</span>
                            <span class="icon is-small">
                                <i class="fas fa-angle-down"></i>
                            </span>
                        </button>
                    </div>
                    <div class="dropdown-menu">
                        <div class="dropdown-content">
                            <div class="dropdown-item">
                                <strong>${dataIndex}</strong>
                                <hr class="dropdown-divider">
                                <p>Location: ${data[dataIndex].location}</p>
                                <p>Max Capacity: ${data[dataIndex].capacity}</p>
                                <hr class="dropdown-divider">
                                <a href="#" class="dropdown-item delete-text" onclick="deleteRoom(this)">Delete </a>                                
                            </div>
                        </div>
                    </div>
                </div>
            `;

        finalHTML += roomHTML;
      }
      currentroomHTML.innerHTML = finalHTML;
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


