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
import json
import flask
import markdown
from typing import List, Tuple
from xml.etree import ElementTree
from helpers.url_for import url_for
from markdown.extensions import Extension
from markdown.preprocessors import Preprocessor
from markdown.postprocessors import Postprocessor
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

class HighlightProcessor(InlineProcessor):
    def handleMatch(
        self, m: re.Match, _data: str
    ) -> Tuple[ElementTree.Element, int, int]:
        elem = ElementTree.Element("span")
        elem.text = m.groupdict()["text"]
        elem.set("class", "markdown-highlight")
        return elem, m.start(0), m.end(0)

class BlockQuoteUnescaper(InlineProcessor):
    def handleMatch(
        self, m: re.Match, _data: str
    ) -> Tuple[ElementTree.Element, int, int]:
        elem = ElementTree.Element("blockquote")
        italics = ElementTree.Element("i")
        italics.text = m.groupdict()["text"]
        elem.append(italics)
        return elem, m.start(0), m.end(0)

class Unescaper(Postprocessor):
    def run(self, text: str) -> None:
        code_elements_in_doc = True
        while code_elements_in_doc:
            match = re.search(
                "(?<=<code>)(?!<pre>)(?P<content>.+?)(?<!<\/pre>)(?=<\/code>)",
                text,
                re.DOTALL,
            )
            if match:
                # Escaping the input through `flask.markup.escape` escapes
                # all convertible strings to html escape characters, which
                # if inside `code(```)` fences are re-escaped by the
                # markdown parser. This will find all such double escapes
                # and correct them.
                span = match.span(1)
                the_actual_code = text[span[0] : span[1]]
                still_has_a_match = True
                while still_has_a_match:
                    char = re.search("&amp;(?P<char>[#a-z0-9]+);", the_actual_code)
                    if char:
                        the_actual_code = (
                            the_actual_code[: char.span()[0]]
                            + f"&{char.groupdict()['char']};"
                            + the_actual_code[char.span()[1] :]
                        )
                    else:
                        still_has_a_match = False
                text = (
                    text[: match.span()[0]]
                    + "<pre>"
                    + the_actual_code
                    + "</pre>"
                    + text[match.span()[1] :]
                )
            else:
                code_elements_in_doc = False
        
        # And now we'll remove empty p tags because the take useless space
        text = re.sub("<p>[\s]*</p>", "", text)
        return text


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
        md.inlinePatterns.register(
            StrikeThroughProcessor("~(?! )(?P<text>.+)(?<! )~"), "strikethrough", 98
        )
        # Since we escape all the input html during preprocessing, we have
        # `&gt;` in place of '>' and `&lt;` in place of '<'. So we will
        # have to make sure that these things go back to what they were originally
        # and we need to re-code some functionality such as blockquotes to get it working.
        md.inlinePatterns.register(
            HighlightProcessor("-&gt;(?! )(?P<text>.+)(?<! )&lt;-"), "highlight", 101
        )
        md.inlinePatterns.register(
            BlockQuoteUnescaper("^&gt;(?P<text>.+)"), "blockquotes", 102
        )
        md.postprocessors.register(Unescaper(), "unescaper", 103)


blueprint = flask.Blueprint(__name__, "renderer")


@blueprint.route(url_for("api.renderer"), methods=["POST"])
def renderer():
    """API endpoint for rendering markdown requests"""
    try:
        request = json.loads(flask.request.get_data().decode())
    except json.JSONDecodeError:
        return "Bad Request Encoding", 400

    if "heading" not in request or "content" not in request:
        return "Not all parameters were specified", 400

    # Although we implement checks on frontend for max content length
    # but we need to recheck it because frontend code can always be
    # manipulated
    if len(request["heading"]) == "" or len(request["content"]) == "":
        return "Request is empty", 400
    if len(request["heading"]) > 100 or len(request["content"]) > 40960:
        return "Request length too long", 413
    md = markdown.markdown(
        f"# {request['heading']}\n\n{request['content']}",
        extensions=[MentionsExtension()],
    )
    print(md)
    return md