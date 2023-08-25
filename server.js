import { config } from 'dotenv';
import { WebSocketServer } from 'ws';
import { createClient } from 'redis';
import { createServer } from 'http';
import { createWriteStream } from 'fs';
config();
import Joi from 'joi';
const { SERVER_PORT, REDIS_URL } = process.env;

const client = createClient({ url: REDIS_URL });
await client.connect();

const isFields = await client.keys('fields');
if (!isFields) {
	const fields = Array(100).fill('#000000');
	for (let i = 0; i < fields.length; i++) {
		await client.hSet('fields', String(i), fields[i]);
	}
}
const res = await client.hGetAll('fields');
const field = await client.hGet('fields', String(1001))
console.log(res, field);

function isJSON(str) {
	try {
	  JSON.parse(str);
	  return true;
	} catch (error) {
	  return false;
	}
}
const validateMessageJson = async (message) => {
    const schemaMessage = Joi.object({
        id: Joi.number().required(),
		color: Joi.string().required(),
    })
    const messageValidation = schemaMessage.validate(message)
    if (messageValidation.error) return false
    return true
}

const sockets = []
const wss = new WebSocketServer({ noServer: true });
wss.on('connection', async (ws) => {
	sockets.push(ws);
	console.log(await client.hGetAll('fields'));
	ws.send(JSON.stringify(await client.hGetAll('fields')));
	console.log('Client connected');
	ws.on('message', async (message) => {
		console.log(message)
		let json 
		if (isJSON(message)) {
			json = JSON.parse(message)
			if (!validateMessageJson(json)) return
		} else {
			return
		}
		const { id, color } = json
		const fieldColor = await client.hGet('fields', String(id))
		if (!fieldColor || (fieldColor === color)) return
		await client.hSet('fields', String(id), color)
		for (const socket of sockets) {
			socket.send(JSON.stringify({ id, color }))
		}
	});
});
wss.on('close', () => {
	console.log('Server closed');
});
wss.on('error', (err) => {
	console.log(err);
});

const server = createServer((req, res) => {
	res.writeHead(200, {
		'Content-Type': 'text/html'
	})
	req.pipe(createWriteStream('frontend/index.html'));
});
server.listen(SERVER_PORT, () => {
	console.log(`Server is running on port ${SERVER_PORT}`);
});
server.on('upgrade', (req, socket, head) => {
	wss.handleUpgrade(req, socket, head, (ws) => {
		wss.emit('connection', ws, req);
	});
});
