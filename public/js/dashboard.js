const collaboratorInput = document.querySelector('#addCollaborators');
const emailError = document.querySelector('#email-error');
let noFriends = document.querySelector('#no-friends');
let  collaboratorContainer = document.querySelector('#collaborator-container');

function toggleBookModal() {
    bookModal.classList.toggle('is-active');
    resetBookModal();
}

function bookRoom() {
    bookModal.classList.toggle('is-active');
    console.log("Room Booked!");
}

function validateEmail(email) {
    const regexExpression = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regexExpression.test(email);
}

function addressHTML(email) {
    let address = document.createElement("a");
    address.innerHTML = `${collaboratorInput.value}`;
    address.classList.add("collaborator-email");

    address.onclick = function () {
        this.parentElement.removeChild(this);
        checkCollaboratorEmpty();
    };
    return address;
}

function checkCollaboratorEmpty() {
    collaboratorContainer = document.querySelector('#collaborator-container');

    if (collaboratorContainer.childElementCount <= 1) {
        noFriends = document.querySelector('#no-friends');
        noFriends.style = "";
    };
}

function resetBookModal() {
    collaboratorContainer.innerHTML = `<p class="no-friends" id="no-friends">Currently no one invited</p>`;
    collaboratorInput.value = "";
    collaboratorInput.classList.remove("is-danger");
    collaboratorInput.classList.remove("is-success");
    noFriends.style.display = "";
    emailError.style.display = "none";
}

collaboratorInput.addEventListener('change', (key) => {
    if (validateEmail(collaboratorInput.value)) {
        noFriends = document.querySelector('#no-friends');

        noFriends.style.display = "none";
        emailError.style.display = "none";
        collaboratorInput.classList.add("is-success");
        collaboratorInput.classList.remove("is-danger");
        collaboratorContainer.appendChild(addressHTML(collaboratorInput.value))
        collaboratorInput.value = "";
  } else {
        emailError.style.display = "block";
        collaboratorInput.classList.add("is-danger");
  }
});

