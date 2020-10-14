const socket = io();
let correctAnswer = '';
let score = 0;
let lastQuestion = '';

const modal = document.getElementById( "myModal" );
const nameBtn = document.getElementById( "submitName" );
const nameInput = document.getElementById( "nameInput" );
const modalText = document.getElementById( "message" );

modalPopup('Please enter your name:', 'name');

socket.on('scoreboard', (data) => {
    const scoreHTML = document.getElementById( 'score' );
    let scoreData = '';

    data.forEach(item => {
        scoreData += `${item.name}: ${item.score}<br />`;
    });
    scoreHTML.innerHTML = scoreData;
});

socket.on('question', (data) => {

    const question = document.getElementById( "question" );
    const btn = document.getElementById( "btn" );

    if (lastQuestion === data[0].question) 
        socket.emit('newQuestion', score);

    question.innerHTML = data[0].question;
    lastQuestion = data[0].question;

    let btnHTML = '';

    let answers = data[0].incorrect_answers;
    correctAnswer = data[0].correct_answer;
    answers.push(correctAnswer);
    answers = shuffle(answers);

    answers.forEach(element => btnHTML += `<button onclick="pickAnswer(this.innerHTML, correctAnswer)">${element}</button>` );

    btn.innerHTML = btnHTML;

    console.log(correctAnswer);

});

function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
}

function pickAnswer(data, answer) {

    let result = '';

    if (data === answer) {
        result = `
            <img src="./img/Tick.png" width="265px">
            <p>Correct! Well done</p>`;
        score++;
    } else {
        result = `
            <img src="./img/Close.png" width="256px">
            <p>
                Incorrect! The correct answer was:<br />
                ${answer}
            </p>`;
    }

    modalPopup(result, 'answer');

    socket.emit('newQuestion', score);

}

function modalPopup(text, type) {

    switch(type) {

        case 'name':
            modalText.innerHTML = text;
            modal.style.display = "block";
            break;

        case 'answer':
            nameBtn.innerHTML = 'Continue';
            modalText.innerHTML = text;
            nameInput.style.display = 'none';
            modal.style.display = "block";
            break;

    }

    nameBtn.onclick = () => {

        if (type === 'name') {

            socket.emit('newUser', nameInput.value);
            modal.style.display = "none";

        } else {
            modal.style.display = "none";
        }

    }

}