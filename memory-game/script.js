const symbolBank = ["♪", "♫", "♬", "♭", "♯", "△", "◇", "☆", "✦", "✧"];
const gameBoard = document.getElementById("gameBoard");
const moveCount = document.getElementById("moveCount");
const matchCount = document.getElementById("matchCount");
const totalPairs = document.getElementById("totalPairs");
const timer = document.getElementById("timer");
const restartBtn = document.getElementById("restartBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const winPanel = document.getElementById("winPanel");
const winSummary = document.getElementById("winSummary");
const difficultySelect = document.getElementById("difficultySelect");
const bestScore = document.getElementById("bestScore");
const hintText = document.getElementById("hintText");
let activeSymbols = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;
let elapsedSeconds = 0;
let timerId = null;

function shuffle(array) {
  const shuffled = [...array];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}
function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}
function storageKey() { return `memory-best-${activeSymbols.length}`; }
function loadBestScore() {
  const record = JSON.parse(localStorage.getItem(storageKey()) || "null");
  bestScore.textContent = record ? `${record.moves}步 / ${formatTime(record.seconds)}` : "--";
}
function saveBestScore() {
  const record = JSON.parse(localStorage.getItem(storageKey()) || "null");
  if (!record || moves < record.moves || (moves === record.moves && elapsedSeconds < record.seconds)) {
    localStorage.setItem(storageKey(), JSON.stringify({ moves, seconds: elapsedSeconds }));
    return true;
  }
  return false;
}
function startTimer() {
  if (timerId) return;
  timerId = setInterval(() => {
    elapsedSeconds += 1;
    timer.textContent = formatTime(elapsedSeconds);
  }, 1000);
}
function stopTimer() { clearInterval(timerId); timerId = null; }
function createCard(symbol, index) {
  const button = document.createElement("button");
  button.className = "card-button";
  button.type = "button";
  button.dataset.symbol = symbol;
  button.dataset.index = String(index);
  button.setAttribute("aria-label", "尚未翻開的卡片");
  button.innerHTML = `<span class="card-inner"><span class="card-face card-back">?</span><span class="card-face card-front">${symbol}</span></span>`;
  button.addEventListener("click", () => flipCard(button));
  return button;
}
function renderBoard() {
  const pairCount = Number(difficultySelect.value);
  activeSymbols = symbolBank.slice(0, pairCount);
  gameBoard.style.setProperty("--cols", pairCount === 6 ? 4 : pairCount === 8 ? 4 : 5);
  gameBoard.innerHTML = "";
  shuffle([...activeSymbols, ...activeSymbols]).map(createCard).forEach(card => gameBoard.appendChild(card));
  totalPairs.textContent = String(pairCount);
  loadBestScore();
}
function resetTurn() { firstCard = null; secondCard = null; lockBoard = false; }
function updateStats() {
  moveCount.textContent = String(moves);
  matchCount.textContent = String(matches);
  timer.textContent = formatTime(elapsedSeconds);
}
function handleMatch() {
  firstCard.classList.add("is-matched");
  secondCard.classList.add("is-matched");
  firstCard.disabled = true;
  secondCard.disabled = true;
  matches += 1;
  hintText.textContent = "配對成功，繼續找下一組。";
  updateStats();
  resetTurn();
  if (matches === activeSymbols.length) finishGame();
}
function handleMismatch() {
  hintText.textContent = "不一樣，記住位置再試一次。";
  setTimeout(() => {
    firstCard.classList.remove("is-flipped");
    secondCard.classList.remove("is-flipped");
    resetTurn();
  }, 760);
}
function flipCard(card) {
  if (lockBoard || card === firstCard || card.classList.contains("is-matched")) return;
  startTimer();
  card.classList.add("is-flipped");
  if (!firstCard) { firstCard = card; hintText.textContent = "再翻一張找配對。"; return; }
  secondCard = card;
  lockBoard = true;
  moves += 1;
  updateStats();
  firstCard.dataset.symbol === secondCard.dataset.symbol ? handleMatch() : handleMismatch();
}
function finishGame() {
  stopTimer();
  const isBest = saveBestScore();
  loadBestScore();
  winSummary.textContent = `你用了 ${moves} 步，完成時間 ${formatTime(elapsedSeconds)}。${isBest ? "刷新最佳紀錄！" : ""}`;
  winPanel.hidden = false;
}
function restartGame() {
  stopTimer();
  firstCard = null; secondCard = null; lockBoard = false;
  moves = 0; matches = 0; elapsedSeconds = 0;
  winPanel.hidden = true;
  hintText.textContent = "翻開兩張相同符號即可配對。";
  updateStats(); renderBoard();
}
restartBtn.addEventListener("click", restartGame);
playAgainBtn.addEventListener("click", restartGame);
difficultySelect.addEventListener("change", restartGame);
restartGame();
