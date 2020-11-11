import os
import sys

sys.path.append(
    os.path.abspath(
        ".."
        if os.path.abspath(".").split("/")[-1]
        in [
            "lib",
            "api",
            "helpers",
            "scripts",
            "tests",
            "extensions",
            "docs",
            "frontend",
        ]
        else "."
    )
)

del os, sys

import re
import flask
import markdown
from typing import List, Tuple
from xml.etree import ElementTree
from helpers.url_for import url_for
from markdown.extensions import Extension
from markdown.preprocessors import Preprocessor
from markdown.inlinepatterns import InlineProcessor


class MentionsProcessor(InlineProcessor):
    def handleMatch(
        self, m: re.Match, _data: str
    ) -> Tuple[ElementTree.Element, int, int]:
        elem = ElementTree.Element("b")
        link = ElementTree.Element(
            "a",
            attrib={
                # This will return the url for the mentioned user taken
                # from the url database
                "href": re.sub("<[a-z:]+>", m.group(0)[1:], url_for("views.user"))
            },
        )
        link.text = "&#0064;" + m.group(0)[1:]
        elem.append(link)
        elem.set("class", "markdown-mention")
        return elem, m.start(0), m.end(0)

class StrikeThroughProcessor(InlineProcessor):
    def handleMatch(
        self, m: re.Match, _data: str
    ) -> Tuple[ElementTree.Element, int, int]:
        elem = ElementTree.Element("s")
        elem.text = m.groupdict()["text"]
        return elem, m.start(0), m.end(0)


class HTMLEscaper(Preprocessor):
    """
    This will escape all html from the input so that user
    may not inject scripts into the dom using these tags.
    """

    def run(self, lines: List[str]) -> List[str]:
        new_lines = []
        for line in lines:
            line = flask.Markup.escape(line)
            new_lines.append(line)
        return new_lines


class MentionsExtension(Extension):
    def extendMarkdown(self, md: markdown.Markdown) -> None:
        # I couldn't find the docs for this part but from the
        # source code, this method seems to take three arguments
        # item, name and priority. I am just guessing the priority
        md.preprocessors.register(HTMLEscaper(md), "escape_html", 9999)
        md.inlinePatterns.register(MentionsProcessor("@[a-zA-Z0-9_]+"), "mentions", 99)
        md.inlinePatterns.register(StrikeThroughProcessor("~(?! )(?P<text>.+)(?<! )~"), "strikethrough", 98)


blueprint = flask.Blueprint(__name__, "renderer")


@blueprint.route(url_for("api.renderer"), methods=["POST"])
def renderer():
    """API endpoint for rendering markdown requests"""
    request = flask.request.get_data().decode()
    return markdown.markdown(request, extensions=[MentionsExtension()])
