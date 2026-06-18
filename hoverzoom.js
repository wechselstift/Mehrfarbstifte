

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
    
	window.addEventListener("load", positioniereBilder);
window.addEventListener("resize", positioniereBilder);

function positioniereBilder() {  

// Damit mobil und desktop die bilder rechts auf derselben höhe angezeigt werden. Einfach im text ein <span> mit <span class="bildanker" data-bild="bild1"> setzen, 
 // dann weiter unten wo die bilder stehen <img id="bild1"> und die nummer anpassen. 
 // Bilder werden automatisch skaliert sodass sie links auf 70% sind und rechts auf 98% 
 // Die höhe wird berechnet durch bounding client rects (diese sin vom viewport gemessen). Da die absolute px zahl vom bild nicht relativ zum viewport, sondern zum parent div ist, 
 // muss textstelle ('anker') minus main gerechnet werden (die distanzen zum viewport nach oben). 

    const main = document.getElementById("main");
    const mainRect = main.getBoundingClientRect();
    const mainWidth = main.clientWidth;

    const left = mainWidth * 0.70;  //linker rand ab 70% des textcontainers 
    const right = mainWidth * 0.98;  // rechter rand des bildes bei 98% des textcontainers 
    const availableWidth = right - left;

    document.querySelectorAll(".bildanker").forEach(anker => {

        const bildID = anker.dataset.bild;
        const bild = document.getElementById(bildID);

        if (!bild) return;

        const ankerRect = anker.getBoundingClientRect();

        // Position vertikal am Textanker ausrichten
        const top = ankerRect.top - mainRect.top;

        bild.style.position = "absolute";
        bild.style.top = top + "px";
		
		

        // maximale Breite begrenzen
        bild.style.maxWidth = availableWidth + "px";
        bild.style.height = "auto";

        // echte Breite ermitteln (nach maxWidth)
        const imgWidth = Math.min(bild.naturalWidth || availableWidth, availableWidth);

        // Zentrierung im 70–95% Bereich
        const centeredLeft = left + (availableWidth - imgWidth) / 2;

        bild.style.left = centeredLeft + "px";
        bild.style.width = imgWidth + "px";
    });
	
document.querySelectorAll("#bilder img").forEach(img => {     //mit id=data-scale  kannst du bei <img> die skalierung angeben. skaliert wird top-center sodass der rand mit der position im text weiterhin stimmt!
    const scale = parseFloat(img.dataset.scale || "1");

    img.style.transform = `scale(${scale})`;
    img.style.transformOrigin = "top center";
});
}
	
	
	
	
	


const MAX_IMAGES = 60;   
const VISIBLE = 15;     

const track = document.getElementById("trackCarousel");

// 1. Bildliste erzeugen
let images = [];
for (let i = 1; i <= MAX_IMAGES; i++) {
  images.push(`images/logos/logo${i}.png`);
}

// OPTIONAL Shuffle
 images = shuffle(images);

// 2. Erste 15
let selected = images.slice(0, VISIBLE);

// 3. Rest
let rest = images.slice(VISIBLE);

// 4. Rest auf 3er Grid auffüllen
const ROWS = 3;
let remainder = rest.length % ROWS;

if (remainder !== 0) {
  let missing = ROWS - remainder;
  for (let i = 0; i < missing; i++) {
    rest.push(null); // leere tiles
  }
}

let sequence = [
  ...selected,
  ...rest
];

//  komplette Sequenz duplizieren
let finalImages = sequence.concat(sequence);

// 6. DOM erzeugen
finalImages.forEach(src => {
  const tile = document.createElement("div");
  tile.className = "tile";

  if (src) {
    const img = document.createElement("img");
    img.src = src;
    tile.appendChild(img);
  }

  track.appendChild(tile);
});


// Shuffle Funktion
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const tileSize = 90;
const gap = 10;
const colsVisible = 5;

// wie viele "Spalten" hat der Mittelteil?
const middleCols = rest.length / ROWS;

// Strecke berechnen
const scrollDistance = (middleCols + colsVisible) * (tileSize + gap);

// CSS Variable setzen
track.style.setProperty('--scroll-distance', `-${scrollDistance}px`);



// Webseiten-Like

 
 
 // SUCHE. JSON-datei hat suchbegriffe pro seite. (bei neuer seite suchindex erweitern manuell!




fetch("searchindex.json")
    .then(r => r.json())
    .then(data => {
        pages = data;
		console.log("JSON geladen:", pages);
    });
	
	
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[-_\s]/g, "")
    .trim();
}

function scorePage(query, page) {

  const q = normalize(query);

  let score = 100;

  // Titel stärker gewichten
  const title = normalize(page.title);

  if (title === q) return 0;                
  if (title.includes(q)) score = 1;          

  // Tags prüfen
  for (const tag of page.tags) {

    const t = normalize(tag);

    if (t === q) return 0;                  // exakter Tag
    if (t.includes(q)) score = Math.min(score, 2);

    const dist = levenshtein(q, t);
    score = Math.min(score, dist + 2);
  }

  return score;
}
	
	
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[-_\s]/g, "")   // bindestrich, underscore, leerzeichen 
    .trim();
}	
	
function levenshtein(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        a[j - 1] === b[i - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
    }
  }

  return matrix[b.length][a.length];
}	
	
function search(query, pages) {

  const q = query.trim();
  if (q.length < 3) return [];

  return pages
    .map(page => ({
      page,
      score: scorePage(q, page)
    }))
    .filter(x => x.score <= 5)
    .sort((a, b) => a.score - b.score)
    .map(x => x.page);
}

function highlight(text, query) {
  const q = query.toLowerCase();
  return text.replace(new RegExp(q, "gi"), match =>
    `<mark>${match}</mark>`
  );
}
	
	const input = document.getElementById("search");
const resultsDiv = document.getElementById("results");

let currentResults = [];
let selectedIndex = -1;

input.addEventListener("input", function () {

  const q = this.value;

  if (q.length < 3) {
    resultsDiv.innerHTML = "";
    return;
  }

  currentResults = search(q, pages).slice(0,10);
  selectedIndex = -1;

  render(q);
});

function render(query) {

  resultsDiv.innerHTML = currentResults.map((page, i) => `
    <div class="result ${i === selectedIndex ? "active" : ""}">
      <a href="${page.url}">
        ${highlight(page.title, query)}
      </a>
    </div>
  `).join("");
  
  resultsDiv.innerHTML += `
      <div class="result">
      <p style="font-size:11px; line-height: 1.2; display:block;">
       <i>Finden Sie noch nichts? Kontaktieren Sie mich gerne! <br>
	   Die Seite ist noch im Aufbau. </i>
      </p>
    </div>
  
  
  `;
}

input.addEventListener("keydown", function (e) {

  if (!currentResults.length) return;

  if (e.key === "ArrowDown") {
    selectedIndex = Math.min(selectedIndex + 1, currentResults.length - 1);
    render(this.value);
  }

  if (e.key === "ArrowUp") {
    selectedIndex = Math.max(selectedIndex - 1, 0);
    render(this.value);
  }

  if (e.key === "Enter" && selectedIndex >= 0) {
    window.location.href = currentResults[selectedIndex].url;
  }
});	






