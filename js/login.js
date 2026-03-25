document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");
  const roleSelect = document.getElementById("roleSelect");

  // On login page load, if a user is already logged in for that specific role, 
  // we could redirect them but since they can be both, we will just let them select role and if that role is logged in, redirect.
  roleSelect.addEventListener("change", () => {
    const r = roleSelect.value;
    if (r === "user" && localStorage.getItem("currentUser_user")) {
        window.location.href = "dashboard.html";
    }
    if (r === "driver" && localStorage.getItem("currentUser_driver")) {
        window.location.href = "driver.html";
    }
  });

  loginBtn.addEventListener("click", () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const role = roleSelect.value;

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    const collectionName = role === "user" ? "users" : "drivers";
    const accounts = JSON.parse(localStorage.getItem(collectionName)) || [];

    const foundAccount = accounts.find(acc => acc.email === email && acc.password === password);

    if (foundAccount) {
      if (role === "user") {
        localStorage.setItem("currentUser_user", JSON.stringify(foundAccount));
        window.location.href = "dashboard.html";
      } else {
        localStorage.setItem("currentUser_driver", JSON.stringify(foundAccount));
        window.location.href = "driver.html";
      }
    } else {
      alert("Invalid email or password!");
    }
  });
});
