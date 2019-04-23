console.log('Hello frontend');

var gameInProgress = false
var xTurn = true;
var simpleAI = false;
var minimaxAi = false;
var aiPlaysX = false;

var wins = ['abc', 'def', 'ghi', 'adg', 'beh', 'cfi', 'aei', 'gec']
var playerX = '';
var playerOh = '';
var catsGameRscs = [];
var catsGame = true;

var scoreElX = document.querySelector('.scorebox-content__X')
var scoreElOh = document.querySelector('.scorebox-content__Oh')

var playerXScore = 0;
var playerOhScore = 0;
var numNodes = 0;

function fadeIn(element, msDuration) {
    let start;
    let opacity = 0;
    let duration = msDuration || 1000;
    element.style.opacity = "0";
    function fadeStep(timestamp) {
        if (!start) {
            start = timestamp
            element.className = element.className.replace('hide', 'show')
        }
        let progress = (timestamp - start) / duration; // pct complete between 0 and 1
        if (progress < .99) {
            element.style.opacity = progress.toFixed(2)
            window.requestAnimationFrame(fadeStep)
        } else {
            element.style.opacity = "1"
            return true
        }
    }
    window.requestAnimationFrame(fadeStep)
}
function show(element) {
    element.classList.add('show');
    element.classList.remove('hide');
}
function hide(element) {
    element.classList.add('hide');
    element.classList.remove('show');
}
function notifyTurn() {
    document.querySelectorAll('.alert').forEach(alert => {
        hide(alert)
    })
    if (xTurn) {
        fadeIn(document.querySelector('.alertX'))
    } else if (minimaxAi) {
        fadeIn(document.querySelector('.alert-minimax'))
        setTimeout(function() {parseBoard(getNewBoard(convertBoard()))}, 1500)
    } else if (simpleAI) {
        fadeIn(document.querySelector('.alert-simpleAI'))
        setTimeout(chooseRandom, 1500)
    } else {
        fadeIn(document.querySelector('.alertOh'))
    }
}
function chooseRandom() {
    let boxCodex = 'abcdefghi';
    let choice = randomBox()
    function randomBox() { 
        let num = Math.floor(Math.random() * 9);
        if ((playerX.includes(boxCodex[num])) || playerOh.includes(boxCodex[num])) {
            return randomBox();
        } else {
            return num
        }
    }
    document.getElementById(`${boxCodex[choice]}`).click()
}
function pick(event) {
    event.stopPropagation();
    gameInProgress = true;
    if (xTurn) {
        playerX += event.target.id;
        show(event.target.children[0]);
        console.log(playerX)
    } else {
        playerOh += event.target.id;
        show(event.target.children[1]);
        console.log(playerOh)
    }
    event.target.removeEventListener('click', pick);
    checkGame()
}
function gameIsCats() {
    document.querySelector('.game').style.visibility = 'hidden';
    document.querySelector('.interaction-window').style.visibility = 'hidden';
    fadeIn(document.querySelector('.main-rsc'));
    show(document.querySelector('.rsc-window'));
    catsGameRscs = document.querySelectorAll('.rsc');
    catsGameRscs.forEach(rsc => {
        show(rsc);
        animateRsc(rsc);
    })
    window.addEventListener('click', cleanUpCatsGame);
    function cleanUpCatsGame() {
        hide(document.querySelector('.rsc-window'));
        document.querySelector('.interaction-window').style.visibility = 'visible';
        document.querySelector('.game').style.visibility = 'visible';
        catsGame = false;
        window.removeEventListener('click', cleanUpCatsGame);
        reset();
        show(document.querySelector('.interaction-window'));
    }
}
function gameOver(xTurn) {
    let winText = ' won! Good game, thank you for playing. Press <em>Escape</em> for options.'
    let a = document.querySelector('.alertWin');
    document.querySelectorAll('.alert').forEach(alert => {
        alert.className = alert.className.replace('show', 'hide')
    });
    if (xTurn) {
        a.innerHTML = 'Player X' + winText;
        playerXScore++;
    } else {
        a.innerHTML = 'Player O' + winText;
        playerOhScore++;
    }
    a.className = a.className.replace('hide', 'show')
    scoreElOh.textContent = `O:${playerOhScore}`
    scoreElX.textContent = `X:${playerXScore}`
    console.log(`Current score: X:${playerXScore} || O:${playerOhScore}`)
    document.querySelectorAll('.box').forEach(box => {
        box.removeEventListener('click', pick);
    })
    gameInProgress = false;

}
function currentPlayer() {
    if (xTurn) {
        return playerX
    } else {
        return playerOh
    }
}
function checkGame() {
    console.log('checking game')
    if (playerOh.length + playerX.length < 5) {
        console.log('Win not possible')
    } else {
        for (let win of wins) {
            let count = 0;
            //console.log(`checking ${win}`)
                for (let letr of win) {
                    //console.log(`Count is ${count}, checking ${letr} ${currentPlayer()}`)
                    if (currentPlayer().includes(letr)) {
                        count += 1;
                        if (count === 3) {
                            return gameOver(xTurn)
                        }
                    }
                }
        }

    }
    if (playerX.length + playerOh.length > 8) {
        catsGame = true;
        gameInProgress = false;
        return gameIsCats();

    }
    xTurn = !xTurn;
    notifyTurn()
    console.log('No victory yet!')
}
function reset() {
    gameInProgress = false;
    xTurn = true;
    playerX = '';
    playerOh = '';
    document.querySelectorAll('.box').forEach(box => {
        box.removeEventListener('click', pick);
        hide(box.children[0]);
        hide(box.children[1]);
    });
    document.querySelectorAll('.alert').forEach(alert => hide(alert))
}
function animateRsc(rsc) {
    console.log("animating rsc:", rsc)
    let scrnWidth  = rsc.parentElement.offsetWidth;
    let scrnHeight = rsc.parentElement.offsetHeight;
    let rscWidth = rsc.offsetWidth;
    let rscHeight = rsc.offsetHeight;
    let posX = Math.random() * (scrnWidth - rscWidth) // random initial position
    let posY = Math.random() * (scrnHeight - rscHeight) // random initial position
    let dx = 7; // delta x each frame in px
    let dy = 7; // delta y each frame in px
    console.log('scrnWidth', scrnWidth, 'scrnHeight', scrnHeight, 'rscWidth', rscWidth, 'rscHeight', rscHeight)
    function listenForResize(event) {
        scrnHeight = window.innerHeight;
        scrnWidth = window.innerWidth;
        posX = parseFloat(rsc.style.left.replace('px', ''));
        posY = parseFloat(rsc.style.top.replace('px', ));
        console.log('window resize: reassigning x,y')
    }
    window.addEventListener('resize', listenForResize)

    rsc.style.left = posX + 'px'
    rsc.style.top = posY + 'px'
    //fadeIn(rsc)

    function moveStep(timestamp) {
        if ((posX >= scrnWidth - rscWidth) || posX < 0) {
            dx = -dx
        }
        if ((posY >= scrnHeight - rscHeight) || posY < 0) {
            dy = -dy
        }
        posX += dx
        posY += dy
        rsc.style.left = posX + 'px'
        rsc.style.top = posY + "px"
        //cleanup 
        if (!catsGame) {
            console.log('removing resize listener')
            window.removeEventListener('resize', listenForResize)
            document.querySelectorAll('.rsc').forEach(rsc => {
                rsc.remove()
            })
            setTimeout(loadRscImg, 4000)

            return "cat's game is over" //fadeOut(element) or resetRsc(rsc)
        }
        requestAnimationFrame(moveStep)
    }
    window.requestAnimationFrame(moveStep)
}
function activateBoxes() {
    // starting game
    console.log("Starting tic-tac-toe! Player X may begin.")
    let boxes = document.querySelectorAll('.row > *');
    boxes.forEach(box => {
        box.addEventListener('click', pick);
    });
}
function loadRscImg() {
    ('loading rsc')
    let rscWindow = document.querySelector('.rsc-window')
    let rsc = document.createElement('div')
    return new Promise(function (resolve, reject) {
        rsc.className = 'rsc'
        rsc.onload = function() {
            console.log('onload')
            resolve(catsGameRsc.push(rsc))
        }
        rsc.onerror = function(error) {

            reject(console.error(error))
        }
        let timestamp = new Date().getTime()  - Math.round(Math.random() * 10000)
        rsc.style.backgroundImage = `url(https://thecatapi.com/api/images/get?format=src&type=jpg&size=small&${timestamp})`;
        rscWindow.appendChild(rsc)
    })
}
function interactionToggle(event) {
    if (event.key === 'Escape') {
        let interactWindow = document.querySelector('.interaction-window');
        if (interactWindow.className.includes('show')) {
            hide(interactWindow);
        } else {
            show(interactWindow);
            if (!gameInProgress) {
                const play = document.querySelector('#play')
                const newGame = document.querySelector('#new-game')
                hide(play);
                show(newGame);
            }
        }
    }
}
function convertBoard() {
    input ='abcdefghi'.split('').map(char => {
      if (playerX.includes(char)) {
        return true;
      } else if (playerOh.includes(char)) {
        return false;
      } else {
        return null;
      }
    })
    output = [[null,null,null],[null,null,null],[null,null,null]]
    let a = 0
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            output[i%3][j%3] = input[a];
            a++
        }
    }
    return output
}
function getWinner(board) {
    // from https://blog.vivekpanyam.com/how-to-build-an-ai-that-wins-the-basics-of-minimax-search/
    // thank you vivek!
        vals = [true, false];       //[playerx, playerO]
        var allNotNull = true;      
        for (var k = 0; k < vals.length; k++) { // loop for x, loop for o
            var value = vals[k];
        

            var diagonalComplete1 = true;
            var diagonalComplete2 = true;
            for (var i = 0; i < 3; i++) {
                if (board[i][i] != value) {    // [0,0] [1,1] [2,2]
                    diagonalComplete1 = false;
                }
                if (board[2 - i][i] != value) {// [2,0] [1,1] [0,2]
                    diagonalComplete2 = false;
                }
                var rowComplete = true;
                var colComplete = true;
                for (var j = 0; j < 3; j++) {
                    if (board[i][j] != value) { // [0,0] [1,1] [2,2] on first time through loop
                        rowComplete = false;
                    }
                    if (board[j][i] != value) {
                        colComplete = false;
                    }
                    if (board[i][j] == null) {
                        allNotNull = false;
                    }
                }
                if (rowComplete || colComplete) {
                    return value ? 1 : 0;
                }
            }
        if (diagonalComplete1 || diagonalComplete2) {
            return value ? 1 : 0;
        }
    }
    if (allNotNull) {
        return -1;
    }
    return null;
}
function recursiveMinimax(board, player) {
    // from https://blog.vivekpanyam.com/how-to-build-an-ai-that-wins-the-basics-of-minimax-search/
    // thank you vivek!
    numNodes++;
    var winner = getWinner(board);
    if (winner !== null) {
        switch(winner) {
            case 1:
                // AI wins
                return [1, board];
                console.log('win')
            case 0:
                // opponent wins
                return [-1, board];
                console.log('loss')
            case -1:
                // Tie
                return [0, board];
                console.log('cats')
        }
    } else {
        // Next states
        var nextVal = null;
        var nextBoard = null;

        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                if (board[i][j] == null) {
                    board[i][j] = player;
                    var value = recursiveMinimax(board, !player)[0];
                    if ((player && (nextVal == null || value > nextVal)) || (!player && (nextVal == null || value < nextVal))) {
                        nextBoard = board.map(arr => {
                            return arr.slice();
                        });
                        nextVal = value
                    }
                    board[i][j] = null;
                }
            }
        }
        return [nextVal, nextBoard]
    }
}
function getNewBoard() {
    board = convertBoard()
    newBoard = recursiveMinimax(board, xTurn)
    console.log('Finished compute. Number of nodes:', numNodes)
    console.table(newBoard[1])
    return newBoard[1]

}
function parseBoard(board) {
    let inputBoard = board.reduce((previous, current) => {
        return previous.concat(current)
    }, [])
    let i = 0;
    let string = 'abcdefghi';
    while (i < 9) {
        if (inputBoard[i] !== null) {
            if (!playerX.includes(string[i]) && !playerOh.includes(string[i])) {
//                if (inputBoard[i] === true) {
//                    console.log('clicking for X')
//                    document.getElementById(string[i]).click();
                if (inputBoard[i] === false) {
                    console.log('clicking for Oh')
                    document.getElementById(string[i]).click();
                }       
            }
        }
        i++
    }
}
function playButton() {
    let interactWindow = document.querySelector('.interaction-window');
    let game = document.querySelector('.game');
    hide(game);
    hide(interactWindow);
    Promise.resolve(fadeIn(game)).then(activateBoxes, () => console.log('error on playbutton activateBoxes call'));
    window.removeEventListener('keydown', interactionToggle);
    window.addEventListener('keydown', interactionToggle);
}

function playNewGameButton() {
    reset()
    playButton()
}

function resetScoreButton() {
    playerXScore = 0;
    playerOhScore = 0;
    scoreElX.textContent = `X: ${playerOhScore}`;
    scoreElOh.textContent = `O: ${playerXScore}`;
}

function simpleAIButton(event) {
    simpleAI = !simpleAI;
    if (simpleAI) {
        event.target.classList.add('active')
        window.removeEventListener('keydown', interactionToggle)
        minimaxAi = false;
        document.getElementById('minimax-ai').classList.remove('active')
    } else {
        event.target.classList.remove('active')
        window.addEventListener('keydown', interactionToggle)
    }
    
}

function minimaxAIButton(event) {
    minimaxAi = !minimaxAi;
    if (minimaxAi) {
        event.target.classList.add('active')
        window.removeEventListener('keydown', interactionToggle)
        simpleAI = false;
        document.getElementById('simple-ai').classList.remove('active')
    } else {
        event.target.classList.remove('active')
        window.addEventListener('keydown', interactionToggle)
    }
    
}

document.getElementById('play').addEventListener('click', playButton);
document.getElementById('new-game').addEventListener('click', playNewGameButton);
document.getElementById('simple-ai').addEventListener('click', simpleAIButton);
document.getElementById('minimax-ai').addEventListener('click', minimaxAIButton);
document.getElementById('reset-score').addEventListener('click', resetScoreButton);

setTimeout(loadRscImg, 4000)
setTimeout(loadRscImg, 4000)
setTimeout(loadRscImg, 4000)
setTimeout(loadRscImg, 4000)
setTimeout(loadRscImg, 4000)
setTimeout(loadRscImg, 4000)
setTimeout(loadRscImg, 4000)
setTimeout(loadRscImg, 4000)