

document.addEventListener("DOMContentLoaded", function () {

     if (sessionStorage.getItem("imgReloaded")) return;

     const ups = document.querySelectorAll(".fnup");
     const downs = document.querySelectorAll(".fndwn");

      ups.forEach((fn, i) => {
    const n = i + 1;

    // IDs setzen
    fn.id = `fnref-${n}`;
    downs[i].id = `fn-${n}`;

    // Text-Fußnote
    const upLink = fn.querySelector("a");
    upLink.textContent = n;
    upLink.href = `#fn-${n}`;

    // Rücksprung
    const downLink = downs[i].querySelector(".fnback");
    downLink.href = `#fnref-${n}`;
  });

     
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

    const currentPage = decodeURIComponent(
      location.pathname.split("/").pop() || "index.html"
    );

    document.querySelectorAll("#navi a").forEach(link => {
      const href = link.getAttribute("href");

      if (!href || href === "#" || href.startsWith("http")) return;

      const linkPage = decodeURIComponent(href.split("/").pop());

      if (linkPage === currentPage) {
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



fetch("rechts.html")
  .then(res => res.text())
  .then(data => {
    const foot = document.getElementById("rechts");
    if (foot) foot.innerHTML = data;
  });
    





















