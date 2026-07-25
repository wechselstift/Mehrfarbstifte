


function initialisiereWebseite() {
	
	var t = setInterval(function() {
        if (window.goatcounter && window.goatcounter.visit_count) {
            clearInterval(t)
            goatcounter.visit_count({
        append: "#counter",
        path: "TOTAL",
        no_branding: true
    });
        }
    }, 100)
	

	
}

