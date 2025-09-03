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

// ✅ Initialize Socket.IO client (update with your backend URL)
const socket = io("https://backendchourpolice.onrender.com");

// Player info
let playerName = "";
let roomCode = "";
let myRole = "";
let myIndex = -1;

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
socket.on('yourRole', ({ role, index }) => {
  myRole = role;
  myIndex = index;
  yourRoleLabel.textContent = `Role: ${role}`;
});

// Round start
socket.on('roundStart', ({ round, players, policeIndex }) => {
  logEl.innerHTML = `Round ${round} started!`;

  playersArea.innerHTML = "";
  players.forEach((p, idx) => {
    const div = document.createElement('div');
    div.className = "playerBox";
    div.innerHTML = `<b>${p}</b>`;

    if (idx === policeIndex) {
      div.classList.add("police");
      div.innerHTML += " 👮";
    }

    // If I am police, I can click suspects
    if (myRole === "police" && idx !== myIndex) {
      div.classList.add("suspect");
      div.onclick = () => {
        socket.emit("accuse", { suspectIndex: idx });
      };
    }

    playersArea.appendChild(div);
  });

  scoresDiv.innerHTML = "";
  winnerEl.style.display = "none";
});

// Round result
socket.on('roundResult', ({ suspectIndex, correct, rolesRevealed, totals }) => {
  let result = correct ? "✅ Police caught the Thief!" : "❌ Police failed!";
  logEl.innerHTML = `Roles: ${rolesRevealed.join(", ")} <br>${result}`;

  scoresDiv.innerHTML = totals.map(t => `${t.name}: ${t.score}`).join("<br>");
});

// Game over
socket.on('gameOver', ({ winner, totals, history }) => {
  winnerEl.style.display = "block";
  winnerEl.innerHTML = `🏆 Winner: ${winner.name} (${winner.score} pts)`;

  scoresDiv.innerHTML = totals.map(t => `${t.name}: ${t.score}`).join("<br>");

  logEl.innerHTML = "Game Over!<br>Role history:<br>" +
    history.map((r, i) => `Round ${i + 1}: ${r.join(", ")}`).join("<br>");
});

// Game reset
socket.on('gameReset', () => {
  myRole = "";
  yourRoleLabel.textContent = "Role: ?";
  logEl.innerHTML = "";
  scoresDiv.innerHTML = "";
  winnerEl.style.display = "none";
});

// Error messages
socket.on('errorMsg', msg => {
  alert(msg);
});

// --- Buttons ---
startBtn.addEventListener('click', () => {
  socket.emit('startRound');
});
resetBtn.addEventListener('click', () => {
  socket.emit('resetGame');
});
