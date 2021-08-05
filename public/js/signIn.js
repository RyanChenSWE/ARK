document.querySelector("#login").addEventListener("click", () => {
  toggleLoginModal();
});

document.querySelector("#register").addEventListener("click", () => {
  toggleSignUpModal();
});

const signInWithGoogle = () => {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase
    .auth()
    .signInWithPopup(provider)
    .then((result) => {
      /** @type {firebase.auth.OAuthCredential} */
      var credential = result.credential;
      var token = credential.accessToken;

      // The signed-in user info.
      var user = result.user;
      window.location = "dashboard.html";
    })
    .catch((error) => {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      const err = {
        errorCode,
        errorMessage,
        email,
        credential,
      };
      createAlert(error.message);
    });
};

const signInWithEmail = () => {
  const email = document.querySelector("#loginModal").querySelector('input[type="email"]');
  const password = document.querySelector("#loginModal").querySelector('input[type="password"]');

  firebase
    .auth()
    .signInWithEmailAndPassword(email.value, password.value)
    .then((userCredential) => {
      var user = userCredential.user;
      window.location = "dashboard.html";
    })
    .catch((err) => {
      createAlert(err.message, "danger");
    });
};

const toggleLoginModal = () => {
  const loginModal = document.querySelector("#loginModal");
  loginModal.classList.toggle("is-active");
};

const toggleSignUpModal = () => {
  const signUpModal = document.querySelector("#signUpModal");
  signUpModal.classList.toggle("is-active");
};

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

document
  .querySelector("#signUpModal")
  .querySelector("form")
  .addEventListener("submit", (e) => {
    e.preventDefault();
    const el = e.target;
    const emailEl = el.querySelector('input[type="email"]');
    const passwordEl = el.querySelector("#password");
    const confirmPasswordEl = el.querySelector("#confirm_password");
    if (passwordEl.value != confirmPasswordEl.value) {
      createAlert("Password doesn't match. Please try again.", "danger");
    } else {
      // Sign in with Email: https://firebase.google.com/docs/auth/web/password-auth
      firebase
        .auth()
        .createUserWithEmailAndPassword(emailEl.value, passwordEl.value)
        .then((userCredentials) => {
          window.location = "dashboard.html";
        })
        .catch((err) => {
          createAlert(err.message, "danger");
        });

      emailEl.value = "";
      passwordEl.value = "";
    }

    confirmPasswordEl.value = "";
  });
