const https = require('https');
const express = require('express');
const socket = require('socket.io');
const ip = require('ip');

// Web Setup
const app = express();
const port = 4000;
const server = app.listen(port, () => console.log(`Listening to requests at http://${ip.address()}:${port}`));
app.use(express.static( 'public' ));
const io = socket(server);

let playerData = [];
let guests = 1;

io.on('connection', (socket) => {

  loadQuestion(socket);

  socket.on('newQuestion', (data) => {

    for (let i = 0; i < playerData.length; i++) {
      if (playerData[i].id == socket.id) {
        playerData[i].score = data;
        socket.emit('scoreboard', playerData);
      }
    }

    loadQuestion(socket);
  });

  socket.on('newUser', (name) => {

    if ( name === null || name === '' || name === undefined ) {
      name = `Guest(${guests++})`;
    }

    playerData.push({
      "id" : socket.id,
      "name" : name,
      "score" : 0
    });
    socket.emit('scoreboard', playerData);
  });

});

function loadQuestion(socket) {

  // API Call
  https.get('https://opentdb.com/api.php?amount=1&category=11&difficulty=easy', (resp) => {
    
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => data += chunk);

    // The whole response has been received. Print out the result.
    resp.on('end', () => socket.emit('question', JSON.parse(data).results));

  }).on("error", (err) => console.log("Error: " + err.message));

}