
from pathlib import Path
import re


# Ordner, in dem dieses Python-Skript liegt
ORDNER = Path(__file__).parent


# Alle HTML-Dateien im Ordner durchsuchen
for html_datei in ORDNER.glob("*.html"):

    text = html_datei.read_text(encoding="utf-8")

    # Bilder unter /images/logos/ finden
    # und deren Endung auf .png setzen
    neuer_text = re.sub(
        r'(/?images/logos/[^"\'>\s]+?)\.(?:webp|jpg|jpeg|gif|png)',
        r'\1.png',
        text,
        flags=re.IGNORECASE
    )

    if neuer_text != text:
        html_datei.write_text(neuer_text, encoding="utf-8")
        print(f"Geändert: {html_datei.name}")
    else:
        print(f"Keine Änderung: {html_datei.name}")


print()
print("Fertig!")

