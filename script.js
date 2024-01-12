const outputTextArea = document.getElementById("outputData");
const paragraphs = document.querySelectorAll(".single-lyric");
const undoButton = document.getElementById("undo");
const redoButton = document.getElementById("redo");
const clearButton = document.getElementById("clear");
const inputColor = document.getElementById("color-picker");
const canvas = document.getElementById("whiteboard");

function convert() {
  var input = document.querySelector("#inputData").value;
  var output = document.querySelector("#outputData");
  output.textContent = "";

  if (isValidBinary(input)) {
    var binaryArray = input.split(" ");
    for (var i = 0; i < binaryArray.length; i++) {
      var binaryChar = binaryArray[i].trim();
      if (binaryChar !== "") {
        var decimalValue = parseInt(binaryChar, 2);
        output.textContent += String.fromCharCode(decimalValue);
      }
    }
  } else {
    for (var i = 0; i < input.length; i++) {
      output.textContent += input[i].charCodeAt(0).toString(2) + " ";
    }
  }
}

function isValidBinary(binary) {
  return /^[01\s]+$/.test(binary);
}

function copyToClipboard(element) {
  if (!element) {
    console.error(
      "Elemento inválido para copiar para a área de transferência."
    );
    return;
  }

  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = element.textContent || element.value;
  document.body.appendChild(tempTextArea);

  tempTextArea.select();

  try {
    navigator.clipboard
      .writeText(tempTextArea.value)
      .then(() => {
        alert("Texto copiado para a área de transferência!");
      })
      .catch((err) => {
        console.error("Erro ao copiar para a área de transferência:", err);

        document.execCommand("copy");
        alert("Texto copiado para a área de transferência!");
      });
  } catch (err) {
    console.error("Erro ao copiar para a área de transferência:", err);
  } finally {
    document.body.removeChild(tempTextArea);
  }
}
outputTextArea.addEventListener("click", function () {
  copyToClipboard(this);
});
paragraphs.forEach(function (elemento) {
  elemento.addEventListener("click", function () {
    copyToClipboard(this);
  });
});

const ctx = canvas.getContext("2d");

ctx.lineWidth = 10;
ctx.lineCap = "round";

let isDrawing = false;
let lastX = 0;
let lastY = 0;

let history = [];
let historyIndex = -1;

function startDrawing(event) {
  event.preventDefault();

  isDrawing = true;
  setLastCoords(event);
  updateButtons();
}

function draw(event) {
  if (isDrawing) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    setLastCoords(event);
    ctx.lineTo(lastX, lastY);
    ctx.stroke();
    saveState();
  }
}

function stopDrawing() {
  if (isDrawing) {
    isDrawing = false;
    updateButtons();
  }
}

function setLastCoords(event) {
  lastX = event.offsetX;
  lastY = event.offsetY;
}

function startDrawingTouch(event) {
  event.preventDefault();
  isDrawing = true;
  setLastCoordsTouch(event);
  updateButtons();
}

function drawTouch(event) {
  if (isDrawing) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    setLastCoordsTouch(event);
    ctx.lineTo(lastX, lastY);
    ctx.stroke();
    saveState();
  }
}

function setLastCoordsTouch(event) {
  const touch = event.touches[0];
  const rect = canvas.getBoundingClientRect();
  lastX = touch.clientX - rect.left;
  lastY = touch.clientY - rect.top;
}

function saveState() {
  if (history.length > historyIndex + 1) {
    history.splice(historyIndex + 1);
  }
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  history.push(imageData);
  historyIndex = history.length - 1;
  updateButtons();
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    ctx.putImageData(history[historyIndex], 0, 0);
    updateButtons();
  }
}

function redo() {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    ctx.putImageData(history[historyIndex], 0, 0);
    updateButtons();
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
   history = []; 
  historyIndex = -1; 
  saveState();
  updateButtons();
}

function updateButtons() {
  undoButton.disabled = historyIndex === 0;
  redoButton.disabled = historyIndex === history.length - 1;
  clearButton.disabled = history.length === 0;
}

document.querySelector(".convert-button").addEventListener("click", convert);
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);

canvas.addEventListener("touchstart", startDrawingTouch);
canvas.addEventListener("touchmove", drawTouch);
canvas.addEventListener("touchend", stopDrawing);
canvas.addEventListener("touchcancel", stopDrawing);

undoButton.addEventListener("click", undo);
redoButton.addEventListener("click", redo);
clearButton.addEventListener("click", clearCanvas);
inputColor.addEventListener("input", function () {
  ctx.strokeStyle = inputColor.value;
});
