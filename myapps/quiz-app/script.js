const questions = [
  { question: "HTML 裡用來顯示最大標題的標籤是哪一個？", answers: ["<h1>", "<title>", "<p>", "<button>"], correct: "<h1>", explanation: "<h1> 是頁面主要標題，通常一頁只放一個最重要的標題。" },
  { question: "CSS 主要負責網頁的哪一件事？", answers: ["資料庫儲存", "畫面樣式", "伺服器登入", "圖片壓縮"], correct: "畫面樣式", explanation: "CSS 控制顏色、排版、動畫和響應式版面。" },
  { question: "JavaScript 通常用來讓網頁做什麼？", answers: ["變得可以互動", "改變電腦時間", "安裝印表機", "關閉網路"], correct: "變得可以互動", explanation: "像翻牌、計分、按鈕回饋都屬於 JavaScript 的工作。" },
  { question: "吉他和弦 C 往上升一個半音會變成什麼？", answers: ["B", "C#", "D", "F"], correct: "C#", explanation: "十二平均律中 C 上升半音會到 C#，也可寫作 Db。" },
  { question: "GitHub Pages 首頁通常需要哪個檔案名稱？", answers: ["index.html", "main.docx", "style.exe", "photo.png"], correct: "index.html", explanation: "資料夾裡的 index.html 會成為該路徑的預設首頁。" },
  { question: "相對路徑 ./memory-game/index.html 代表什麼？", answers: ["目前資料夾底下的 memory-game 頁面", "電腦 C 槽根目錄", "網路斷線", "刪除資料夾"], correct: "目前資料夾底下的 memory-game 頁面", explanation: "相對路徑讓專案上傳 GitHub Pages 後仍能正確連結。" }
];
const questionPanel = document.getElementById("questionPanel");
const resultPanel = document.getElementById("resultPanel");
const questionCount = document.getElementById("questionCount");
const questionText = document.getElementById("questionText");
const answerList = document.getElementById("answerList");
const feedbackText = document.getElementById("feedbackText");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const scoreText = document.getElementById("scoreText");
const totalText = document.getElementById("totalText");
const streakText = document.getElementById("streakText");
const progressBar = document.getElementById("progressBar");
const resultTitle = document.getElementById("resultTitle");
const resultSummary = document.getElementById("resultSummary");
const reviewList = document.getElementById("reviewList");
let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let streak = 0;
let answered = false;
let userAnswers = [];
function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
function updateHeader() {
  scoreText.textContent = String(score);
  totalText.textContent = String(quizQuestions.length);
  streakText.textContent = String(streak);
  progressBar.style.width = `${(currentQuestionIndex / quizQuestions.length) * 100}%`;
}
function renderQuestion() {
  const currentQuestion = quizQuestions[currentQuestionIndex];
  answered = false;
  feedbackText.textContent = "";
  nextBtn.disabled = true;
  nextBtn.textContent = currentQuestionIndex === quizQuestions.length - 1 ? "看結果" : "下一題";
  questionCount.textContent = `第 ${currentQuestionIndex + 1} 題 / 共 ${quizQuestions.length} 題`;
  questionText.textContent = currentQuestion.question;
  answerList.innerHTML = "";
  currentQuestion.shuffledAnswers.forEach(answer => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.textContent = answer;
    button.addEventListener("click", () => chooseAnswer(answer, button));
    answerList.appendChild(button);
  });
  updateHeader();
}
function chooseAnswer(answer, selectedButton) {
  if (answered) return;
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const answerButtons = [...document.querySelectorAll(".answer-button")];
  const correct = answer === currentQuestion.correct;
  answered = true;
  nextBtn.disabled = false;
  answerButtons.forEach(button => {
    button.disabled = true;
    if (button.textContent === currentQuestion.correct) button.classList.add("is-correct");
  });
  if (correct) { score += 1; streak += 1; feedbackText.textContent = `答對了！${currentQuestion.explanation}`; }
  else { streak = 0; selectedButton.classList.add("is-wrong"); feedbackText.textContent = `答錯了。${currentQuestion.explanation}`; }
  userAnswers.push({ question: currentQuestion.question, selected: answer, correct: currentQuestion.correct, explanation: currentQuestion.explanation, isCorrect: correct });
  updateHeader();
}
function showResult() {
  progressBar.style.width = "100%";
  questionPanel.hidden = true;
  resultPanel.hidden = false;
  const percentage = Math.round((score / quizQuestions.length) * 100);
  resultTitle.textContent = percentage >= 85 ? "高分通過！" : percentage >= 60 ? "完成測驗！" : "再練一次！";
  resultSummary.textContent = `你答對 ${score} 題，共 ${quizQuestions.length} 題，得分率 ${percentage}%。`;
  reviewList.innerHTML = userAnswers.map((item, index) => `<article class="review-item ${item.isCorrect ? "ok" : "miss"}"><strong>${index + 1}. ${item.isCorrect ? "答對" : "答錯"}</strong><p>${item.question}</p><small>你的答案：${item.selected}｜正解：${item.correct}</small><span>${item.explanation}</span></article>`).join("");
}
function goNext() {
  if (!answered) return;
  currentQuestionIndex += 1;
  currentQuestionIndex >= quizQuestions.length ? showResult() : renderQuestion();
}
function restartQuiz() {
  quizQuestions = shuffle(questions).map(q => ({ ...q, shuffledAnswers: shuffle(q.answers) }));
  currentQuestionIndex = 0; score = 0; streak = 0; answered = false; userAnswers = [];
  questionPanel.hidden = false;
  resultPanel.hidden = true;
  renderQuestion();
}
nextBtn.addEventListener("click", goNext);
restartBtn.addEventListener("click", restartQuiz);
tryAgainBtn.addEventListener("click", restartQuiz);
restartQuiz();
