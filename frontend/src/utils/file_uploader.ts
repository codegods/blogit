import url_for from "./url_for";

class Uploader {
    _file: string;
    _name: string;
    ready: boolean;
    #_uid: string;
    _promises: Array<Promise<Response>>;
    /**
     *
     * @param file The base64 encoded file data to be uploaded
     */
    constructor(file: string, name: string) {
        this.#_uid = "";
        this.ready = false;
        this._file = file;
        this._name = name;
        this._promises = [];
    }

    /**
     *
     * Splits a given string into chunks of size `size` bytes
     *
     * @param str The string to be splitted
     * @param size Size of each chunk
     */
    chunk(str: string, size: number): Array<string> {
        const numChunks = Math.ceil(str.length / size);
        const chunks = new Array(numChunks);

        for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
            chunks[i] = str.substr(o, size);
        }

        return chunks;
    }

    /**
     * Initiates the upload and gets the upload id
     */
    init(): Promise<null> {
        return new Promise((resolve, reject) => {
            fetch(url_for("api.uploader"), {
                method: "POST",
                body: JSON.stringify({
                    init: true,
                    name: this._name,
                    total: this._file.length,
                }),
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to initialise");
                    return res.json();
                })
                .catch((e) => reject(e))
                .then((res) => {
                    this.ready = true;
                    this.#_uid = res.uuid;
                    resolve();
                })
                .catch((e) => reject(e));
        });
    }

    /**
     * Upload the file
     */
    upload(): Promise<{url: string, error?: string}>  {
        return new Promise((resolve, reject) => {
            if (!this.ready) {
                this.init().then(() =>
                    this.send_chunks().then((res) => resolve(res))
                );
            } else {
                this.send_chunks().then((res) => resolve(res));
            }
        });
    }
    /**
     * Sends the file splitted into 100 chunks.
     * And then returns the permalink of the file
     */
    send_chunks(): Promise<{url: string, error?: string}> {
        return new Promise((resolve, reject) => {
            let chunks = this.chunk(
                this._file,
                Math.round(this._file.length / 100)
            );
            for (let c = 0; c < chunks.length; c++) {
                this._promises.push(
                    fetch(url_for("api.uploader"), {
                        method: "POST",
                        body: JSON.stringify({
                            c_id: c, // This is important for the chunks to remain in order
                            chunk: chunks[c],
                            uuid: this.#_uid,
                        }),
                    })
                );
            }
            Promise.all(this._promises)
                .then((_) => this.finish().then((res) => resolve(res)))
                .catch((e) => reject(e));
        });
    }
    /**
     * Finishes the file upload. If not called, the uploaded file be deleted in 30 minutes.
     * @todo Give it a response type (probably a permalink)
     */
    finish(): Promise<{url: string, error?: string}> {
        return new Promise((resolve, reject) => {
            fetch(url_for("api.uploader"), {
                method: "POST",
                body: JSON.stringify({
                    done: true,
                    uuid: this.#_uid,
                }),
            })
                .then((res) => {
                    if (res.ok) return res.json();
                    reject(`Invalid response received ${res.status}`);
                    return;
                })
                .then((res) => resolve(res));
        });
    }
}

export default Uploader;
