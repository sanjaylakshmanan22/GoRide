document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser_driver"));
  if (!currentUser || currentUser.role !== "driver") {
    window.location.href = "login.html";
    return;
  }

  // Logout Handlers
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("currentUser_driver");
      window.location.href = "login.html";
    });
  }

  const earningsTotal = document.getElementById("earningsTotal");
  const onlineToggle = document.getElementById("onlineToggle");
  const toggleLabel = document.getElementById("toggleLabel");
  const ridesContainer = document.getElementById("ridesContainer");

  // Load Driver status
  const driversColl = JSON.parse(localStorage.getItem("drivers")) || [];
  const currDriverData = driversColl.find(d => d.id === currentUser.id);

  if (currDriverData) {
    earningsTotal.textContent = `₹${currDriverData.earnings || 0}`;
    onlineToggle.checked = currDriverData.isOnline;
    toggleLabel.textContent = currDriverData.isOnline ? "You are Online" : "You are Offline";
  }

  onlineToggle.addEventListener("change", (e) => {
    const isOnline = e.target.checked;
    toggleLabel.textContent = isOnline ? "You are Online" : "You are Offline";
    
    // update localStorage
    currDriverData.isOnline = isOnline;
    const updDrivers = driversColl.map(d => d.id === currentUser.id ? currDriverData : d);
    localStorage.setItem("drivers", JSON.stringify(updDrivers));
  });

  function updateDriverStats() {
    const rides = JSON.parse(localStorage.getItem("rides")) || [];
    const myCompletedRides = rides.filter(r => r.driver_id === currentUser.id && r.status === "Completed");
    
    // Total Rides
    const totalRidesCountEl = document.getElementById("totalRidesCount");
    if (totalRidesCountEl) {
      totalRidesCountEl.textContent = myCompletedRides.length;
    }

    // Avg Rating
    const ratedRides = myCompletedRides.filter(r => r.rating);
    const avgRatingStatEl = document.getElementById("avgRatingStat");
    if (avgRatingStatEl) {
      if (ratedRides.length > 0) {
        const sum = ratedRides.reduce((acc, r) => acc + r.rating, 0);
        const avg = (sum / ratedRides.length).toFixed(1);
        avgRatingStatEl.textContent = `${avg} ⭐`;
      } else {
        avgRatingStatEl.textContent = "0.0 ⭐";
      }
    }
  }

  updateDriverStats();

  function renderRides() {
    const rides = JSON.parse(localStorage.getItem("rides")) || [];
    const assignedRides = rides.filter(r => r.driver_id === currentUser.id && (r.status === "Pending" || r.status === "Ongoing"));

    // Remove old rides that are no longer assigned/Pending/Ongoing
    Array.from(ridesContainer.children).forEach(child => {
       const rideId = child.getAttribute("data-id");
       // Exclude the 'no_rides_msg' block from removal logic
       if (rideId && !assignedRides.find(r => r.id === rideId)) {
           child.remove();
       }
    });

    // Add or update rides
    assignedRides.forEach(ride => {
       let card = document.getElementById(`ride_card_${ride.id}`);
       if (!card) {
          card = document.createElement("div");
          card.className = "ride-card";
          card.id = `ride_card_${ride.id}`;
          card.setAttribute("data-id", ride.id);
          ridesContainer.appendChild(card);
       }
       
       const currentStatus = card.getAttribute("data-status");
       if (currentStatus !== ride.status) {
          card.setAttribute("data-status", ride.status);
          
          let html = `
            <p><b>Pickup:</b> ${ride.pickup}</p>
            <p><b>Drop:</b> ${ride.drop}</p>
            <p><b>Vehicle Type:</b> ${ride.vehicle_type}</p>
            <p><b>Distance:</b> ${ride.distance} km</p>
            <p><b>Fare:</b> ₹${ride.fare}</p>
          `;

          if (ride.status === "Pending") {
            html += `<button class="accept" onclick="acceptRide('${ride.id}')">Accept Ride</button>`;
          } else if (ride.status === "Ongoing") {
            html += `
              <div style="margin-top: 15px; padding: 15px; background: #f9f9f9; border-radius: 5px;">
                 <b>Ride Ongoing!</b>
                 <p style="margin:10px 0;font-size:13px;">Customer needs to provide 4-digit OTP to start the trip.</p>
                 <div class="otp-box">
                    <input type="text" id="otp_${ride.id}" placeholder="Enter OTP" maxlength="4">
                    <button onclick="startTrip('${ride.id}')">Start Trip</button>
                 </div>
              </div>
            `;
          }
          
          card.innerHTML = html;
       }
    });

    if (assignedRides.length === 0 && Array.from(ridesContainer.children).filter(c => c.getAttribute("data-id")).length === 0) {
      if (!document.getElementById("no_rides_msg")) {
        ridesContainer.innerHTML = "<p id='no_rides_msg'>No active ride requests right now.</p>";
      }
    } else {
      const msg = document.getElementById("no_rides_msg");
      if (msg) msg.remove();
    }
  }

  // Listen for storage events instead of polling
  window.addEventListener("storage", (e) => {
    if (e.key === "rides") {
      renderRides();
      updateDriverStats();
    }
  });

  renderRides(); // Initial render

  // Global functions for inline onclick handlers
  window.acceptRide = function(rideId) {
    const rides = JSON.parse(localStorage.getItem("rides")) || [];
    const rideIndex = rides.findIndex(r => r.id === rideId);
    if (rideIndex !== -1) {
      rides[rideIndex].status = "Ongoing";
      localStorage.setItem("rides", JSON.stringify(rides));
      renderRides(); // re-render immediately
    }
  };

  window.startTrip = function(rideId) {
    const inputOtp = document.getElementById(`otp_${rideId}`).value.trim();
    const rides = JSON.parse(localStorage.getItem("rides")) || [];
    const rideIndex = rides.findIndex(r => r.id === rideId);
    if (rideIndex !== -1) {
      if (rides[rideIndex].otp !== inputOtp) {
        alert("Invalid OTP! Please ask the customer.");
        return;
      }

      const ride = rides[rideIndex];
      // Simulate trip -> waiting 3 seconds -> ride complete
      const tripBtn = event.target;
      tripBtn.disabled = true;
      tripBtn.textContent = "Trip Started... Completing soon";

      setTimeout(() => {
        completeRide(rideId);
      }, 3000);
    }
  };

  function completeRide(rideId) {
    const rides = JSON.parse(localStorage.getItem("rides")) || [];
    const rideIndex = rides.findIndex(r => r.id === rideId);
    if (rideIndex !== -1) {
      const ride = rides[rideIndex];
      ride.status = "Completed";
      localStorage.setItem("rides", JSON.stringify(rides));

      // 1. Deduct customer wallet
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const userIndex = users.findIndex(u => u.id === ride.user_id);
      if (userIndex !== -1) {
        users[userIndex].wallet -= ride.fare;
        
        // append to transactions (make sure the user's transactions array exists, normally we do it directly in wallet, we will just use it on profile load)
        const trxs = JSON.parse(localStorage.getItem("transactions")) || [];
        trxs.push({
           user_id: ride.user_id,
           type: "Debit",
           amount: ride.fare,
           desc: `Ride - ${ride.pickup} to ${ride.drop}`,
           date: new Date().toLocaleDateString('en-GB')
        });
        localStorage.setItem("transactions", JSON.stringify(trxs));
        localStorage.setItem("users", JSON.stringify(users));
      }

      // 2. Add driver earnings
      const drivers = JSON.parse(localStorage.getItem("drivers")) || [];
      const drvIndex = drivers.findIndex(d => d.id === currentUser.id);
      if (drvIndex !== -1) {
        drivers[drvIndex].earnings = (drivers[drvIndex].earnings || 0) + ride.fare;
        localStorage.setItem("drivers", JSON.stringify(drivers));
        // Update local session to show real time
        earningsTotal.textContent = `₹${drivers[drvIndex].earnings}`;
      }

      alert(`Trip Completed! You earned ₹${ride.fare}`);
      renderRides();
      updateDriverStats();
    }
  }

});
