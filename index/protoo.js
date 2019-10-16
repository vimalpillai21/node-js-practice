var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const mediasoup = require('mediasoup');
var multer = require('multer');
var upload = multer();
var session = require('express-session');
var cookieParser = require('cookie-parser');
var exphbs = require('express-handlebars');
var cors = require('cors');
var crypto = require("crypto");
var config = require("./config");
const protooServer = require('protoo-server');
const https = require('http');
const url = require('url');
const Logger = require('./Logger');
const AwaitQueue = require('awaitqueue');
const queue = new AwaitQueue();
const mediasoupWorkers = [];
const logger = new Logger();
let nextMediasoupWorkerIdx = 0;
const Room = require('./Room');
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(upload.array());
app.use(cookieParser());
app.use(session({secret:"23432fgfdfddgjfdg23#%$*%#"}));

const rooms = new Map();
var Users = [];
const options =
{
  maxReceivedFrameSize     : 960000, // 960 KBytes.
  maxReceivedMessageSize   : 960000,
  fragmentOutgoingMessages : true,
  fragmentationThreshold   : 960000
};

runMediasoupWokers();
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
        console.log(info.request.url);
		// The client indicates the roomId and peerId in the URL query.
		const u = url.parse(info.request.url, true);
        const peerId = u.query['peerId'];
        const roomId = u.query['roomId'];
        const forceH264 = true;
        const forceVP9 = false;
		queue.push( async () =>
		{
			const protooWebSocketTransport = accept();
            console.log("room object under creation");
            const room = await getOrCreateRoom({ roomId, forceH264, forceVP9 });
            console.log("room object created successfully");
            // console.log(room);
            console.log("---------------------");
            room.handleProtooConnection(protooWebSocketServer,{peerId, protooWebSocketTransport});
			// handleProtooConnection(protooWebSocketServer,{peerId, protooWebSocketTransport});
		})
			.catch((error) =>
			{
				console.log('room creation or room joining failed:%o', error);

				reject(error);
			});
	});
}
// ---------------------------------------------------------------------------
async function runMediasoupWokers(){
     const { numWorkers } = config.mediasoup;

     for(let i=0;i<numWorkers;++i){
         const worker = await mediasoup.createWorker(
             {
                 logLevel   : config.mediasoup.workerSettings.logLevel,
                 logTags    : config.mediasoup.workerSettings.logTags,
                 rtcMinPort : config.mediasoup.workerSettings.rtcMinPort,
                 rtcMaxPort : config.mediasoup.workerSettings.rtcMaxPort
             }
         );
         worker.on('died', () =>
         {
             logger.error(
                 'mediasoup Worker died, exiting  in 2 seconds... [pid:%d]', worker.pid);

             setTimeout(() => process.exit(1), 2000);
         });

         mediasoupWorkers.push(worker);
     }
}

// ---------------------------------------------------------------------------
function handleProtooConnection(protooWebSocketServer,{peerId,protooWebSocketTransport})
	{   
        try{ 
        // console.log("Hello World");
        const room = new protooServer.Room();
        // console.log(peerId);
        const peer = room.createPeer(peerId, protooWebSocketTransport);
        console.log(room);
        console.log("------------------");
        room._peers.forEach(logMapElements);
        protooWebSocketServer.on('connectionrequest', (info, accept, reject) =>
        {   
            if (info)
            {
                console.log("connectionre quested to server");
                for (let peer of room._peers)
                {
                    console.log('peer id: %s', peer._id);
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
            if(request.method === 'coc'){
                console.log("coc method executed");
                console.log(request.data);
                accept({ name: 'Vimal' });
            }
            else{
                reject(400, 'Not Here');

            }
        });

        peer.notify('lalala', { foo: 'bar' });

        peer.on('notification', (notification) =>
        {
            peer.notify('Hello', {'message':'success'})
        });
    }
    catch(err) {
        console.log(err);
    }
}

function logMapElements(value, key, map) {
    console.log(key);
    console.log(`m[${key}] = ${value}`);
  }

app.get('/',(req,res) =>{
    res.render("chat");
});

 setTimeout(() => {console.log(mediasoupWorkers.length)},2000);

/**
 * Get next mediasoup Worker.
 */
function getMediasoupWorker()
{	logger.info('get Mediasoup function executed');
    const worker = mediasoupWorkers[nextMediasoupWorkerIdx];

    if (++nextMediasoupWorkerIdx === mediasoupWorkers.length)
        nextMediasoupWorkerIdx = 0;

    return worker;
}

/**
 * Get a Room instance (or create one if it does not exist).
 */
async function getOrCreateRoom({ roomId, forceH264 = true, forceVP9 = false })
{
    let room = rooms.get(roomId);

    // If the Room does not exist create a new one.
    if (!room)
    {
        logger.info('creating a new Room [roomId:%s]', roomId);

        const mediasoupWorker = getMediasoupWorker();

        room = await Room.create({ mediasoupWorker, roomId, forceH264, forceVP9 });

        rooms.set(roomId, room);
        room.on('close', () => rooms.delete(roomId));
    }

    return room;
}
// app.listen(3000);
