const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the "images" directory
app.use("/images", express.static(path.join(__dirname, "images")));

// Serve static files from the root directory
app.use(express.static(__dirname));

const PORT = 5001; // Specify the port
const HOST = "localhost"; // Specify the host

let arr = [];
let playingArray = [];

io.on("connection", (socket) => {
    socket.on("find", (e) => {
        if (e.name != null) {
            arr.push(e.name);
            if (arr.length >= 2) {
                let p1obj = {
                    p1name: arr[0],
                    p1value: "X",
                    p1move: "",
                };
                let p2obj = {
                    p2name: arr[1],
                    p2value: "O",
                    p2move: "",
                };
                let obj = {
                    p1: p1obj,
                    p2: p2obj,
                    sum: 1,
                };
                playingArray.push(obj);
                arr.splice(0, 2);
                io.emit("find", { allPlayers: playingArray });
            }
        }
    });

    socket.on("playing", (e) => {
        if (e.value == "X") {
            let objToChange = playingArray.find(
                (obj) => obj.p1.p1name === e.name
            );
            objToChange.p1.p1move = e.id;
            objToChange.sum++;
        } else if (e.value == "O") {
            let objToChange = playingArray.find(
                (obj) => obj.p2.p2name === e.name
            );
            objToChange.p2.p2move = e.id;
            objToChange.sum++;
        }
        io.emit("playing", { allPlayers: playingArray });
    });

    socket.on("gameOver", (e) => {
        playingArray = playingArray.filter(
            (obj) => obj.p1.p1name !== e.name
        );
        io.emit("gameOver", { name: e.name });
    });
});

app.get("/", (req, res) => {
    const indexPath = path.resolve(__dirname, "index.html");
    return res.sendFile(indexPath);
});

server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});