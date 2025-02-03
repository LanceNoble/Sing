import { request } from "node:https";
import { WebSocket } from "node:http";
import { constants } from "node:fs";
import { exec } from "node:child_process";
import { open } from "node:fs/promises";
import { exit } from "node:process";

const MAX_PAGE_SIZE = 27 + (255 * 255);

const pages = [];

let raw = Buffer.alloc(0);
let complete = Buffer.alloc(0);
let i = 0;
let song = 0;

let fileHandle;
try {
    fileHandle = await open(`./songs/song${song}.opus`, constants.O_CREAT | constants.O_RDONLY);
} catch (e) {
    console.error(e);
    exit();
}

const interval = setInterval(async () => {
    console.log(await fileHandle.read());
}, 1000);

exec(`.\\bin\\yt-dlp.exe -x -o "./songs/song${song++}" KIXP--0-Tac`, {
    maxBuffer: 2 ** 32,
    encoding: "buffer"
}, (error, stdout, stderr) => {
    
});




//const 

// exe.stdout.on("data", (chunk) => {
//     //console.log(chunk)
//     //raw = Buffer.concat([raw, chunk]);
//     // complete = Buffer.concat([complete, chunk]);
//     // if (complete.length >= MAX_PAGE_SIZE) {
//     //     raw = Buffer.concat([raw, complete]);
//     //     complete = Buffer.alloc(0);
//     // }
    
// });

/*
const interval = setInterval(() => {
    if (i < raw.length) {
        //pages.push(i);
        let pageSize = 27 + raw[i + 26];
        for (let j = i + 27; j < i + raw[i + 26]; j++) {
            pageSize += raw[j];
        }
        //pages.push(Buffer.from(raw.buffer, i, pageSize));
        i += pageSize;
        //console.log(pages[pages.length - 1]);
    }
});
*/

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