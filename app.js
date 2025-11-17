import { processLines } from './main.js'; // Din befintliga main.js-modul

const inputText = document.getElementById('inputText');


const processBtn = document.getElementById('processBtn');
const displayList = document.getElementById('displayList');
const copyBtn = document.getElementById('copyBtn');

let displayArray = [];
let currentIndex = 0;

// Bearbeta text när användaren klickar på knappen
processBtn.addEventListener('click', () => {
  const lines = inputText.value.split('\n');
  displayArray = processLines(lines); // Använd din main.js logik
  currentIndex = 0;
  renderList();
});

// Rendera listan med rader
function renderList() {
  displayList.innerHTML = '';
  displayArray.forEach((line, index) => {
    const li = document.createElement('li');
    li.textContent = line.substring(0, 100); // Max 100 tecken
    if(index === currentIndex) li.classList.add('selected');
    displayList.appendChild(li);
  });

  // Scrolla så att aktuell rad är synlig
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
  }
});

// Kopiera aktuell rad
function copyCurrentLine() {
  if(displayArray.length === 0) return;

  const text = displayArray[currentIndex];
  navigator.clipboard.writeText(text).then(() => {
    // Flytta automatiskt till nästa rad
    currentIndex = Math.min(currentIndex + 1, displayArray.length - 1);
    renderList();
  });
}

// Kopiera-knapp
copyBtn.addEventListener('click', copyCurrentLine);
