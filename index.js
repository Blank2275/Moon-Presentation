var app = require('express')();
var http = require('http').createServer(app);

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/client.js", function (req, res) {
    res.sendFile(__dirname + "/client.js");
});

app.get("/moon-texture", function (req, res) {
    res.sendFile(__dirname + "/moon.jpeg");
});

app.get("/moon-displacement", function (req, res) {
    res.sendFile(__dirname + "/moon-displacement.jpg");
})

http.listen(8080, function () {
    console.log("localhost:8080");
});