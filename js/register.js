document.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.getElementById("registerBtn");
  const nameInput = document.getElementById("nameInput");
  const emailInput = document.getElementById("emailInput");
  const phoneInput = document.getElementById("phoneInput");
  const passwordInput = document.getElementById("passwordInput");
  const roleSelect = document.getElementById("roleSelect");

  registerBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value;
    const role = roleSelect.value;

    // Validations
    if (!name || !email || !phone || !password) {
      alert("All fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    const collectionName = role === "user" ? "users" : "drivers";
    const accounts = JSON.parse(localStorage.getItem(collectionName)) || [];

    // Check if email already exists
    if (accounts.some(acc => acc.email === email)) {
      alert("An account with this email already exists.");
      return;
    }

    // Generate unique ID
    const newId = collectionName.charAt(0) + Date.now().toString(36);

    const newUser = {
      id: newId,
      name,
      email,
      phone,
      password,
      role,
      wallet: 0 // Initialize wallet to 0
    };

    if (role === "driver") {
      newUser.isOnline = false;
      newUser.earnings = 0;
    }

    accounts.push(newUser);
    localStorage.setItem(collectionName, JSON.stringify(accounts));

    alert("Registration successful! You can now login.");
    window.location.href = "login.html";
  });
});
