import { get } from "node:https";
import { WebSocket } from "node:http";
import { readFileSync } from "node:fs";

function fetch(url, options) {
    return new Promise((resolve, reason) => {
        get(url, options, (res) => {
            let raw = "";
            res.on("data", (chunk) => raw += chunk);
            res.on("end", () => resolve(JSON.parse(raw)));
        });
    });
}

const token = readFileSync("./token", { encoding: "utf8" });
const gate = await fetch("https://discord.com/api/v10/gateway/bot", { headers: { authorization: `Bot ${token}` } });
const ws = new WebSocket(`${gate["url"]}/?v=10&encoding=json`);

ws.onmessage = async (msg) => {
    const json = JSON.parse(msg.data);
    if (json["op"] == 10) {
        setTimeout(() => {
            ws.send(JSON.stringify({ op: 1, d: json["s"] }));
            ws.send(JSON.stringify({ op: 2, d: { token: token, intents: 1 << 7, properties: { os: "windows", browser: "nujabes", device: "nujabes" } } }));
            setInterval(() => ws.send(JSON.stringify({ op: 1, d: json["s"] })), json["d"]["heartbeat_interval"]);
        }, json["d"]["heartbeat_interval"] * 0/*Math.random()*/);
    }
    if (json["op"] == 1) {
        ws.send(JSON.stringify({ op: 1, d: json["s"] }));
    }
    if (json["t"] == "INTERACTION_CREATE") {
        const state = await fetch(`https://discord.com/api/v10/guilds/${json["d"]["guild_id"]}/voice-states/@me`, { headers: { authorization: `Bot ${token}` } });
        if (state["code"] == 10065) {

        } else {

        }
    }
}

// request({ host: "discord.com", path: "/api/v10/gateway/bot", protocol: "https:", headers: { authorization: `Bot ${token}` } }, (res) => {
//     res.on("end", () => {
//         ws.onmessage = async (msg) => {
//             if (json["t"] == "INTERACTION_CREATE") {
//                 //req.on("error", (err) => console.log(err))
//                 // const link = json["d"]["data"]["options"]["value"];
//                 // try {
//                 //     await open("song.opus");
//                 // } catch (error) {
//                 //     const file = await open("song.opus", constants.O_CREAT);
//                 //     await file.close();
//                 //     await rm("song.opus");
//                 // }
//             }
//         }
//     });
// }).end();