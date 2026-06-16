const sharpScale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const flatScale = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const flatToSharp = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" };
const sharpToFlat = { "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb" };
const chordInput = document.getElementById("chordInput");
const resultDisplay = document.getElementById("resultDisplay");
const stepDisplay = document.getElementById("stepDisplay");
const btnUp = document.getElementById("btnUp");
const btnDown = document.getElementById("btnDown");
const btnReset = document.getElementById("btnReset");
const btnCopy = document.getElementById("btnCopy");
const accidentalMode = document.getElementById("accidentalMode");
const btnExample = document.getElementById("btnExample");
const analysisText = document.getElementById("analysisText");
let semitoneOffset = 0;

function normalizeRoot(root) {
  return flatToSharp[root] || root;
}
function displayRoot(root) {
  if (accidentalMode.value === "flat") return sharpToFlat[root] || root;
  return root;
}
function shiftRoot(root, semitones) {
  const normalizedRoot = normalizeRoot(root);
  const rootIndex = sharpScale.indexOf(normalizedRoot);
  if (rootIndex === -1) return root;
  const nextIndex = (rootIndex + semitones + 120) % 12;
  return displayRoot(sharpScale[nextIndex]);
}
function transposeSingleChord(chord, semitones) {
  const match = chord.match(/^([A-G](?:#|b)?)([^/\s]*)(?:\/([A-G](?:#|b)?))?$/);
  if (!match) return chord;
  const [, root, suffix, bass] = match;
  const shiftedRoot = shiftRoot(root, semitones);
  const shiftedBass = bass ? `/${shiftRoot(bass, semitones)}` : "";
  return `${shiftedRoot}${suffix}${shiftedBass}`;
}
function transposeText(text, semitones) {
  return text.replace(/[A-G](?:#|b)?[^\s|,;]*/g, chord => transposeSingleChord(chord, semitones));
}
function countChords(text) {
  return (text.match(/[A-G](?:#|b)?[^\s|,;]*/g) || []).length;
}
function renderResult() {
  const input = chordInput.value.trim();
  const direction = semitoneOffset > 0 ? `升 ${semitoneOffset}` : semitoneOffset < 0 ? `降 ${Math.abs(semitoneOffset)}` : "原調";
  stepDisplay.textContent = semitoneOffset === 0 ? "0 半音" : `${direction} 半音`;
  if (!input) {
    resultDisplay.textContent = "請先輸入和弦";
    analysisText.textContent = "可處理 Am7、Bb、F#/A# 等常見和弦。";
    return;
  }
  resultDisplay.textContent = transposeText(input, semitoneOffset);
  analysisText.textContent = `已辨識 ${countChords(input)} 個和弦，輸出使用${accidentalMode.value === "flat" ? "降記號 b" : "升記號 #"}。`;
}
btnUp.addEventListener("click", () => { semitoneOffset += 1; renderResult(); });
btnDown.addEventListener("click", () => { semitoneOffset -= 1; renderResult(); });
btnReset.addEventListener("click", () => { semitoneOffset = 0; renderResult(); });
btnExample.addEventListener("click", () => { chordInput.value = "C  G/B  Am7  F\nDm7  G7  Cmaj7  Bb"; renderResult(); });
accidentalMode.addEventListener("change", renderResult);
btnCopy.addEventListener("click", async () => {
  const text = resultDisplay.textContent;
  if (!text || text === "請先輸入和弦") return;
  await navigator.clipboard.writeText(text);
  btnCopy.textContent = "已複製";
  setTimeout(() => { btnCopy.textContent = "複製"; }, 1200);
});
chordInput.addEventListener("input", renderResult);
renderResult();
