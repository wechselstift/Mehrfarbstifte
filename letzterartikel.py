import subprocess
import html

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

def get_article_image(article_file):

    try:
        content = article_file.read_text(
            encoding="utf-8"
        )
    except Exception:
        return None

    # Alle img-Tags durchsuchen
    pattern = re.compile(
        r"<img\b([^>]*)>",
        re.IGNORECASE | re.DOTALL
    )

    matches = pattern.findall(content)

    if not matches:
        return None

    for attributes in matches:

        src_match = re.search(
            r'\bsrc\s*=\s*["\']([^"\']+)["\']',
            attributes,
            re.IGNORECASE
        )

        if not src_match:
            continue

        src = src_match.group(1).strip()

        if not src:
            continue

        # HTML-Entities zurückwandeln
        src = html.unescape(src)

        # Absolute externe Bilder nicht verändern
        if (
            src.startswith("http://")
            or src.startswith("https://")
            or src.startswith("//")
            or src.startswith("data:")
        ):
            return src

        # Anker entfernen
        src = src.split("#", 1)[0]

        # Query entfernen
        src = src.split("?", 1)[0]

        # Backslashes korrigieren
        src = src.replace("\\", "/")

        # Bildpfad relativ zum Artikel auflösen
        image_path = (
            article_file.parent / src
        ).resolve()

        try:
            relative_image = image_path.relative_to(
                ROOT.resolve()
            )

            return relative_image.as_posix()

        except ValueError:
            # Bild liegt außerhalb des Repository-Ordners
            return src

    return None




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

    def __init__(self, target_filename):

        super().__init__()

        # WICHTIG:
        # Nur der Dateiname wird verglichen,
        # niemals der komplette Pfad.
        self.target_filename = Path(
            target_filename
        ).name.lower()

        self.current_href = None
        self.current_text = []

        self.found_text = None


    def handle_starttag(self, tag, attrs):

        if tag.lower() != "a":
            return

        attributes = dict(attrs)

        href = attributes.get("href")

        if not href:
            return


        # href bereinigen
        href = href.strip()

        # Anker entfernen
        href = href.split("#", 1)[0]

        # Query-String entfernen
        href = href.split("?", 1)[0]

        # Backslashes korrigieren
        href = href.replace("\\", "/")


        # Nur der Dateiname des href
        href_filename = Path(
            href
        ).name.lower()


        print(
            f"Prüfe href: {href_filename} "
            f"gegen {self.target_filename}"
        )


        if href_filename == self.target_filename:

            self.current_href = href
            self.current_text = []


    def handle_data(self, data):

        if self.current_href is not None:

            self.current_text.append(data)


    def handle_endtag(self, tag):

        if (
            tag.lower() == "a"
            and self.current_href is not None
        ):

            text = " ".join(
                "".join(
                    self.current_text
                ).split()
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
            f"Die Link-Datei wurde nicht gefunden: {LINK_FILE}"
        )

    target_filename = Path(article_file).name.lower()

    print()
    print("========================================")
    print(" Suche Link in:", LINK_FILE.name)
    print(" Gesucht:", target_filename)
    print("========================================")
    print()

    html = LINK_FILE.read_text(encoding="utf-8")

    class FindLinkParser(HTMLParser):

        def __init__(self, target):
            super().__init__()

            self.target = target

            self.inside_matching_link = False
            self.text_parts = []

            self.result = None

        def handle_starttag(self, tag, attrs):

            if tag.lower() != "a":
                return

            attributes = dict(attrs)

            href = attributes.get("href")

            if not href:
                return

            href = href.strip()

            # Anker entfernen
            href = href.split("#", 1)[0]

            # Query entfernen
            href = href.split("?", 1)[0]

            # Backslashes entfernen
            href = href.replace("\\", "/")

            # Nur Dateiname vergleichen
            href_filename = Path(href).name.lower()

            print(
                f"Prüfe href: {href_filename} "
                f"gegen {self.target}"
            )

            if href_filename == self.target:

                print(">>> TREFFER!")

                self.inside_matching_link = True
                self.text_parts = []

        def handle_data(self, data):

            if self.inside_matching_link:
                self.text_parts.append(data)

        def handle_endtag(self, tag):

            if (
                tag.lower() == "a"
                and self.inside_matching_link
            ):

                text = "".join(
                    self.text_parts
                ).strip()

                text = " ".join(
                    text.split()
                )

                print(
                    f">>> TEXT DES LINKS: {text!r}"
                )

                self.result = text

                self.inside_matching_link = False

    parser = FindLinkParser(
        target_filename
    )

    parser.feed(html)

    if parser.result:

        print()
        print(
            f"✓ Gefunden: {parser.result}"
        )
        print()

        return parser.result

    raise RuntimeError(
        f"Kein Link für '{target_filename}' "
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
        article_file
    )
    
    image = get_article_image(
        article_file
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

    if image:

    image_html = f"""
        <div class="last-article-image">
            <img
                src="{image}"
                alt="{display_name}"
            >
        </div>
    """.strip()

    else:

    image_html = ""


replacement = f"""
<article class="last-article">

    <div class="last-article-content">

        <a href="{article_file.name}">
            <strong>{display_name}</strong>
        </a>

        <time datetime="{modified_date.isoformat()}">
            Zuletzt geändert: {formatted_date}
        </time>

    </div>

    {image_html}

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
