import { request } from "node:https";
import { WebSocket } from "node:http";
import { readFileSync } from "node:fs";

const token = readFileSync("./token", {encoding: "utf8"});
let raw = "";
let vc = false;

request({
    host: "discord.com",
    path: "/api/v10/gateway/bot",
    protocol: "https:",
    headers: {
        authorization: `Bot ${token}`
    }
}, (res) => {
    res.on("data", (chunk) => raw += chunk);
    res.on("end", () => {
        const ws = new WebSocket(`${JSON.parse(raw)["url"]}/?v=10&encoding=json`);
        ws.onmessage = (msg) => {
            const json = JSON.parse(msg.data);
            //console.log(json);
            
            if (json["op"] == 10) {
                setTimeout(() => {
                    ws.send(JSON.stringify({
                        op: 1,
                        d: json["s"]
                    }));
                    ws.send(JSON.stringify({
                        op: 2,
                        d: {
                            token: token,
                            intents: 1 << 7 | 1 << 9 | 1 << 15,
                            properties: {
                                os: "windows",
                                browser: "nujabes",
                                device: "nujabes"
                            }
                        }
                    }));
                    setInterval(() => {
                        ws.send(JSON.stringify({
                            op: 1,
                            d: json["s"]
                        }))
                    }, json["d"]["heartbeat_interval"]);
                }, json["d"]["heartbeat_interval"] * 0/*Math.random()*/);
            }
            else if (json["op"] == 1) {
                ws.send(JSON.stringify({
                    op: 1,
                    d: json["s"]
                }));
            }

            if (json["t"] == "MESSAGE_CREATE" && json["d"]["content"].charAt(0) == '~' && !vc) {
                console.log("someone wants to play something");
            }
            else if (json["t"] == "MESSAGE_CREATE" && json["d"]["content"].charAt(0) == '~' && vc) {
                
            }
        }
    });
}).end();