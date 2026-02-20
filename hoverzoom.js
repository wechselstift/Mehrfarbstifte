

document.addEventListener("DOMContentLoaded", function () {

     if (sessionStorage.getItem("imgReloaded")) return;

  const images = document.querySelectorAll("img");

  images.forEach(img => {
    img.addEventListener("error", () => {
      sessionStorage.setItem("imgReloaded", "true");
      console.warn("Bildfehler – Seite wird einmal neu geladen");
      location.reload();
    });
  });

    
    var images = document.querySelectorAll(".sideimage, .sideimage-long");
    
    images.forEach(function (img) {

        img.addEventListener("mouseenter", function () {
            this.style.transform = "scale(1.8)";
            this.style.transition = "transform 0.15s ease";
            this.style.zIndex = "1000";
            this.style.position = "relative";
        });

        img.addEventListener("mouseleave", function () {
            this.style.transform = "scale(1)";
            this.style.zIndex = "auto";
        });

          });
      
});
    
fetch("navbar.html")
  .then(res => res.text())
  .then(data => {
    const nav = document.getElementById("navbar");
    if (nav) nav.innerHTML = data;
  });

fetch("footer.html")
  .then(res => res.text())
  .then(data => {
    const foot = document.getElementById("footer");
    if (foot) foot.innerHTML = data;
  });

    fetch("mobiledisclaimer.html")
  .then(res => res.text())
  .then(data => {
    const foot = document.getElementById("mobiledisclaimer");
    if (foot) foot.innerHTML = data;
  });
    










