import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3001');

ws.on('error', console.error);

ws.on('open', function open() {
    ws.send(JSON.stringify({
        id: 55,
        color: '#f00000'
    }));
ws.on('close', function close() {
    console.log('Connection closed');
})
});
ws.on('message', function incoming(message) {
    console.log('received: %s', message);
})
// fetch('http://localhost:3000/authorization', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json'
//     }, 
//     body: JSON.stringify({ login: 'admin', password: '12345' })
// }).then(async(res) => {
//     console.log(await res.text())
// })
// fetch('http://localhost:3000/registration', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json'
//     }, 
//     body: JSON.stringify({ login: 'admin', password: '12345', nickname: 'admin' })
// }).then(async(res) => {
//     console.log(await res.text())
// })