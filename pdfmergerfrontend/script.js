const dropArea = document.getElementById("drop-area");
const sortableList = document.getElementById("sortable");
const sendButton = document.getElementById("send-button");
const downloadLink = document.getElementById("download-link");
let draggedItem = null;

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
    }, 0);
});

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
    for (let i = 0; i < files.length; i++) {
        const li = document.createElement("li");
        li.textContent = files[i].name;
        li.setAttribute("draggable", true);
        sortableList.appendChild(li);
    }
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
    const documents = [...sortableList.children].map(item => item.textContent);

    // Hier wird eine Beispiel-URL verwendet. Ersetze sie durch die URL deines Backends.
    fetch('http://pdfmergerbackendservice:5001/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ files: documents })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Netzwerkantwort war nicht ok: ' + response.statusText);
        }
        return response.json(); // Hier erwarten wir jetzt JSON
    })
    .then(data => {
        // Erstelle einen Download-Link für die erhaltene URL
        const url = data.download_link; // URL aus der JSON-Antwort
        downloadLink.href = url;
        downloadLink.style.display = 'block'; // Link sichtbar machen
    })
    .catch(error => console.error('Fehler beim Senden der Dokumente:', error));
});
