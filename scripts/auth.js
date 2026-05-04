const usersKey = "team47Users";
const currentUserKey = "team47CurrentUser";

function getUsers() {
  return JSON.parse(localStorage.getItem(usersKey)) || [];
}

function saveUsers(users) {
  localStorage.setItem(usersKey, JSON.stringify(users));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem(currentUserKey)) || null;
}

function saveCurrentUser(user) {
  localStorage.setItem(currentUserKey, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(currentUserKey);
}

function showAuthMessage(message, type = "error", form = document) {
  const messageElement = form.querySelector(".form-message");

  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.className = `form-message ${type}`;
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function initRegisterForm() {
  const registerForm = document.querySelector("#registerForm");

  if (!registerForm) {
    return;
  }

  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const firstName = document.querySelector("#firstName").value.trim();
    const lastName = document.querySelector("#lastName").value.trim();
    const email = normalizeEmail(document.querySelector("#registerEmail").value);
    const password = document.querySelector("#registerPassword").value;
    const confirmPassword = document.querySelector("#confirmPassword").value;
    const users = getUsers();

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showAuthMessage("Please fill in all fields.");
      return;
    }

    if (!isValidEmail(email)) {
      showAuthMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      showAuthMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      showAuthMessage("Passwords do not match.");
      return;
    }

    if (users.some((user) => user.email === email)) {
      showAuthMessage("An account with this email already exists.");
      return;
    }

    const user = {
      firstName,
      lastName,
      email,
      password
    };

    users.push(user);
    saveUsers(users);
    saveCurrentUser({ firstName, lastName, email });
    showAuthMessage("Account created successfully. Redirecting...", "success");

    setTimeout(() => {
      window.location.href = "Homepage.html";
    }, 700);
  });
}

function initLoginForm() {
  const loginForms = document.querySelectorAll(".loginForm");

  if (!loginForms.length) {
    return;
  }

  loginForms.forEach((loginForm) => {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = normalizeEmail(loginForm.querySelector(".loginEmail").value);
      const password = loginForm.querySelector(".loginPassword").value;
      const users = getUsers();
      const user = users.find((item) => item.email === email && item.password === password);

      if (!email || !password) {
        showAuthMessage("Please enter your email and password.", "error", loginForm);
        return;
      }

      if (!user) {
        showAuthMessage("Email or password is incorrect.", "error", loginForm);
        return;
      }

      saveCurrentUser({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
      showAuthMessage("Logged in successfully. Redirecting...", "success", loginForm);

      setTimeout(() => {
        window.location.href = "Homepage.html";
      }, 700);
    });
  });
}

function initAuthNav() {
  const currentUser = getCurrentUser();
  const loginLink = document.querySelector('.navBarButtons a[href="login.html"]');
  const registerPrompt = document.querySelector(".navBarRightSec .navBarRegister");

  if (!loginLink) {
    return;
  }

  if (!currentUser) {
    return;
  }

  loginLink.href = "#";
  loginLink.querySelector(".navBarButton").textContent = "Logout";

  if (registerPrompt) {
    registerPrompt.innerHTML = `Welcome, <span style="color: rgb(54, 189, 252);">${currentUser.firstName}</span>`;
  }

  loginLink.addEventListener("click", (event) => {
    event.preventDefault();
    clearCurrentUser();
    window.location.href = "Homepage.html";
  });
}
