const dropArea = document.getElementById("drop-area");
const sortableList = document.getElementById("sortable");
const sendButton = document.getElementById("send-button");
const downloadLink = document.getElementById("download-link");
let draggedItem = null;
let droppedFiles = []; // Array zum Speichern der hochgeladenen Dateien
let originalFiles = []; // Array zum Speichern der Originaldateien

// Drag and drop logic for the sortable list
sortableList.addEventListener("dragstart", (e) => {
    draggedItem = e.target;
    setTimeout(() => {
        e.target.classList.add("dragging");
    }, 0);
});

sortableList.addEventListener("dragend", (e) => {
    setTimeout(() => {
        draggedItem.classList.remove("dragging");
        draggedItem = null;
        updateDroppedFiles();
    }, 0);
});

// Funktion zum Aktualisieren des droppedFiles-Arrays
const updateDroppedFiles = () => {
    droppedFiles = []; // Leere das Array
    const items = sortableList.querySelectorAll("li"); // Hole alle li-Elemente

    items.forEach(item => {
        const fileName = item.textContent; // Hol den Dateinamen aus dem li-Element
        const file = Array.from(originalFiles).find(f => f.name === fileName); // Finde die Datei im originalen Array

        if (file) {
            droppedFiles.push(file); // Füge die Datei zum Array hinzu
        }
    });

    console.log('Aktualisierte Reihenfolge der Dateien:', droppedFiles); // Überprüfe die neue Reihenfolge
};

sortableList.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(sortableList, e.clientY);
    if (afterElement == null) {
        sortableList.appendChild(draggedItem);
    } else {
        sortableList.insertBefore(draggedItem, afterElement);
    }
});

// Add dropped documents to the sortable list
dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
});

dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;

    // Clear previous files and add new files
    for (let i = 0; i < files.length; i++) {
        const li = document.createElement("li");
        li.textContent = files[i].name;
        li.setAttribute("draggable", true);
        sortableList.appendChild(li);
        
        // Store the file in the droppedFiles array only if it is not already added
        if (!droppedFiles.some(file => file.name === files[i].name)) {
            droppedFiles.push(files[i]);
            originalFiles.push(files[i]); // Füge die Datei auch zu originalFiles hinzu
        }
    }

    console.log('Dropped files:', droppedFiles); // Überprüfen, ob die Dateien korrekt gespeichert werden
});

// Get the element after which to insert the dragged item
const getDragAfterElement = (container, y) => {
    const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
};

// Send documents to backend
sendButton.addEventListener("click", () => {
    const filePromises = droppedFiles.map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result.split(',')[1]; // Nur der Base64-Teil
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file); // Liest die Datei als Data URL
        });
    });
    //http://192.168.178.27:5001/upload
    //http://192.168.178.53:30081/upload
    Promise.all(filePromises)
        .then(base64Files => {
            console.log('Base64 Files:', base64Files); // Überprüfen der konvertierten Base64-Daten
            return fetch('http://192.168.178.53:30081/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ files: base64Files }) // Sende die Base64-kodierten Dateien
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Netzwerkantwort war nicht ok: ' + response.statusText);
            }
            return response.json(); // Hier erwarten wir jetzt JSON
        })
        .then(data => {
            // Überprüfe, ob der Server eine Erfolgsnachricht zurückgegeben hat
            if (data.error) {
                console.error('Fehler:', data.error); // Fehler im Terminal ausgeben
                alert(`Fehler: ${data.error}`); // Benutzer über den Fehler informieren
                return; // Beende die Ausführung der Funktion, wenn ein Fehler aufgetreten ist
            }
        
            // Erstelle einen Download-Link für die erhaltene URL
            const url = data.download_link; // URL aus der JSON-Antwort
            downloadLink.href = url;
            downloadLink.style.display = 'block'; // Link sichtbar machen
            alert('PDFs erfolgreich zusammengeführt!'); // Erfolgreiche Rückmeldung an den Benutzer
        })
});
