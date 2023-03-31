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
    res.sendFile(__dirname + '/index2.html');
});

server.listen(3002, () => {
    console.log('listening on *:3002');
});

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
        socket.on('chatmessage', (msg) => {
            socket.emit('chatmessage', msg);
            socket.broadcast.emit('chatmessage', msg);
        });
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
})