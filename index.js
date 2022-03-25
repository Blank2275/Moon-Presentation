var app = require('express')();
var http = require('http').createServer(app);
var fs = require('fs');

var stops = []

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/stops", (req, res) => {
    fs.readFile("./stops.html", (err, data) => {
        if (err) console.error(err);
        data = data.toString().split("===stop===").filter((str) => str !== "");
        stops = data;
        res.send(stops);
    })
});

app.get("/client.js", function (req, res) {
    res.sendFile(__dirname + "/client.js");
});

app.get("/presentation.js", function (req, res) {
    res.sendFile(__dirname + "/presentation.js");
});

app.get("/moon-texture", function (req, res) {
    res.sendFile(__dirname + "/moon.jpeg");
});

app.get("/moon-displacement", function (req, res) {
    res.sendFile(__dirname + "/moon-displacement.jpg");
});

app.get("/earth-texture", function (req, res) {
    res.sendFile(__dirname + "/earth-texture.jpeg");
})

http.listen(8080, function () {
    console.log("localhost:8080");
});