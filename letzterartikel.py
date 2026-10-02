import subprocess
import re
from pathlib import Path
from html.parser import HTMLParser
from datetime import datetime


ARTICLE_DIR = Path(__file__).resolve().parent
INDEX_FILE = Path("index.html")

START_MARKER = "<!-- AUTO:LAST-ARTICLE -->"
END_MARKER = "<!-- /AUTO:LAST-ARTICLE -->"


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
        html = path.read_text(encoding="utf-8")

        parser = TitleParser()
        parser.feed(html)

        title = " ".join(
            "".join(parser.title).split()
        )

        if title:
            return title

    except Exception:
        pass

    return path.stem.replace("-", " ").replace("_", " ").title()


def get_last_modified_file():

    result = subprocess.run(
        [
            "git",
            "log",
            "-1",
            "--format=%cI",
            "--",
            str(ARTICLE_DIR)
        ],
        capture_output=True,
        text=True,
        check=True
    )

    # Alle HTML-Dateien holen
    files = list(ARTICLE_DIR.rglob("*.html"))

    if not files:
        raise RuntimeError(
            "Keine HTML-Dateien im Artikelordner gefunden."
        )

    latest_file = None
    latest_date = None

    for file in files:

        result = subprocess.run(
            [
                "git",
                "log",
                "-1",
                "--format=%cI",
                "--",
                str(file)
            ],
            capture_output=True,
            text=True
        )

        date_string = result.stdout.strip()

        if not date_string:
            continue

        date = datetime.fromisoformat(
            date_string.replace("Z", "+00:00")
        )

        if latest_date is None or date > latest_date:
            latest_date = date
            latest_file = file

    if latest_file is None:
        raise RuntimeError(
            "Keine Git-Änderung für Artikel gefunden."
        )

    return latest_file, latest_date


def main():

    if not INDEX_FILE.exists():
        raise RuntimeError(
            "index.html wurde nicht gefunden."
        )

    if not ARTICLE_DIR.exists():
        raise RuntimeError(
            f"Artikelordner '{ARTICLE_DIR}' wurde nicht gefunden."
        )


    article_file, modified_date = get_last_modified_file()

    title = get_title(article_file)

    # Pfad relativ zur index.html
    link = article_file.as_posix()


    formatted_date = modified_date.strftime(
        "%d.%m.%Y"
    )


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


    index = INDEX_FILE.read_text(
        encoding="utf-8"
    )


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


    if new_content == index:

        raise RuntimeError(
            "Die Marker in index.html wurden nicht gefunden."
        )


    INDEX_FILE.write_text(
        new_content,
        encoding="utf-8"
    )


    print()
    print("================================")
    print("Zuletzt geänderter Artikel")
    print("================================")
    print()
    print(f"Artikel: {article_file}")
    print(f"Titel:   {title}")
    print(f"Datum:   {formatted_date}")
    print()
    print("index.html wurde aktualisiert.")


if __name__ == "__main__":
    main()
