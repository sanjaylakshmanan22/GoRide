document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser_user"));
  if (!currentUser || currentUser.role !== "user") {
    window.location.href = "index.html";
    return;
  }

  // Logout Handlers
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("currentUser_user");
      window.location.href = "index.html";
    });
  }

  // Profile DOM
  const userNameEl = document.getElementById("userName");
  const userPhoneEl = document.getElementById("userPhone");
  const userEmailEl = document.getElementById("userEmail");
  const userRoleEl = document.getElementById("userRole");

  const editNameInp = document.getElementById("editName");
  const editPhoneInp = document.getElementById("editPhone");
  const editProfileBtn = document.getElementById("editProfileBtn");

  // Wallet DOM
  const walletAmountEl = document.getElementById("walletAmount");
  const addMoneyBtn = document.getElementById("addMoneyBtn");
  const txListEl = document.getElementById("transactionsList");

  // Initialize Data
  // Reload users list to get the latest wallet balance (in case it was updated by driver)
  function refreshUserData() {
    const list = JSON.parse(localStorage.getItem(currentUser.role === "user" ? "users" : "drivers")) || [];
    const updatedUser = list.find(u => u.id === currentUser.id);
    if (updatedUser) {
      localStorage.setItem("currentUser_user", JSON.stringify(updatedUser));
      Object.assign(currentUser, updatedUser);
    }
    
    // Set Profile texts
    userNameEl.textContent = currentUser.name;
    userPhoneEl.textContent = currentUser.phone;
    userEmailEl.textContent = currentUser.email;
    userRoleEl.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    
    // Set Inputs
    editNameInp.value = currentUser.name;
    editPhoneInp.value = currentUser.phone;

    // Set Wallet text
    walletAmountEl.innerHTML = `&#8377; ${currentUser.wallet || 0}`;
    renderTransactions();
  }

  // Transactions Logic
  function renderTransactions() {
    const allTx = JSON.parse(localStorage.getItem("transactions")) || [];
    const myTx = allTx.filter(t => t.user_id === currentUser.id).reverse(); // Latest first

    txListEl.innerHTML = "";
    if (myTx.length === 0) {
      txListEl.innerHTML = "<p>No recent transactions.</p>";
      return;
    }

    myTx.forEach(tx => {
      const cls = tx.type === "Credit" ? "credit" : "debit";
      const sign = tx.type === "Credit" ? "+" : "-";

      const tDiv = document.createElement("div");
      tDiv.className = "transaction";
      tDiv.innerHTML = `
        <div>
          <span>${tx.desc}</span>
          <span class="tx-date">${tx.date}</span>
        </div>
        <span class="${cls}">${sign} &#8377;${tx.amount}</span>
      `;
      txListEl.appendChild(tDiv);
    });
  }

  // Edit Profile Logic
  let isEditing = false;
  editProfileBtn.addEventListener("click", () => {
    isEditing = !isEditing;
    
    if (isEditing) {
      // Toggle to Edit mode
      userNameEl.classList.add("editing");
      userPhoneEl.classList.add("editing");
      editNameInp.classList.add("editing");
      editPhoneInp.classList.add("editing");
      editProfileBtn.textContent = "Save Profile";
      editProfileBtn.style.background = "#2ecc71";
      editProfileBtn.style.color = "white";
    } else {
      // Save logic
      const newName = editNameInp.value.trim();
      const newPhone = editPhoneInp.value.trim();

      if (!newName || !newPhone) {
        alert("Name and Phone are required.");
        isEditing = true; // prevent toggling back
        return;
      }
      if (!/^\\d{10}$/.test(newPhone)) {
        alert("Phone number must be exactly 10 digits.");
        isEditing = true; 
        return;
      }

      // Update LocalStorage
      const collName = currentUser.role === "user" ? "users" : "drivers";
      const accounts = JSON.parse(localStorage.getItem(collName)) || [];
      const updIdx = accounts.findIndex(a => a.id === currentUser.id);
      
      if (updIdx !== -1) {
        accounts[updIdx].name = newName;
        accounts[updIdx].phone = newPhone;
        localStorage.setItem(collName, JSON.stringify(accounts));
        
        currentUser.name = newName;
        currentUser.phone = newPhone;
        localStorage.setItem("currentUser_user", JSON.stringify(currentUser));
      }

      // Toggle to Normal mode
      userNameEl.classList.remove("editing");
      userPhoneEl.classList.remove("editing");
      editNameInp.classList.remove("editing");
      editPhoneInp.classList.remove("editing");
      editProfileBtn.textContent = "Edit Profile";
      editProfileBtn.style.background = "#FFD400";
      editProfileBtn.style.color = "black";
      
      refreshUserData();
      alert("Profile updated successfully!");
    }
  });

  // Add Money Logic
  addMoneyBtn.addEventListener("click", () => {
    const amountStr = prompt("Enter amount to add to wallet (in ₹):");
    if (!amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid amount.");
      return;
    }

    // Update wallet
    const collName = currentUser.role === "user" ? "users" : "drivers";
    const accounts = JSON.parse(localStorage.getItem(collName)) || [];
    const updIdx = accounts.findIndex(a => a.id === currentUser.id);

    if (updIdx !== -1) {
      accounts[updIdx].wallet = (accounts[updIdx].wallet || 0) + amount;
      localStorage.setItem(collName, JSON.stringify(accounts));
    }

    // Add Transaction
    const allTx = JSON.parse(localStorage.getItem("transactions")) || [];
    allTx.push({
      user_id: currentUser.id,
      type: "Credit",
      amount: amount,
      desc: "Wallet Recharge",
      date: new Date().toLocaleDateString('en-GB')
    });
    localStorage.setItem("transactions", JSON.stringify(allTx));

    refreshUserData();
    alert(`₹${amount} added cleanly to your wallet!`);
  });

  refreshUserData();
});
