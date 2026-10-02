import subprocess
import re
from pathlib import Path
from html.parser import HTMLParser
from datetime import datetime


# ============================================================
# PFADE
# ============================================================

# Ordner, in dem dieses Script liegt
ROOT = Path(__file__).resolve().parent

# Startseite
INDEX_FILE = ROOT / "index.html"

# HTML-Datei, in der deine Links stehen
# >>> HIER ggf. den Dateinamen ändern <<<
LINK_FILE = ROOT / "rechts.html"


# ============================================================
# MARKER IN index.html
# ============================================================

START_MARKER = "<!-- AUTO:LAST-ARTICLE -->"
END_MARKER = "<!-- /AUTO:LAST-ARTICLE -->"


# ============================================================
# TITEL-PARSER
# ============================================================

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

    return (
        path.stem
        .replace("-", " ")
        .replace("_", " ")
        .title()
    )


# ============================================================
# LINK-PARSER
# ============================================================

class LinkParser(HTMLParser):

    def __init__(self, target_file):

        super().__init__()

        self.target_file = target_file

        self.current_href = None
        self.current_text = []

        self.found_text = None


    def handle_starttag(self, tag, attrs):

        if tag.lower() != "a":
            return

        attributes = dict(attrs)

        href = attributes.get("href")

        if href is None:
            return


        # Nur Dateinamen vergleichen.
        #
        # Dadurch funktionieren auch:
        #
        # href="bossert.html"
        # href="./bossert.html"
        # href="unterordner/bossert.html"
        #

        href_path = Path(href.split("#")[0].split("?")[0])

        if href_path.name == self.target_file:

            self.current_href = href
            self.current_text = []


    def handle_data(self, data):

        if self.current_href:

            self.current_text.append(data)


    def handle_endtag(self, tag):

        if (
            tag.lower() == "a"
            and self.current_href
        ):

            text = " ".join(
                "".join(self.current_text).split()
            )

            if text:

                self.found_text = text

            self.current_href = None
            self.current_text = []


# ============================================================
# NAMEN AUS LINK-DATEI HOLEN
# ============================================================

def get_article_display_name(article_file):

    if not LINK_FILE.exists():

        raise RuntimeError(
            f"Die Link-Datei wurde nicht gefunden: "
            f"{LINK_FILE}"
        )


    html = LINK_FILE.read_text(
        encoding="utf-8"
    )


    parser = LinkParser(
        article_file
    )

    parser.feed(html)


    if parser.found_text:

        return parser.found_text


    raise RuntimeError(
        f"Kein Link für '{article_file}' "
        f"in '{LINK_FILE.name}' gefunden."
    )


# ============================================================
# GIT-DATUM EINER DATEI
# ============================================================

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
        date_string.replace(
            "Z",
            "+00:00"
        )
    )


# ============================================================
# ZULETZT GEÄNDERTE HTML-DATEI FINDEN
# ============================================================

def get_last_modified_file():

    # Nur HTML-Dateien im gleichen Ordner.
    #
    # index.html wird ausgeschlossen.
    # sidemenu.html wird ebenfalls ausgeschlossen,
    # weil es keine eigentliche Artikelseite ist.

    files = [
        file
        for file in ROOT.glob("*.html")
        if file.name.lower()
        not in {
            "index.html",
            LINK_FILE.name.lower()
        }
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


# ============================================================
# HAUPTPROGRAMM
# ============================================================

def main():

    print()
    print("========================================")
    print(" Suche zuletzt geänderten Artikel")
    print("========================================")
    print()


    # --------------------------------------------------------
    # Dateien prüfen
    # --------------------------------------------------------

    if not INDEX_FILE.exists():

        raise RuntimeError(
            f"index.html wurde nicht gefunden: "
            f"{INDEX_FILE}"
        )


    if not LINK_FILE.exists():

        raise RuntimeError(
            f"Die Link-Datei wurde nicht gefunden: "
            f"{LINK_FILE}"
        )


    # --------------------------------------------------------
    # Zuletzt geänderten Artikel ermitteln
    # --------------------------------------------------------

    article_file, modified_date = (
        get_last_modified_file()
    )


    # --------------------------------------------------------
    # Namen aus der Link-Datei holen
    # --------------------------------------------------------

    display_name = get_article_display_name(
        article_file.name
    )


    # --------------------------------------------------------
    # Datum formatieren
    # --------------------------------------------------------

    formatted_date = modified_date.strftime(
        "%d.%m.%Y"
    )


    # --------------------------------------------------------
    # HTML für index.html erzeugen
    # --------------------------------------------------------

    replacement = f"""
<article class="last-article">

    <a href="{article_file.name}">
        <strong>{display_name}</strong>
    </a>

    <time datetime="{modified_date.isoformat()}">
        Zuletzt geändert: {formatted_date}
    </time>

</article>
""".strip()


    # --------------------------------------------------------
    # index.html lesen
    # --------------------------------------------------------

    index = INDEX_FILE.read_text(
        encoding="utf-8"
    )


    # --------------------------------------------------------
    # Marker suchen
    # --------------------------------------------------------

    start_pos = index.find(
        START_MARKER
    )

    end_pos = index.find(
        END_MARKER
    )


    if start_pos == -1 or end_pos == -1:

        print(
            "========================================"
        )

        print(
            "FEHLER: MARKER NICHT GEFUNDEN"
        )

        print(
            "========================================"
        )

        print()

        print(
            "Gesuchter Start-Marker:"
        )

        print(
            repr(START_MARKER)
        )

        print()

        print(
            "Gesuchter End-Marker:"
        )

        print(
            repr(END_MARKER)
        )

        print()

        print(
            "AUTO-Zeilen in index.html:"
        )

        for number, line in enumerate(
            index.splitlines(),
            1
        ):

            if "AUTO" in line:

                print(
                    f"{number}: {repr(line)}"
                )


        raise RuntimeError(
            "Die Marker in index.html "
            "wurden nicht gefunden."
        )


    if end_pos < start_pos:

        raise RuntimeError(
            "Der End-Marker steht vor "
            "dem Start-Marker."
        )


    # --------------------------------------------------------
    # Bereich zwischen den Markern ersetzen
    # --------------------------------------------------------

    new_content = (

        index[:start_pos]

        + START_MARKER

        + "\n\n"

        + replacement

        + "\n\n"

        + END_MARKER

        + index[
            end_pos
            + len(END_MARKER):
        ]
    )


    # --------------------------------------------------------
    # index.html speichern
    # --------------------------------------------------------

    INDEX_FILE.write_text(
        new_content,
        encoding="utf-8"
    )


    # ========================================================
    # AUSGABE FÜR GITHUB ACTIONS
    # ========================================================

    print()

    print(
        "========================================"
    )

    print(
        "        ZULETZT GEÄNDERTER ARTIKEL"
    )

    print(
        "========================================"
    )

    print()

    print(
        f"Datei:   {article_file.name}"
    )

    print(
        f"Name:    {display_name}"
    )

    print(
        f"Datum:   {formatted_date}"
    )

    print(
        f"Link:    {article_file.name}"
    )

    print()

    print(
        "✓ index.html wurde aktualisiert."
    )

    print(
        "========================================"
    )

    print()


# ============================================================
# START
# ============================================================

if __name__ == "__main__":

    main()
