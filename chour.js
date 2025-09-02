
// client/chour.js

// DOM Elements
const logEl = document.getElementById('log');
const playersArea = document.getElementById('playersArea');
const scoresDiv = document.getElementById('scores');
const winnerEl = document.getElementById('winner');

const joinArea = document.getElementById('joinArea');
const gameArea = document.getElementById('gameArea');

const roomLabel = document.getElementById('roomLabel');
const youLabel = document.getElementById('youLabel');
const yourRoleLabel = document.getElementById('yourRoleLabel');

const joinBtn = document.getElementById('joinBtn');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

// ✅ Initialize Socket.IO client
const socket = io("http://localhost:3000");

// Player info
let playerName = "";
let roomCode = "";

// --- Join Button ---
joinBtn.addEventListener('click', () => {
  roomCode = document.getElementById('roomCode').value.trim();
  playerName = document.getElementById('playerName').value.trim();

  if (!roomCode || !playerName) {
    alert("Please enter Room Code and Name");
    return;
  }

  socket.emit('join', { roomCode, name: playerName });

  joinArea.style.display = 'none';
  gameArea.style.display = 'block';

  roomLabel.textContent = roomCode;
  youLabel.textContent = playerName;
});

// --- Socket Events ---

// Update room state
socket.on('roomState', ({ players, hostId, round }) => {
  playersArea.innerHTML = "";
  players.forEach(p => {
    const div = document.createElement('div');
    div.textContent = p;
    playersArea.appendChild(div);
  });

  if (socket.id === hostId) {
    startBtn.style.display = "inline-block";
    resetBtn.style.display = "inline-block";
  } else {
    startBtn.style.display = "none";
    resetBtn.style.display = "none";
  }
});

// Receive your role
socket.on('yourRole', ({ role }) => {
  yourRoleLabel.textContent = `Role: ${role}`;
});

// Round start
socket.on('roundStart', ({ round, players }) => {
  logEl.innerHTML = `Round ${round} started!`;
  scoresDiv.innerHTML = "";
  winnerEl.style.display = "none";
});

// Round result
socket.on('roundResult', ({ suspectIndex, correct, rolesRevealed, totals }) => {
  logEl.innerHTML = `Roles: ${rolesRevealed.join(", ")} <br> Suspect Correct? ${correct}`;
  scoresDiv.innerHTML = totals.map(t => `${t.name}: ${t.score}`).join("<br>");
});

// Game over
socket.on('gameOver', ({ winner, totals }) => {
  winnerEl.style.display = "block";
  winnerEl.innerHTML = `Winner: ${winner.name} (${winner.score} pts)`;
  scoresDiv.innerHTML = totals.map(t => `${t.name}: ${t.score}`).join("<br>");
});

// Game reset
socket.on('gameReset', () => {
  yourRoleLabel.textContent = "Role: ?";
  logEl.innerHTML = "";
  scoresDiv.innerHTML = "";
  winnerEl.style.display = "none";
});

// Error messages
socket.on('errorMsg', msg => {
  alert(msg);
});

// --- Start Round Button ---
startBtn.addEventListener('click', () => {
  socket.emit('startRound');
});

// --- Reset Game Button ---
resetBtn.addEventListener('click', () => {
  socket.emit('resetGame');
});
