// simple interaction

document.querySelectorAll(".btn").forEach(btn => {
  btn.addEventListener("click", function () {
    console.log("Button clicked");
  });
});