import subprocess
import re
from pathlib import Path
from html.parser import HTMLParser
from datetime import datetime


# ==================================================
# Pfade
# ==================================================

# Ordner, in dem dieses Script liegt
ROOT = Path(__file__).resolve().parent

# index.html liegt ebenfalls hier
INDEX_FILE = ROOT / "index.html"


# ==================================================
# Marker in index.html
# ==================================================

START_MARKER = "<!-- AUTO:LAST-ARTICLE -->"
END_MARKER = "<!-- /AUTO:LAST-ARTICLE -->"


# ==================================================
# HTML <title> auslesen
# ==================================================

class TitleParser(HTMLParser):

    def __init__(self):
        super().__init__()

        self.in_title = False
        self.title = []

    def handle_starttag(self, tag, attrs):

        if tag.lower() == "title":
            self.in_title = True

    def handle_endtag(self, tag):

        if tag.lower() == "title":
            self.in_title = False

    def handle_data(self, data):

        if self.in_title:
            self.title.append(data)


def get_title(path):

    try:

        html = path.read_text(
            encoding="utf-8"
        )

        parser = TitleParser()
        parser.feed(html)

        title = " ".join(
            "".join(parser.title).split()
        )

        if title:
            return title

    except Exception as error:

        print(
            f"Warnung: Titel konnte nicht gelesen werden: {path}"
        )

        print(error)

    # Fallback auf Dateinamen
    return (
        path.stem
        .replace("-", " ")
        .replace("_", " ")
        .title()
    )


# ==================================================
# Letzte Änderung einer Datei aus Git holen
# ==================================================

def get_git_date(path):

    result = subprocess.run(
        [
            "git",
            "log",
            "-1",
            "--format=%cI",
            "--",
            str(path)
        ],
        capture_output=True,
        text=True,
        check=True
    )

    date_string = result.stdout.strip()

    if not date_string:
        return None

    return datetime.fromisoformat(
        date_string.replace("Z", "+00:00")
    )


# ==================================================
# Zuletzt geänderte HTML-Datei finden
# ==================================================

def get_last_modified_file():

    # Nur HTML-Dateien im gleichen Ordner.
    # Keine Unterordner.
    files = [
        file
        for file in ROOT.glob("*.html")
        if file.name.lower() != "index.html"
    ]

    if not files:

        raise RuntimeError(
            "Keine Artikel-HTML-Dateien gefunden."
        )


    latest_file = None
    latest_date = None


    for file in files:

        date = get_git_date(file)

        if date is None:
            continue


        if (
            latest_date is None
            or date > latest_date
        ):

            latest_date = date
            latest_file = file


    if latest_file is None:

        raise RuntimeError(
            "Keine Git-Änderung für einen Artikel gefunden."
        )


    return latest_file, latest_date


# ==================================================
# Hauptprogramm
# ==================================================

def main():

    print()
    print("========================================")
    print(" Suche zuletzt geänderten Artikel")
    print("========================================")
    print()


    # Prüfen, ob index.html existiert

    if not INDEX_FILE.exists():

        raise RuntimeError(
            f"index.html wurde nicht gefunden: "
            f"{INDEX_FILE}"
        )


    # Artikel suchen

    article_file, modified_date = (
        get_last_modified_file()
    )


    # Titel aus HTML holen

    title = get_title(article_file)


    # --------------------------------------------------
    # Link erzeugen
    # --------------------------------------------------

    # Da index.html und Artikel im selben Ordner liegen,
    # reicht der Dateiname.
    link = article_file.name


    # --------------------------------------------------
    # Datum
    # --------------------------------------------------

    formatted_date = modified_date.strftime(
        "%d.%m.%Y"
    )


    # --------------------------------------------------
    # HTML erzeugen
    # --------------------------------------------------

    replacement = f"""
<article class="last-article">

    <a href="{link}">
        <strong>{title}</strong>
    </a>

    <time datetime="{modified_date.isoformat()}">
        Zuletzt geändert: {formatted_date}
    </time>

</article>
""".strip()


    # --------------------------------------------------
    # index.html lesen
    # --------------------------------------------------

    index = INDEX_FILE.read_text(
        encoding="utf-8"
    )


    # --------------------------------------------------
    # Marker ersetzen
    # --------------------------------------------------

    pattern = (
        re.escape(START_MARKER)
        + r".*?"
        + re.escape(END_MARKER)
    )


    new_content = re.sub(
        pattern,

        (
            START_MARKER
            + "\n\n"
            + replacement
            + "\n\n"
            + END_MARKER
        ),

        index,

        flags=re.DOTALL
    )


    # Marker nicht gefunden?

    if new_content == index:

        raise RuntimeError(
            "Die Marker in index.html wurden "
            "nicht gefunden."
        )


    # --------------------------------------------------
    # index.html schreiben
    # --------------------------------------------------

    INDEX_FILE.write_text(
        new_content,
        encoding="utf-8"
    )


    # ==================================================
    # Ausgabe für GitHub Actions
    # ==================================================

    print()
    print("========================================")
    print("        ZULETZT GEÄNDERTER ARTIKEL")
    print("========================================")
    print()
    print(f"Datei:   {article_file.name}")
    print(f"Titel:   {title}")
    print(f"Datum:   {formatted_date}")
    print(f"Link:    {link}")
    print()
    print("✓ index.html wurde aktualisiert.")
    print("========================================")
    print()


if __name__ == "__main__":
    main()
