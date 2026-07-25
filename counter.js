


function initialisiereWebseite() {
	
fetch("https://vierfarbkuli.goatcounter.com/counter/TOTAL.json")
    .then(response => response.json())
    .then(data => {
        let zahl = Number(data.count) + 82;

        document.getElementById("counter").textContent =
            "Besucher: " + zahl.toLocaleString("de-DE");
    })
    .catch(error => {
        console.error("Counter Fehler:", error);
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialisiereWebseite);
} else {
    initialisiereWebseite();
}