import { request } from "node:https";

function enter(token) {
    let gate;

    const req = request({
        host: "discord.com",
        path: "/api/v10/gateway/bot",
        protocol: "https:",
        headers: {
            authorization: `Bot ${token}`
        }
    }, (res) => {
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
            gate = chunk;
        });
    });

    req.on("error", (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    req.end();

    return new Promise((resolve) => {
        const ticker = setInterval(() => {
            if (typeof gate == "string") {
                resolve(JSON.parse(gate)["url"]);
                clearInterval(ticker);
            }
        })
    });
}

export { enter };