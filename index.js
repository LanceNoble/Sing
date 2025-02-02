import { request } from "node:https";
import { WebSocket } from "node:http";
import { readFileSync } from "node:fs";
import { exec } from "node:child_process";

const MAX_PAGE_SIZE = 27 + (255 * 255);

const pages = [];

let interval = null;
let level = 1;
let raw = Buffer.alloc(0);
let i = 0;
let complete;

const exe = exec(`.\\bin\\yt-dlp.exe https://www.youtube.com/watch?v=KIXP--0-Tac -x -o -`, {
    maxBuffer: 2 ** 32,
    encoding: "buffer"
}, (error, stdout, stderr) => {
    // console.log(error);
    // console.log(stderr);
    console.log(stdout.length);
    console.log(raw.length);
    console.log(pages.length);
});

exe.stdout.on("data", (chunk) => {
    raw = Buffer.concat([raw, chunk]);
    console.log(`raw length: ${raw.length}`)
    console.log(`level: ${MAX_PAGE_SIZE * level}`)
    if (raw.length >= MAX_PAGE_SIZE * level) {
        while (i < raw.length) {
            pages.push(i);
            let pageSize = 27 + raw[i + 26];
            for (let j = i + 27; j < i + raw[i + 26]; j++) {
                pageSize += raw[j];
            }
            i += pageSize;
        }
        level++;
    }
});

while (!exe.stdout.closed) {
    if (i < raw.length) {
        pages.push(i);
        let pageSize = 27 + raw[i + 26];
        for (let j = i + 27; j < i + raw[i + 26]; j++) {
            pageSize += raw[j];
        }
        i += pageSize;
    }
}

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