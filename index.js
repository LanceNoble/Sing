import { request } from "node:https";
import { WebSocket } from "node:http";
import { constants, readFileSync } from "node:fs";
import { exec } from "node:child_process";
import { open, rm } from "node:fs/promises";
import { exit } from "node:process";

const MAX_PAGE_SIZE = 27 + (255 * 255);
const pages = [];
let i = 0;
let raw = Buffer.alloc(0);
let song = 0;
const file = await open(`./songs/song${song}.opus`, constants.O_CREAT | constants.O_RDONLY);
const process = exec(`.\\bin\\yt-dlp.exe https://www.youtube.com/watch?v=KIXP--0-Tac -x -o "./songs/song${song}"`, async (error, stdout, stderr) => {
    try {
        await file.close();
    } catch (e) {
        console.error(e);
        exit();
    }
    const test = readFileSync(`./songs/song${song}.opus`);
    console.log(test);
    console.log(raw);
    console.log(pages.length);
    for (let i = 0; i < pages.length; i++) {
        //console.log(pages[i]);
    }
    await rm(`./songs/song${song++}.opus`);
});
const mark = setInterval(() => {
    // while (i + 26 < raw.byteLength && i + 26 + raw[i + 26] < raw.byteLength) {
    //     let pageSize = 27 + raw[i + 26];
    //     for (let j = i + 27; j < i + raw[i + 26]; j++) {
    //         pageSize += raw[j];
    //     }
    //     pages.push(Buffer.from(raw.buffer, i, pageSize));
    //     i += pageSize;
    // }
    // while (i + 4 <= raw.byteLength && Buffer.from(raw, i, 4).toString() !== "OggS\0") {
    //     i++;
    // }
    pages.push(i);
    if (process.exitCode != null) {
        clearInterval(mark);
    }
});
const pipe = setInterval(async () => {
    let chunk = await file.read();
    while (chunk.bytesRead > 0) {
        raw = Buffer.concat([raw, Buffer.from(chunk.buffer.buffer, 0, chunk.bytesRead)]);
        chunk = await file.read();
    }
    if (process.exitCode != null) {
        clearInterval(pipe);
    }
});

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