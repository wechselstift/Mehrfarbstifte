


function initialisiereWebseite() {
	

             fetch("https://vierfarbkuli.goatcounter.com/counter/total.json")
    .then(response => response.json())
    .then(data => {
        let zahl = data.count;

        // hier kannst du etwas addieren:
        zahl = Number(zahl) + 1000;

        document.getElementById("counter").textContent = zahl;
    });
      
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialisiereWebseite);
} else {
    initialisiereWebseite();
}