import { request } from "node:https";
import { WebSocket } from "node:http";
import { constants, readFileSync } from "node:fs";
import { exec } from "node:child_process";
import { open, rm } from "node:fs/promises";
import { exit } from "node:process";

// try {
//     console.log(await open("song.opus"));    
// } catch (error) {
// }
// exit();

function strip(buf, i) {
    if (buf.byteLength - i < 27 || buf[i] != 0x4f || buf[i + 1] != 0x67 || buf[i + 2] != 0x67 || buf[i + 3] != 0x53) {
        return 0;
    }
    const numSegs = buf[i + 26];
    const szHead = 27 + numSegs;
    if (buf.byteLength - i < szHead) {
        return 0;
    }
    let szPage = szHead;
    for (let j = i + 27; j < numSegs; j++) {
        szPage += buf[j];
    }
    if (buf.byteLength - i < szPage) {
        return 0;
    }
    return szPage;
}

async function pipe(code, exe, out) {
    const pages = [];

    let i = 0;
    let raw = Buffer.alloc(0);

    const file = await open(`${out}${code}.opus`, constants.O_CREAT);
    if (file.fd == -1) {
        return pages;
    }

    const process = exec(`${exe} ${code} -x -o "${out}${code}"`, async (error, stdout, stderr) => {
        console.log(stdout)
        console.log(error)
        console.log(stderr)
        console.log(pages.length)
        await file.close();
        await rm(`${out}${code}.opus`);
        return pages;
    });

    setInterval(async function () {
        let chunk = await file.read();
        while (chunk.bytesRead > 0) {
            raw = Buffer.concat([raw, Buffer.from(chunk.buffer.buffer, 0, chunk.bytesRead)]);
            chunk = await file.read();
        }
        if (process.exitCode != null) {
            clearInterval(this);
        }
    });

    setInterval(function () {
        while (i < raw.byteLength) {
            const bounds = strip(raw, i);
            i = bounds[0]
            if (bounds[1] > 0) {
                console.log(i)
                pages.push(i);
            }
            i += bounds[1];
        }
        if (process.exitCode != null) {
            clearInterval(this);
        }
    });
}

const token = readFileSync("./token", { encoding: "utf8" });
request({
    host: "discord.com",
    path: "/api/v10/gateway/bot",
    protocol: "https:",
    headers: { authorization: `Bot ${token}` }
}, (res) => {
    let raw = "";
    res.on("data", (chunk) => raw += chunk);
    res.on("end", () => {
        const ws = new WebSocket(`${JSON.parse(raw)["url"]}/?v=10&encoding=json`);
        ws.onmessage = async (msg) => {
            const json = JSON.parse(msg.data);
            console.log(json);
            if (json["op"] == 10) {
                setTimeout(() => {
                    ws.send(JSON.stringify({ op: 1, d: json["s"] }));
                    ws.send(JSON.stringify({
                        op: 2,
                        d: {
                            token: token,
                            intents: 1 << 7,
                            properties: {
                                os: "windows",
                                browser: "nujabes",
                                device: "nujabes"
                            }
                        }
                    }));
                    setInterval(() => ws.send(JSON.stringify({ op: 1, d: json["s"] })), json["d"]["heartbeat_interval"]);
                }, json["d"]["heartbeat_interval"] * 0/*Math.random()*/);
            }
            else if (json["op"] == 1) {
                ws.send(JSON.stringify({ op: 1, d: json["s"] }));
            }

            if (json["t"] == "INTERACTION_CREATE") {
                const link = json["d"]["data"]["options"]["value"];
                try {
                    await open("song.opus");
                } catch (error) {

                }
                //const file = 
                //if ()
            }
        }
    });
}).end();