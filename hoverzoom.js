

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
    



const MAX_IMAGES = 30;   
const VISIBLE = 15;     

const track = document.getElementById("trackCarousel");

// 1. Bildliste erzeugen
let images = [];
for (let i = 1; i <= MAX_IMAGES; i++) {
  images.push(`images/logos/logo${i}.png`);
}

// 2. Shuffle (Fisher-Yates)
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

images = shuffle(images);

// 3. 15 auswählen
let selected = images.slice(0, VISIBLE);

// 4. Für Endlos-Loop duplizieren
let finalImages = selected.concat(selected);

// 5. DOM erzeugen
finalImages.forEach(src => {
  const tile = document.createElement("div");
  tile.className = "tile";

  const img = document.createElement("img");
  img.src = src;

  tile.appendChild(img);
  track.appendChild(tile);
});

















