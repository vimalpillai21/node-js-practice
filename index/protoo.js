var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var session = require('express-session');
var cookieParser = require('cookie-parser');
var exphbs = require('express-handlebars');
var cors = require('cors')
const protooServer = require('protoo-server');
const https = require('http');
const url = require('url');
const AwaitQueue = require('awaitqueue');
const queue = new AwaitQueue();

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(upload.array());
app.use(cookieParser());
app.use(session({secret:"23432fgfdfddgjfdg23#%$*%#"}));

var Users = [];
const options =
{
  maxReceivedFrameSize     : 960000, // 960 KBytes.
  maxReceivedMessageSize   : 960000,
  fragmentOutgoingMessages : true,
  fragmentationThreshold   : 960000
};


runHttpsServer();
runProtooWebSocketServer();

 async function runHttpsServer()
{
        console.log('running an HTTPS server...');

        httpsServer = https.createServer(app);
            
        await new Promise((resolve) =>
        {
            httpsServer.listen(4443, 'localhost', resolve);
        });
}

function runProtooWebSocketServer()
{
	console.log('running protoo WebSocketServer...');

	// Create the protoo WebSocket server.
	protooWebSocketServer = new protooServer.WebSocketServer(httpsServer,
		{
			maxReceivedFrameSize     : 960000, // 960 KBytes.
			maxReceivedMessageSize   : 960000,
			fragmentOutgoingMessages : true,
			fragmentationThreshold   : 960000
		});

	// Handle connections from clients.
	protooWebSocketServer.on('connectionrequest', (info, accept, reject) =>
	{
		// The client indicates the roomId and peerId in the URL query.
		const u = url.parse(info.request.url, true);
		const peerId = u.query['peerId'];
		console.log("event hitted");
		queue.push( () =>
		{
            console.log("reached here");
			const protooWebSocketTransport = accept();
            handleProtooConnection(protooWebSocketServer,{peerId, protooWebSocketTransport});
			
		})
			.catch((error) =>
			{
				console.log('room creation or room joining failed:%o', error);

				reject(error);
			});
	});
}

function handleProtooConnection(protooWebSocketServer,{peerId,protooWebSocketTransport})
	{   
        try{ 
        console.log("Hello World");
        const room = new protooServer.Room();
        const peer = room.createPeer('bob', protooWebSocketTransport);
        protooWebSocketServer.on('connectionrequest', (info, accept, reject) =>
        {   console.log("Inside handleProtooConnection");
            console.log("Info - " + info);
            if (info)
            {
                console.log("connectionre quested to server");

                // The app chooses a `peerId` and creates a peer within a specific room.
                console.log(room.peers);
            for (let peer of room.peers)
                {
                    console.log('peer id: %s', peer.id);
                }
                accept();
            }
            else
            {
                reject(403, 'Not Allowed');
            }
        });

        peer.on('request', (request, accept, reject) =>
        {
            if (something in request)
                accept({ foo: 'bar' });
            else
                reject(400, 'Not Here');
        });

        peer.notify('lalala', { foo: 'bar' });

        peer.on('notification', (notification) =>
        {
            console.log('notification received')
            console.log(notification);
            peer.notify('Hello', {'message':'success'})
        });
    }
    catch(err) {
        console.log("Error happened");
        console.log(err);
    }
}
app.get('/',(req,res) =>{
    res.render("chat");
});
 
// app.listen(3000);
