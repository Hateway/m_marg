var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname + '/public'));
var mysql = require('mysql');
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}
//localStorage.setItem('nick', 'Hateway');

var con = mysql.createConnection({
    host: "localhost",
    port: '3306',
    user: "root",
    password: "",
    database: "race"
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket) {
    con.query("SELECT * FROM `users` WHERE `nick`='" + localStorage.getItem('nick') + "'", function(error, results, fields) {
        con.query("SELECT * FROM `npc` WHERE `mapa`='" + results[0].mapa + "'", function(error, re, fields) {
            var npcs = "";
            for (let i = 0; i < re.length; i++) {
                if (i == re.length - 1) {
                    npcs += re[i].nazwa + "|" + re[i].dialog + "|" + re[i].x + "|" + re[i].y + "|" + re[i].width + "|" + re[i].height + "|" + re[i].outfit;
                } else {
                    npcs += re[i].nazwa + "|" + re[i].dialog + "|" + re[i].x + "|" + re[i].y + "|" + re[i].width + "|" + re[i].height + "|" + re[i].outfit + "#";
                }
            }
            io.emit('dane', { x: results[0].x, y: results[0].y, outfit: results[0].outfit, nick: localStorage.getItem('nick'), mapa: results[0].mapa, npcs: npcs, });
        });
    });
    socket.on('kordy', function(gracz) {
        io.emit('kordy', gracz);
        con.connect(function(err) {
            var sql = "UPDATE `users` SET `x`='" + gracz.x + "', `y`='" + gracz.y + "' WHERE `nick`='" + gracz.nick + "'";
            con.query(sql, function(err, result) {});
        });
    });
});


/*for (var i in rows) {
    app.get("/getvar", function(req, res) {
        res.json({ x: rows[i].x, y: rows[i].y });
        console.log(rows[i].x);
    });
}
});*/

http.listen(3000, function() {
    console.log('listening on *:3000');
});