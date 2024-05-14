window.initializeCanvasClickEvents = function (dotNetReference) {
    const canvas = document.getElementById("myCanvas");
    const context = canvas.getContext("2d");

    // Variables para manejar los nodos y aristas en la vista.
    let nodes = [];
    let lines = [];
    let selectedNode = null;
    let nodeCount = 0;

    function drawCircle(nodo, color) {
        context.beginPath();
        context.arc(nodo.x, nodo.y, nodo.radius, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();

        context.fillStyle = "white"; // Color del texto
        context.font = "20px sans-serif"; // Estilo y tamaño de la fuente
        context.fillText(nodo.label, nodo.x - 6, nodo.y + 6); // Posición del texto
    }

    function drawLine(selectedNode, nearestNode, color) {
        context.beginPath();
        context.moveTo(selectedNode.x, selectedNode.y);
        context.lineTo(nearestNode.x, nearestNode.y);
        context.strokeStyle = color;
        context.lineWidth = 3;
        context.stroke();
    }

    function redrawCanvas() {
        // Limpiar el canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Redibujar todas las aristas
        lines.forEach(line => drawLine(line.from, line.to, "black"));

        // Redibujar todos los nodos
        nodes.forEach(node => drawCircle(node, "red"));
    }

    canvas.addEventListener("click", async function (event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const modoEdicion = await dotNetReference.invokeMethodAsync("ModoEdicion");

        dotNetReference.invokeMethodAsync("CanvasClick", x, y); // Muestra las coordenadas del click en el canvas

        switch (modoEdicion) {
            case 0:
                
                break;
            case 1: // Crear nodo
                nodeCount++;
                const nodo = { x, y, radius: 20, label: nodeCount.toString() };
                drawCircle(nodo, "red");
                nodes.push(nodo);

                console.log(nodes);
                break;
            case 2: // Crear aristas
                if (selectedNode) {
                        const nearestNode = nodes.reduce((prev, curr) => {
                        const prevDist = Math.hypot(prev.x - x, prev.y - y);
                        const currDist = Math.hypot(curr.x - x, curr.y - y);
                        return prevDist < currDist ? prev : curr;
                    });

                    // Dibujar una línea entre nodos
                    drawLine(selectedNode, nearestNode, "black");

                    lines.push({ from: selectedNode, to: nearestNode });
                    selectedNode = null;
                    dotNetReference.invokeMethodAsync("AddArista", 0);
                    console.log(lines);
                    redrawCanvas();
                } else {
                    if (nodes.length != 0) {
                        selectedNode = nodes.find(nodo => Math.hypot(nodo.x - x, nodo.y - y) <= nodo.radius);
                        dotNetReference.invokeMethodAsync("AddArista", 1);
                    }
                }
                break;
            case 3: // Eliminar objeto
                // Borrar nodo
                selectedNode = nodes.find(nodo => Math.hypot(nodo.x - x, nodo.y - y) <= nodo.radius);

                if (selectedNode) {
                    const index = nodes.findIndex(node => node.x === selectedNode.x && node.y === selectedNode.y);
                    if (index !== -1) {
                        nodes.splice(index, 1);
                    }
                    redrawCanvas(); // Redibujar todo el canvas

                }

                // Borrar arista
                const tolerance = 5; // Tolerancia para determinar si el clic está cerca de una arista
                let aristaPorEliminar = null;

                lines.forEach(line => {
                    const distance = Math.abs((line.to.y - line.from.y) * x - (line.to.x - line.from.x) * y + line.to.x * line.from.y - line.to.y * line.from.x) / Math.hypot(line.to.x - line.from.x, line.to.y - line.from.y);
                    if (distance < tolerance) {
                        aristaPorEliminar = line;
                    }
                });

                if (aristaPorEliminar) {
                    lines = lines.filter(line => line !== aristaPorEliminar); // Eliminar la arista
                    redrawCanvas(); // Redibujar todo el canvas
                }

                console.log(nodes);
                console.log(lines);
                break;
        }
    });

    function clearCanvas() {
        // Limpiar el canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Vaciar las listas
        nodes.splice(0, nodes.length); // Eliminar todos los nodos
        lines.splice(0, lines.length); // Eliminar todas las aristas

        nodeCount = 0;

        console.log(nodes);
        console.log(lines);
    }

    document.getElementById("limpiar-canvas").addEventListener("click", function () {
        clearCanvas();
    });
};