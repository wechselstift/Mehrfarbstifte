

function ladeNavigation() {
    // Gibt das Promise zurück, damit wir wissen, wann die Navigation FERTIG ist
    return fetch("rechts.html", { cache: "no-cache" })
        .then(res => res.ok ? res.text() : Promise.reject("rechts.html nicht gefunden"))
        .then(html => {
            const rechts = document.getElementById("rechts");
            if (rechts) rechts.innerHTML = html;
            console.log("Navigation geladen");
        });
}

function ladeFooter() {
    fetch("footer.html", { cache: "no-cache" })
        .then(res => res.ok ? res.text() : Promise.reject("footer.html nicht gefunden"))
        .then(data => {
            const foot = document.getElementById("footer");
            if (foot) foot.innerHTML = data;
            console.log("Footer geladen");
        })
        .catch(err => console.error(err));
}

function ladeBanner() {
    return fetch("banner.html", { cache: "no-cache" })
        .then(res => res.ok ? res.text() : Promise.reject("banner.html nicht gefunden"))
        .then(data => {
            const banner = document.getElementById("banner-wrapper");
            if (banner) banner.innerHTML = data;
            console.log("Banner geladen");
        })
        .catch(err => console.error(err));
}



function navigationHighlighting() {
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
    console.log("Highlighting ausgeführt");
}

function fußnoten() {
    const ups = document.querySelectorAll(".fnup");
    const downs = document.querySelectorAll(".fndwn");

    ups.forEach((fn, i) => {
        if (!downs[i]) return; // Schutz vor Fehlern, falls Längen ungleich
        const n = i + 1;

        fn.id = `fnref-${n}`;
        downs[i].id = `fn-${n}`;

        const upLink = fn.querySelector("a");
        if (upLink) {
            upLink.textContent = n;
            upLink.href = `#fn-${n}`;
        }

        const downLink = downs[i].querySelector(".fnback");
        if (downLink) downLink.href = `#fnref-${n}`;
    });
    console.log("Fußnoten verarbeitet");
}

function positioniereBilder() {  
    const main = document.getElementById("main");
    if (!main) return;

    const mainRect = main.getBoundingClientRect();
    const mainWidth = main.clientWidth;

    const left = mainWidth * 0.70;  
    const right = mainWidth * 0.98;  
    const availableWidth = right - left;

    document.querySelectorAll(".bildanker").forEach(anker => {
        const bildID = anker.dataset.bild;
        const bild = document.getElementById(bildID);
        if (!bild) return;

        const ankerRect = anker.getBoundingClientRect();
        const top = ankerRect.top - mainRect.top;

        bild.style.position = "absolute";
        bild.style.top = top + "px";
        bild.style.maxWidth = availableWidth + "px";
        bild.style.height = "auto";

        const imgWidth = Math.min(bild.naturalWidth || availableWidth, availableWidth);
        const centeredLeft = left + (availableWidth - imgWidth) / 2;

        bild.style.left = centeredLeft + "px";
        bild.style.width = imgWidth + "px";
    });
    
    document.querySelectorAll("#bilder img").forEach(img => {
        const scale = parseFloat(img.dataset.scale || "1");
		const transform = parseFloat(img.dataset.move || "0");
        img.style.transform = `scale(${scale}) translateX(${transform}px)`;
        img.style.transformOrigin = "top center";
		

    });
}



function starteCarousel() {
    const MAX_IMAGES = 60;   
    const VISIBLE = 15;     
    const track = document.getElementById("trackCarousel");

    if (!track) return;

    let images = [];
    for (let i = 1; i <= MAX_IMAGES; i++) {
        images.push(`images/logos/logo${i}.png`);
    }

    images = shuffle(images);
    let selected = images.slice(0, VISIBLE);
    let rest = images.slice(VISIBLE);

    const ROWS = 3;
    let remainder = rest.length % ROWS;
    if (remainder !== 0) {
        let missing = ROWS - remainder;
        for (let i = 0; i < missing; i++) {
            rest.push(null);
        }
    }

    let sequence = [...selected, ...rest];
    let finalImages = sequence.concat(sequence);

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
    const middleCols = rest.length / ROWS;
    const scrollDistance = (middleCols + colsVisible) * (tileSize + gap);

    track.style.setProperty('--scroll-distance', `-${scrollDistance}px`);
    console.log("Carousel geladen");
}



function initialisiereWebseite() {
	
	

	
    // Unabhängige Inhalte laden
    ladeFooter();
ladeBanner()
    .then(() => {
        fetch("https://vierfarbkuli.goatcounter.com/counter/TOTAL.json")
            .then(response => response.json())
            .then(data => {
                let zahl = Number(data.count_unique) + 82;

                document.getElementById("counter").textContent =
                    "Besucherzahl: " + zahl.toLocaleString("de-DE");
					
					
					
            })
            .catch(error => {
                console.error("Counter Fehler:", error);
            });
    });
    fußnoten();
    starteCarousel();

    // Navigation laden UND ERST DANACH das Highlighting ausführen 
    ladeNavigation()
        .then(() => {
            navigationHighlighting();
			
        })
        .catch(err => console.error("Fehler beim Highlighten:", err));

    // Bilder positionieren (einmalig beim Start)
    positioniereBilder();
	
	
}

window.addEventListener("load", positioniereBilder);
window.addEventListener("resize", positioniereBilder);


if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialisiereWebseite);
} else {
    initialisiereWebseite();
}



function initialisiereBildOverlay() {


const slider = document.querySelector("#beforeAfter");
    const after = slider.querySelector(".before-after__after");
    const handle = slider.querySelector(".before-after__handle");

    let dragging = false;

    function updateSlider(clientX) {

        const rect = slider.getBoundingClientRect();

        let x = clientX - rect.left;

        // Auf Slider begrenzen
        x = Math.max(0, Math.min(x, rect.width));

        const percentage = (x / rect.width) * 100;

        /*
         * NUR DER SICHTBARE BEREICH
         * des Nachher-Bildes wird verändert.
         *
         * Das Bild selbst bleibt 100% groß
         * und exakt an derselben Position.
         */
        after.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;

        // Handle verschieben
        handle.style.left = `${percentage}%`;
    }


    /* Maus */

    handle.addEventListener("mousedown", (event) => {
        event.preventDefault();
        dragging = true;
    });

    document.addEventListener("mousemove", (event) => {
        if (!dragging) return;

        updateSlider(event.clientX);
    });

    document.addEventListener("mouseup", () => {
        dragging = false;
    });


    /* Touch */

    handle.addEventListener("touchstart", (event) => {
        dragging = true;
        event.preventDefault();
    }, { passive: false });

    document.addEventListener("touchmove", (event) => {

        if (!dragging) return;

        updateSlider(event.touches[0].clientX);

        event.preventDefault();

    }, { passive: false });

    document.addEventListener("touchend", () => {
        dragging = false;
    });


    /* Klick auf das Bild */

    slider.addEventListener("click", (event) => {

        if (
            event.target === handle ||
            handle.contains(event.target)
        ) {
            return;
        }

        updateSlider(event.clientX);
    });

    // Overlay erstellen
    const overlay = document.createElement("div");
    overlay.id = "bild-overlay";

    // Inhalt des Overlays
    const container = document.createElement("div");
    container.id = "bild-overlay-container";

    const grossbild = document.createElement("img");
    grossbild.id = "bild-overlay-img";

    const hinweis = document.createElement("div");
    hinweis.id = "bild-overlay-hinweis";
    hinweis.textContent = "Vierfarbkuli.de";

    container.appendChild(grossbild);
    container.appendChild(hinweis);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    // Alle Bilder anklickbar machen
    document.querySelectorAll("#bilder img").forEach(bild => {

        bild.style.cursor = "pointer";

        bild.addEventListener("click", function (event) {

            event.stopPropagation();

            grossbild.src = bild.src;
            grossbild.alt = bild.alt || "";

            overlay.classList.add("sichtbar");

            document.body.style.overflow = "hidden";
        });
    });

    // Klick auf den abgedunkelten Bereich schließt das Bild
    overlay.addEventListener("click", function (event) {

        if (event.target === overlay) {
            schliesseBildOverlay();
        }
    });

    // ESC schließt ebenfalls
    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {
            schliesseBildOverlay();
        }
    });

    function schliesseBildOverlay() {

        overlay.classList.remove("sichtbar");

        document.body.style.overflow = "";

        // Bildquelle leeren
        setTimeout(() => {
            if (!overlay.classList.contains("sichtbar")) {
                grossbild.src = "";
            }
        }, 200);
    }
}


// Nach dem Laden der Seite starten
if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initialisiereBildOverlay
    );
} else {
    initialisiereBildOverlay();
}

