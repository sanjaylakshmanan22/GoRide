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

  const pickupInput = document.getElementById("pickupInput");
  const dropInput = document.getElementById("dropInput");
  const vehicleSelect = document.getElementById("vehicleSelect");
  const fareDisplay = document.getElementById("estimatedFare");
  const bookBtn = document.getElementById("bookBtn");
  const walletErr = document.getElementById("walletErr");

  const activeRideStatus = document.getElementById("activeRideStatus");
  const statusMessage = document.getElementById("statusMessage");
  
  const cancelRideBtn = document.getElementById("cancelRideBtn");
  const ratingSection = document.getElementById("ratingSection");
  const starContainer = document.getElementById("starContainer");
  const reviewText = document.getElementById("reviewText");
  const submitReviewBtn = document.getElementById("submitReviewBtn");
  const ratingMessage = document.getElementById("ratingMessage");
  const stars = document.querySelectorAll(".star");
  let selectedRating = 0;

  // Rate config
  const rates = {
    Bike: 5,
    Auto: 8,
    Car: 12
  };

  let estimatedPrice = 0;
  let simulatedDistance = 0;

  function calculateFare() {
    const pickup = pickupInput.value.trim();
    const drop = dropInput.value.trim();
    const vehicle = vehicleSelect.value;
    
    if (pickup && drop && pickup.toLowerCase() !== drop.toLowerCase()) {
      // simulate random distance between 2 and 20 km
      // use simple hash to make distance consistent for same pickup/drop combination
      let hash = 0;
      let combined = pickup+drop;
      for (let i = 0; i < combined.length; i++) {
        hash = combined.charCodeAt(i) + ((hash << 5) - hash);
      }
      simulatedDistance = Math.abs(hash) % 18 + 2; // 2 to 19 km
      
      estimatedPrice = simulatedDistance * rates[vehicle];
      fareDisplay.textContent = `₹${estimatedPrice}`;
      
      // check wallet
      if (currentUser.wallet < estimatedPrice) {
        walletErr.style.display = "block";
        walletErr.textContent = `Insufficient Wallet Balance (₹${currentUser.wallet}). Please add money.`;
        bookBtn.disabled = true;
      } else {
        walletErr.style.display = "none";
        bookBtn.disabled = false;
      }

    } else {
      fareDisplay.textContent = "₹0";
      bookBtn.disabled = true;
      if (pickup && drop && pickup.toLowerCase() === drop.toLowerCase()) {
         walletErr.style.display = "block";
         walletErr.textContent = "Pickup and Drop cannot be the same.";
      } else {
         walletErr.style.display = "none";
      }
    }
  }

  pickupInput.addEventListener("input", calculateFare);
  dropInput.addEventListener("input", calculateFare);
  vehicleSelect.addEventListener("change", calculateFare);

  bookBtn.addEventListener("click", () => {
    // assign driver
    const drivers = JSON.parse(localStorage.getItem("drivers")) || [];
    const onlineDrivers = drivers.filter(d => d.isOnline);

    if (onlineDrivers.length === 0) {
      alert("No drivers are currently online. Please try again later.");
      return;
    }

    const assignedDriver = onlineDrivers[Math.floor(Math.random() * onlineDrivers.length)];
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit otp
    const rideId = "R" + Date.now();

    const newRide = {
      id: rideId,
      user_id: currentUser.id,
      driver_id: assignedDriver.id,
      pickup: pickupInput.value.trim(),
      drop: dropInput.value.trim(),
      vehicle_type: vehicleSelect.value,
      distance: simulatedDistance,
      fare: estimatedPrice,
      status: "Pending", // Pending -> Ongoing -> Completed
      otp: otp,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    const rides = JSON.parse(localStorage.getItem("rides")) || [];
    rides.push(newRide);
    localStorage.setItem("rides", JSON.stringify(rides));

    // UI Updates
    pickupInput.disabled = true;
    dropInput.disabled = true;
    vehicleSelect.disabled = true;
    bookBtn.disabled = true;
    bookBtn.textContent = "Searching for driver...";

    setTimeout(() => {
      bookBtn.style.display = "none";
      activeRideStatus.style.display = "block";
      activeRideStatus.setAttribute("data-ride-id", rideId);
      statusMessage.innerHTML = `
        Driver <b>${assignedDriver.name}</b> assigned.<br>
        Vehicle: ${vehicleSelect.value}<br>
        Provide OTP <b>${otp}</b> to driver to start the ride.<br><br>
        <span style="color:gray">Waiting for driver to reach pickup...</span>
      `;
      updateRideStatus(rideId);
    }, 1500); // simulate searching delay
  });

  function updateRideStatus(rideId) {
    const rides = JSON.parse(localStorage.getItem("rides")) || [];
    const currentRide = rides.find(r => r.id === rideId);
    
    if (!currentRide) return;

    // Reset visibility
    if (cancelRideBtn) cancelRideBtn.style.display = "none";
    if (ratingSection) ratingSection.style.display = "none";

    if (currentRide.status === "Pending") {
      if (cancelRideBtn) cancelRideBtn.style.display = "block";
    } else if (currentRide.status === "Ongoing") {
      statusMessage.innerHTML = `Ride is Ongoing. Sit back and relax.`;
      if (cancelRideBtn) cancelRideBtn.style.display = "block";
    } else if (currentRide.status === "Completed") {
      statusMessage.innerHTML = `<span style="color:green;font-weight:bold;">Ride Completed!</span> Fare of ₹${currentRide.fare} has been deducted from wallet. <a href="history.html">View History</a>`;
      
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const syncedUser = users.find(u => u.id === currentUser.id);
      if (syncedUser) {
         localStorage.setItem("currentUser_user", JSON.stringify(syncedUser));
      }

      // Show rating UI if not already rated
      if (currentRide.rating) {
        if (ratingSection) {
          ratingSection.style.display = "block";
          starContainer.style.display = "none";
          reviewText.style.display = "none";
          submitReviewBtn.style.display = "none";
          ratingMessage.style.display = "block";
          ratingMessage.textContent = `You rated: ${'★'.repeat(currentRide.rating)}${'☆'.repeat(5 - currentRide.rating)}`;
        }
      } else {
        if (ratingSection) {
          ratingSection.style.display = "block";
          starContainer.style.display = "block";
          reviewText.style.display = "block";
          submitReviewBtn.style.display = "block";
          ratingMessage.style.display = "none";
          
          // Reset stars
          selectedRating = 0;
          updateStarUI(0);
          if (reviewText) reviewText.value = "";
        }
      }
    } else if (currentRide.status === "Cancelled") {
      statusMessage.innerHTML = `<span style="color:red;font-weight:bold;">Ride Cancelled.</span>`;
    }
  }

  window.addEventListener("storage", (e) => {
    if (e.key === "rides" && activeRideStatus.style.display === "block") {
       const rideId = activeRideStatus.getAttribute("data-ride-id");
       if (rideId) updateRideStatus(rideId);
    }
  });

  if (cancelRideBtn) {
    cancelRideBtn.addEventListener("click", () => {
      const rideId = activeRideStatus.getAttribute("data-ride-id");
      if (!rideId) return;
      
      const rides = JSON.parse(localStorage.getItem("rides")) || [];
      const rideIndex = rides.findIndex(r => r.id === rideId);
      if (rideIndex !== -1 && (rides[rideIndex].status === "Pending" || rides[rideIndex].status === "Ongoing")) {
        rides[rideIndex].status = "Cancelled";
        localStorage.setItem("rides", JSON.stringify(rides));
        updateRideStatus(rideId);
        alert("Ride cancelled successfully.");
      }
    });
  }

  // Rating interaction logic
  function updateStarUI(rating) {
    stars.forEach(star => {
      const val = parseInt(star.getAttribute("data-value"));
      if (val <= rating) {
        star.textContent = "★";
        star.style.color = "#FFD700";
      } else {
        star.textContent = "☆";
        star.style.color = "#ccc";
      }
    });
  }

  stars.forEach(star => {
    star.addEventListener("mouseover", (e) => {
      const val = parseInt(e.target.getAttribute("data-value"));
      updateStarUI(val);
    });
    star.addEventListener("mouseout", () => {
      updateStarUI(selectedRating);
    });
    star.addEventListener("click", (e) => {
      selectedRating = parseInt(e.target.getAttribute("data-value"));
      updateStarUI(selectedRating);
    });
  });

  if (submitReviewBtn) {
    submitReviewBtn.addEventListener("click", () => {
      if (selectedRating === 0) {
        alert("Please select a star rating first.");
        return;
      }
      
      const rideId = activeRideStatus.getAttribute("data-ride-id");
      if (!rideId) return;

      const rides = JSON.parse(localStorage.getItem("rides")) || [];
      const rideIndex = rides.findIndex(r => r.id === rideId);
      if (rideIndex !== -1) {
        rides[rideIndex].rating = selectedRating;
        rides[rideIndex].review = reviewText.value.trim();
        localStorage.setItem("rides", JSON.stringify(rides));
        updateRideStatus(rideId);
      }
    });
  }

});
