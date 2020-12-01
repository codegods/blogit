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

del sys, os

import uuid
from math import ceil
from json import loads
from typing import Tuple
from flask.views import View
from helpers.url_for import url_for
from flask import request, Blueprint, current_app as app

# TODO: Implement user verification before allowing uploads


class FileUploader(View):
    methods = ["POST"]

    def init(self, body: dict) -> Tuple[str, int]:
        uid = uuid.uuid4().hex
        if "total" not in body:
            return "400 - Bad request", 400
        body["chunks"] = {}
        app.cache.get_store("uploads").add(uid, body)
        return {"uuid": uid}, 200

    def upload_chunk(self, body: dict) -> Tuple[str, int]:
        if not all([x in body for x in ["uuid", "chunk", "c_id"]]):
            return "400 - Bad request", 400
        store = app.cache.get_store("uploads")
        try:
            upload: dict = store.get(body["uuid"])
            chunks: dict = upload.get("chunks")
            chunks.update({"{}".format(body["c_id"]): body["chunk"]})
            upload["chunks"] = chunks
            store.update(body["uuid"], upload)
            return "OK", 200
        except KeyError:
            return "400 - Bad Request", 400

    def finish(self, body: dict) -> Tuple[str, int]:
        if "uuid" not in body:
            return "400 - Bad Request", 400
        store = app.cache.get_store("uploads")
        try:
            upload: dict = store.get(body["uuid"])
            chunks = upload.get("chunks")
            file = ["" for _ in range(ceil(upload["total"] / len(chunks)))]

            # This will put the chunks in order
            for i in chunks:
                file[int(i)] = chunks[i]
            file = "".join(file)
            uid = app.sql.storage.upload(upload["name"], file)

            # Frees the cache
            store.delete(body["uuid"])
            return {"success": True, "url": uid}, 200
        except KeyError:
            return "400 - Bad Request", 400

    def dispatch_request(self):
        body: dict = loads(request.get_data(as_text=True))
        if body.get("init"):
            return self.init(body)
        elif body.get("done"):
            return self.finish(body)
        return self.upload_chunk(body)


blueprint = Blueprint(__name__, "api.uploader")
blueprint.add_url_rule(
    url_for("api.uploader"), view_func=FileUploader.as_view("file_uploader")
)
