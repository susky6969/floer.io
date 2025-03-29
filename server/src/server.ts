import { createServer, ServerResponse, IncomingMessage } from "node:http";
import { type Player } from "./entities/player";
import Cluster from "node:cluster";
import { Config } from "./config";
import { WebSocketServer } from "ws";
import { Socket } from "node:net";

export interface PlayerData {
    joined: boolean
    entity?: Player
}

export interface ProcessMessage {
    req: IncomingMessage
}

function cors(res: ServerResponse) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, X-Requested-With");
    res.setHeader("Access-Control-Max-Age", "3600");
}

function showNotFound(res: ServerResponse) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain").end("ERR! 404 Not Found");
}

if (Cluster.isPrimary) {
    const app = createServer();

    app.on("request", (req, res) => {
        cors(res);

        if (req.method !== "GET") {
            showNotFound(res);
            return;
        }

        if (req.url?.startsWith("/floer/server_info")) {
            res.setHeader("Content-Type", "application/json").end(JSON.stringify({}))
            return;
        }

        showNotFound(res);
    })

    app.on("upgrade", async(req, socket, head) => {
        const ip = req.socket.remoteAddress;

        if (req.url?.startsWith("/play")) {
            Cluster.fork().send({
                req: { headers: req.headers, method: req.method } as IncomingMessage
            } as ProcessMessage, req.socket);
        } else {
            socket.emit("close");
        }

        // idleTimeout: 30,
        //
        // open(socket) {
        //     // disconnect players that didn't send a join packet after 1 second
        //     setTimeout(() => {
        //         if (!socket.getUserData().joined) {
        //             socket.close();
        //         }
        //     }, 1000);
        //     // socket.getUserData().entity = game.addPlayer(socket);
        // },
        //
        // /**
        //  * Handle packets
        //  */
        // message(socket, message) {
        //     try {
        //         const player = socket.getUserData().entity;
        //         if (player === undefined) return;
        //         player.processMessage(message);
        //     } catch (e) {
        //         console.warn("Error parsing message:", e);
        //     }
        // },
        //
        // close(socket) {
        //     const player = socket.getUserData();
        //     // if (player.entity) game.removePlayer(player.entity);
        // }
    });

    app.listen(Config.port, Config.host);
}else {
    const ws = new WebSocketServer({ noServer: true });

    process.on("message", (data: ProcessMessage, socket?: Socket) => {
        console.log(
            `Received message from worker ${process.pid}`
        )
        const { req } = data;
        // @ts-ignore
        ws.handleUpgrade(req, socket, req.headers, wssocket => {
            wssocket.binaryType = "arraybuffer";

            wssocket.on("message", () => {

            })
        });
    });
}
