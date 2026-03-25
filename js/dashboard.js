document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser_user"));
  if (!currentUser || currentUser.role !== "user") {
    window.location.href = "index.html";
    return;
  }

  // Set greeting
  const greetingEl = document.getElementById("welcomeGreeting");
  if (greetingEl) {
    greetingEl.textContent = `Welcome Back, ${currentUser.name.split(' ')[0]} 👋`;
  }

  // Logout functionality inside sidebar
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("currentUser_user");
      window.location.href = "index.html";
    });
  }

  // Load Dashboard Stats
  const rides = JSON.parse(localStorage.getItem("rides")) || [];
  const userRides = rides.filter(r => r.user_id === currentUser.id);
  
  const totalRides = userRides.length;
  const completedRides = userRides.filter(r => r.status === "Completed").length;
  const upcomingRides = userRides.filter(r => r.status === "Pending" || r.status === "Ongoing").length;

  document.getElementById("totalRidesStat").textContent = totalRides;
  document.getElementById("completedRidesStat").textContent = completedRides;
  document.getElementById("upcomingRidesStat").textContent = upcomingRides;

  // Render recent rides
  const rideListContainer = document.getElementById("recentRidesList");
  rideListContainer.innerHTML = "";

  const recent = userRides.slice().reverse().slice(0, 3); // top 3 recent rides

  if (recent.length === 0) {
    rideListContainer.innerHTML = "<p>No recent rides found.</p>";
  } else {
    recent.forEach(ride => {
      let statusClass = ride.status.toLowerCase();
      
      const card = document.createElement("div");
      card.className = "ride-card";
      card.innerHTML = `
        <p><b>Pickup:</b> ${ride.pickup}</p>
        <p><b>Drop:</b> ${ride.drop}</p>
        <p><b>Date:</b> ${ride.date}</p>
        <p class="status ${statusClass}">${ride.status}</p>
      `;
      rideListContainer.appendChild(card);
    });
  }
});
