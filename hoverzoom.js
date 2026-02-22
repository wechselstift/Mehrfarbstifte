

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

    
    var sideimages = document.querySelectorAll(".sideimage, .sideimage-long");
    
    sideimages.forEach(function (img) {

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

     fetch("rechts.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("rechts").innerHTML = html;

    const currentPage = location.pathname.split("/").pop();

    document.querySelectorAll("navi a").forEach(link => {
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
      }
    });
  });
     
});
    


fetch("footer.html")
  .then(res => res.text())
  .then(data => {
    const foot = document.getElementById("footer");
    if (foot) foot.innerHTML = data;
  });


fetch("banner.html")
  .then(res => res.text())
  .then(data => {
    const foot = document.getElementById("banner-wrapper");
    if (foot) foot.innerHTML = data;
  });

    fetch("mobiledisclaimer.html")
  .then(res => res.text())
  .then(data => {
    const foot = document.getElementById("mobiledisclaimer");
    if (foot) foot.innerHTML = data;
  });


fetch("rechts.html")
  .then(res => res.text())
  .then(data => {
    const foot = document.getElementById("rechts");
    if (foot) foot.innerHTML = data;
  });
    
















