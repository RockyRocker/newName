
let currentIndex = 0;
const output = document.getElementById("output");
const copyBtn = document.getElementById("copyBtn");

// ----- Funktion: Visa rader -----
function renderLines() {
    output.innerHTML = "";

    lines.forEach((line, index) => {
        const div = document.createElement("div");
        div.className = "line";
        div.textContent = line;

        if (index === currentIndex) {
            div.classList.add("selected");
        }

        div.addEventListener("click", () => {
            currentIndex = index;
            renderLines();
        });

        output.appendChild(div);
    });

    if (lines.length > 0) {
        copyBtn.classList.remove("hidden");
    }
}

// ----- Funktion: Generera ny lines-array från textfält -----
document.getElementById("generateBtn").addEventListener("click", () => {
    const text = document.getElementById("inputText").value.trim();

    if (text.length === 0) {
        alert("Textfältet är tomt.");
        return;
    }

    // Dela upp texten i rader + trim + begränsa max 100 tecken
    lines = text
        .split("\n")
        .map(l => l.trim().slice(0, 100))
        .filter(l => l.length > 0);

    currentIndex = 0;
    renderLines();
});

// ----- Funktion: Kopiera vald rad -----
function copySelectedLine() {
    if (lines.length === 0) return;

    const textToCopy = lines[currentIndex];

    navigator.clipboard.writeText(textToCopy).then(() => {
        // Hoppa till nästa rad automatiskt
        if (currentIndex < lines.length - 1) {
            currentIndex++;
        }
        renderLines();
    });
}

copyBtn.addEventListener("click", copySelectedLine);

// ----- Tangentbordsnavigation -----
document.addEventListener("keydown", (e) => {
    if (lines.length === 0) return;

    if (e.key === "ArrowDown") {
        if (currentIndex < lines.length - 1) currentIndex++;
        renderLines();
    }

    if (e.key === "ArrowUp") {
        if (currentIndex > 0) currentIndex--;
        renderLines();
    }

    if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
        copySelectedLine();
    }
});

// Visa initial array direkt vid start
renderLines();
