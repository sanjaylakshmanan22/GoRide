document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser_user"));
  if (!currentUser || currentUser.role !== "user") {
    window.location.href = "login.html";
    return;
  }

  // Logout Handlers
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("currentUser_user");
      window.location.href = "login.html";
    });
  }

  const tableBody = document.getElementById("historyTableBody");
  const filterSelect = document.getElementById("filterSelect");

  const rides = JSON.parse(localStorage.getItem("rides")) || [];
  const userRides = rides.filter(r => r.user_id === currentUser.id);

  // Sorting Latest First
  userRides.sort((a, b) => {
    // Basic string comparison fallback if id is R+timestamp
    if (a.id > b.id) return -1;
    if (a.id < b.id) return 1;
    return 0;
  });

  function renderTable(filter = "All") {
    tableBody.innerHTML = "";

    const filtered = userRides.filter(r => {
      if (filter === "All") return true;
      return r.status.toLowerCase() === filter.toLowerCase();
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No rides found.</td></tr>`;
      return;
    }

    filtered.forEach(ride => {
      let statusClass = ride.status.toLowerCase();

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${ride.date}</td>
        <td>${ride.pickup}</td>
        <td>${ride.drop}</td>
        <td>₹${ride.fare}</td>
        <td class="${statusClass}">${ride.status}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  filterSelect.addEventListener("change", (e) => {
    renderTable(e.target.value);
  });

  renderTable(); // default All
});
