import { request } from "node:https";
import { WebSocket } from "node:http";
import { readFileSync } from "node:fs";
import { exec } from "node:child_process";
import { exit } from "node:process";

const pages = [];
let page = null;//Buffer.alloc(0);

const exe = exec(`.\\bin\\yt-dlp.exe https://www.youtube.com/watch?v=X2gDR4b9Lk8 -x -o -`, {
    maxBuffer: 2 ** 32,
    encoding: "buffer"
}, (error, stdout, stderr) => {
    console.log(error);
    console.log(stderr);
    console.log(stdout.length);
});
exe.stdout.on("data", (chunk) => {
    if (page == null) {
        
    }
    //console.log(chunk);
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