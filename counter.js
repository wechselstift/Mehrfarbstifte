


function initialisiereWebseite() {
	
	var t = setInterval(function() {
        if (window.goatcounter && window.goatcounter.visit_count) {
            clearInterval(t)
           fetch("https://vierfarbkuli.goatcounter.com/counter/total.json")
    .then(response => response.json())
    .then(data => {
        let zahl = data.count;

        // hier kannst du etwas addieren:
        zahl = Number(zahl) + 1000;

        document.getElementById("counter").textContent = zahl;
    });
        }
    }, 100)
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialisiereWebseite);
} else {
    initialisiereWebseite();
}