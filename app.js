import { processLines } from './main.js';

const inputText = document.getElementById('inputText');
const processBtn = document.getElementById('processBtn');
const displayList = document.getElementById('displayList');
const copyBtn = document.getElementById('copyBtn');

let displayArray = [];
let currentIndex = 0;

// Bearbeta text när användaren klickar på knappen
processBtn.addEventListener('click', () => {
  const lines = inputText.value.split('\n')
    .map(line => line.trim())           // ta bort whitespace
    .filter(line => line.length > 0);   // ignorera tomma rader

  displayArray = processLines(lines);
  currentIndex = 0;
  renderList();
});

// Rendera listan med markerad rad
function renderList() {
  displayList.innerHTML = '';
  displayArray.forEach((line, index) => {
    const li = document.createElement('li');
    li.textContent = line.length > 125 ? line.substring(0, 125) + '…' : line;
    li.classList.add('line');
    if(index === currentIndex) li.classList.add('selected');

    li.addEventListener('click', () => {
      currentIndex = index;
      renderList();
    });

    displayList.appendChild(li);
  });

  const selectedLi = displayList.querySelector('.selected');
  if (selectedLi) {
    selectedLi.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// Navigering med tangentbord
document.addEventListener('keydown', (e) => {
  if(displayArray.length === 0) return;

  if(e.key === 'ArrowDown') {
    currentIndex = Math.min(currentIndex + 1, displayArray.length - 1);
    renderList();
    e.preventDefault();
  } else if(e.key === 'ArrowUp') {
    currentIndex = Math.max(currentIndex - 1, 0);
    renderList();
    e.preventDefault();
  } else if(e.key === 'c' && e.ctrlKey) {
    copyCurrentLine();
    e.preventDefault();
  }
});

// Kopiera aktuell rad
function copyCurrentLine() {
  if(displayArray.length === 0) return;

  const text = displayArray[currentIndex];
  navigator.clipboard.writeText(text).then(() => {
    console.log(`Kopierad: ${text}`); // feedback
    currentIndex = Math.min(currentIndex + 1, displayArray.length - 1);
    renderList();
  });
}

// Kopiera-knapp
copyBtn.addEventListener('click', copyCurrentLine);
