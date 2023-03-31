const express = require('express');
const serverIO = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
var cors = require('cors')
var app = express();
app.use(cors());
const http = require('http');
const server = http.createServer(app);
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index1.html');
});

server.listen(3001, () => {
    console.log('listening on *:3001');
});
var host = '3.253.136.167';
var port = '6379';
const connectionString = "redis://default:19qoDU4xLiOBHBGzam0mKskdeIKCoXTn@redis-19638.c3.eu-west-1-1.ec2.cloud.redislabs.com:19638";
var io = serverIO(server, { transports: [ "polling", "websocket" ]});

const pubClient = createClient({ url: connectionString });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));
});
io
    .of('/socket')
    .on('connection', function (socket) {
        console.log('a user connected', socket.id);
        socket.on('chatmessage', (msg) => {
            console.log('message: ' + msg);
            socket.emit('chatmessage', msg);
            socket.broadcast.emit('chatmessage', msg);
        });
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
})