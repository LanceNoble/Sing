import { request } from "node:https";
import { WebSocket } from "node:http";
import { constants, readFileSync } from "node:fs";
import { exec } from "node:child_process";
import { open, rm } from "node:fs/promises";
import { exit } from "node:process";

function strip(buf) {
    if (buf.byteLength < 27) {
        return [0, 0];
    }
    let i = -1;
    while (++i + 4 <= buf.byteLength && (buf[i] != 0x4f || buf[i + 1] != 0x67 || buf[i + 2] != 0x67 || buf[i + 3] != 0x53));
    if (i > buf.byteLength) {
        return [0, 0];
    }
    const numSegs = buf[i + 26];
    const szHead = 27 + numSegs;
    let szPage = szHead;
    if (buf.byteLength - i < szHead) {
        return [i, 0];
    }
    for (let j = i + 27; j < numSegs; j++) {
        szPage += buf[j]; 
    }
    if (buf.byteLength - i < szPage) {
        return [i, 0];
    }
    return
    Buffer.from(buf.buffer)
}

async function pipe(code, exe, out, call) {
    const pages = [];

    let i = 0;
    let raw = Buffer.alloc(0);

    const file = await open(`${out}${code}.opus`, constants.O_CREAT | constants.O_RDONLY);
    if (file.fd == -1) {
        return pages;
    }

    const process = exec(`${exe} ${code} -x -o "${out}${code}.opus"`, async (error, stdout, stderr) => {
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
            const numSegs = test[i + 26];
            const szHead = 27 + numSegs;

            let pageSize = szHead;
            Buffer.from(raw.buffer, i + 27, numSegs).forEach((v, j, a) => {
                pageSize += v;
            });

            pages.push(Buffer.from(raw.buffer, i, pageSize));
            i += pageSize;
        }
        if (process.exitCode != null) {
            clearInterval(this);
        }
    });
}

export { pipe };

// const token = readFileSync("./token", {encoding: "utf8"});
// let raw = "";

// request({
//     host: "discord.com",
//     path: "/api/v10/gateway/bot",
//     protocol: "https:",
//     headers: {
//         authorization: `Bot ${token}`
//     }
// }, (res) => {
//     res.on("data", (chunk) => raw += chunk);
//     res.on("end", () => {
//         const ws = new WebSocket(`${JSON.parse(raw)["url"]}/?v=10&encoding=json`);
//         ws.onmessage = (msg) => {
//             const json = JSON.parse(msg.data);
//             console.log(json);
            
//             if (json["op"] == 10) {
//                 setTimeout(() => {
//                     ws.send(JSON.stringify({
//                         op: 1,
//                         d: json["s"]
//                     }));
//                     ws.send(JSON.stringify({
//                         op: 2,
//                         d: {
//                             token: token,
//                             intents: 1 << 7,
//                             properties: {
//                                 os: "windows",
//                                 browser: "nujabes",
//                                 device: "nujabes"
//                             }
//                         }
//                     }));
//                     setInterval(() => {
//                         ws.send(JSON.stringify({
//                             op: 1,
//                             d: json["s"]
//                         }))
//                     }, json["d"]["heartbeat_interval"]);
//                 }, json["d"]["heartbeat_interval"] * 0/*Math.random()*/);
//             }
//             else if (json["op"] == 1) {
//                 ws.send(JSON.stringify({
//                     op: 1,
//                     d: json["s"]
//                 }));
//             }

//             if (json["t"] == "INTERACTION_CREATE") {
//                 const link = json["d"]["data"]["options"]["value"];
//             }
//         }
//     });
// }).end();