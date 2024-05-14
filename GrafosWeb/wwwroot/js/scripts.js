window.initializeCanvasClickEvents = function (dotNetReference) {
    const canvas = document.getElementById("myCanvas");
    const context = canvas.getContext("2d");

    // Configurar las dimensiones del canvas dinámicamente
    function setCanvasSize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    // Llamar a la función para configurar las dimensiones del canvas cuando la ventana se redimensiona
    window.addEventListener("resize", setCanvasSize);

    // Llamar a la función una vez al cargar la página para configurar las dimensiones iniciales del canvas
    setCanvasSize();


    const modalAddArista = document.getElementById("botonModal");
    const botonComenzar = document.getElementById("btnComenzar");
    const botonRTabla = document.getElementById("btnTabla");

    // Variables para manejar los nodos y aristas en la vista.
    let nodes = [];
    let edges = [];
    let selectedNode = null;
    let nodeCount = 0;
    let edgeCount = 0;


    // Matriz de adyacencia
    let adjacencyMatrix = [];
    let matrizAdyacencia = [];
    let loadedMatrix = [];

    
    // Variables globales
    let camino = [];
    let arbolExpansion = null;
    let coloresNodos = null;
    let modo = 0; // Modo de dibujo del grafo correspondiente al algoritmo seleccionado


    // Función para cargar la matriz de adyacencia



    // Inicialización de la matriz de adyacencia
    initializeAdjacencyMatrix(nodeCount);
    function drawCircle(nodo, color) {
        context.beginPath();
        context.arc(nodo.x, nodo.y, 18, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();

        context.fillStyle = "white"; // Color del texto
        context.font = "18px sans-serif"; // Estilo y tamaño de la fuente
        context.fillText(nodo.nombre, nodo.x - 6, nodo.y + 6); // Posición del texto        
    }
    function initializeAdjacencyMatrix(nodeCount) {
        // Inicializar la matriz de adyacencia con ceros
        const adjacencyMatrix = new Array(nodeCount).fill().map(() => new Array(nodeCount).fill(0));

        return adjacencyMatrix;
    }
    function printAdjacencyMatrix(matrix) {
        console.log("Matriz de Adyacencia:");
        matrix.forEach(row => {
            console.log(row.join(" "));
        });
    }
    function updateAdjacencyMatrix(adjacencyMatrix, edges) {
        edges.forEach(edge => {
            if (edge.from && edge.to) {
                const fromIndex = parseInt(edge.from.nombre) - 1;
                const toIndex = parseInt(edge.to.nombre) - 1;
                adjacencyMatrix[fromIndex][toIndex] = edge.peso !== "" ? edge.peso : 0;
                adjacencyMatrix[toIndex][fromIndex] = edge.peso !== "" ? edge.peso : 0;
                console.log(`Arista guardada en la matriz de adyacencia: ${edge.from.nombre} -> ${edge.to.nombre}`);

                redrawCanvas();
            } else {
                console.error("Error: La arista no tiene las propiedades 'from' o 'to' definidas correctamente.", edge);
            }
        });

        printAdjacencyMatrix(adjacencyMatrix);
    }

    function drawLine(arista, color) {
        context.beginPath();
        context.moveTo(arista.from.x, arista.from.y);
        context.lineTo(arista.to.x, arista.to.y);
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.stroke();

        var posicionX = (arista.from.x + arista.to.x) / 2;
        var posicionY = (arista.from.y + arista.to.y) / 2;

        context.fillStyle = "black"; // Color del texto
        context.font = "16px sans-serif"; // Estilo y tamaño de la fuente

        if (Math.abs(arista.from.x - arista.to.x) <= 100) {
            context.fillText(arista.peso, posicionX + 7, posicionY + 6); // Posición del texto
        } else if (Math.abs(arista.from.y - arista.to.y) <= 100) {
            context.fillText(arista.peso, posicionX - 6, posicionY - 7);
        } else {
            context.fillText(arista.peso, posicionX - 6, posicionY + 6);
        }
    }

    function redrawCanvas() {
        // Limpiar el canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Modo 0: Dibuja de manera normal los nodos
        if (modo == 0) {
            // Redibujar todas las aristas
            edges.forEach(line => drawLine(line, "purple"));

            // Redibujar todos los nodos
            nodes.forEach(node => drawCircle(node, "red"));
        }

        // Modo 3: Algoritmos de Prim, Kruskal
        if (modo == 3) {
            console.log("modo 3");

            const arregloA = arbolExpansion.map(nodo => (nodo.from + 1).toString());
            const arregloB = arbolExpansion.map(nodo => (nodo.to + 1).toString());

            const unirSinRepeticion = (arreglo1, arreglo2) => { 
                const union = [...arreglo1, ...arreglo2]; // Concatenar ambos arreglos
                const resultado = union.reduce((resultado, elemento) => {
                    if (!resultado.includes(elemento)) {
                        resultado.push(elemento);
                    }
                    return resultado;
                }, []);
                return resultado;
            };

            // Unir los arreglos sin repeticiones
            camino = unirSinRepeticion(arregloA, arregloB);
            console.log(camino);
            console.log(arregloA);
            console.log(arregloB);

            for (let i = 0; i < edges.length; i++) {
                if (edges[i].from.nombre == arregloA[i] && edges[i].to.nombre == arregloB[i]) {
                    drawLine(edges[i], "green");
                } else {
                    drawLine(edges[i], "purple");
                }
            }

            for (let i = 0; i < edges.length; i++) {
                if (edges[i].to.nombre == arregloA[i] && edges[i].from.nombre == arregloB[i]) {
                    drawLine(edges[i], "green");
                }
            }

            nodes.filter(nodo => camino.includes(nodo.nombre)).forEach(nodo => drawCircle(nodo, "green"));
            nodes.filter(nodo => !camino.includes(nodo.nombre)).forEach(nodo => drawCircle(nodo, "red"));

            modo = 0;
        }

        // Modo 5: Algoritmo de Dijkstra
        if (modo == 5) {
            console.log("modo 5");
            camino = camino.map(numero => numero.toString());

            for (let i = 0; i < edges.length; i++) {
                const edge = edges[i]; // Obtener la arista actual

                // Verificar si los nodos de la arista están en el camino
                const fromInPath = camino.includes(edge.from.nombre);
                const toInPath = camino.includes(edge.to.nombre);

                // Verificar si los nodos de la arista son nodos consecutivos en el camino
                const consecutiveNodes = (fromInPath && toInPath) &&
                    (camino.indexOf(edge.from.nombre) + 1 === camino.indexOf(edge.to.nombre) ||
                        camino.indexOf(edge.to.nombre) + 1 === camino.indexOf(edge.from.nombre));

                // Dibujar la arista si no son nodos consecutivos en el camino
                if (consecutiveNodes) {
                    if (fromInPath && toInPath) {
                        drawLine(edge, "green"); // Ambos nodos están en el camino
                    }
                } else {
                    drawLine(edge, "purple"); // Al menos uno de los nodos no está en el camino
                }
            }

            nodes.filter(nodo => camino.includes(nodo.nombre)).forEach(nodo => drawCircle(nodo, "green"));
            nodes.filter(nodo => !camino.includes(nodo.nombre)).forEach(nodo => drawCircle(nodo, "red"));

            modo = 0;
        }

        // Modo 9; Dibuja el coloreado de cada nodo
        if (modo == 9) {
            // Redibujar todas las aristas
            edges.forEach(line => drawLine(line, "purple"));

            let color;
            for (let i = 0; i < nodes.length; i++) {
                color = coloresNodos[i];
                switch (color) {
                    case 0:
                        drawCircle(nodes[i], "blue");
                        break;
                    case 1:
                        drawCircle(nodes[i], "purple");
                        break;
                    case 2:
                        drawCircle(nodes[i], "green");
                        break;
                    case 3:
                        drawCircle(nodes[i], "pink");
                        break;
                }
            }
            modo = 0;
        }

    }

    // Lógica para el botón Guardar Grafo
    const botonGuardarGrafo = document.getElementById("btnGuardarGrafo");
    botonGuardarGrafo.addEventListener("click", async function (event) {
        if (canvas) {
            // Convertir el canvas a imagen y descargarla
            const dataUrl = canvas.toDataURL("image/png");
            const imagenLink = document.createElement("a");
            imagenLink.href = dataUrl;
            imagenLink.download = "grafo-grafosweb.jpg"; // Nombre del archivo para descargar
            document.body.appendChild(imagenLink);
            imagenLink.click(); // Simula un clic para descargar la imagen
            document.body.removeChild(imagenLink); // Elimina el enlace temporal

            // Crear un Blob con la matriz de adyacencia
            const matrizTexto = adjacencyMatrix.map(row => row.join(",")).join("\n");

            const blob = new Blob([matrizTexto], { type: "text/plain" });

            // Crear un enlace temporal para descargar el archivo de texto
            const textoLink = document.createElement("a");
            textoLink.href = window.URL.createObjectURL(blob);
            textoLink.download = "matriz-adyacencia.txt"; // Nombre del archivo para descargar
            document.body.appendChild(textoLink);
            textoLink.click(); // Simula un clic para descargar el archivo de texto
            document.body.removeChild(textoLink); // Elimina el enlace temporal


        }
    });


    // Lógica para el botón Cargar Grafo
    const botonCargarGrafo = document.getElementById("btnCargarGrafo");
    botonCargarGrafo.addEventListener("click", async function (event) {
        const fileInput = document.getElementById("input-file");
        if (fileInput) {
            fileInput.click(); // Activa el clic en el elemento
        }
    });

    function handleFileInputChange(contenidoArchivo) {
        console.log(contenidoArchivo);

        const lines = contenidoArchivo.trim().split('\n'); // Eliminar espacios en blanco alrededor de las líneas y dividir por salto de línea
        const matriz = lines.map(line => line.trim().split(',').map(cell => {
            const parsedCell = parseInt(cell);
            return isNaN(parsedCell) ? 0 : parsedCell; // Convertir a cero si es NaN
        }));

        console.log("Matriz leída del archivo:", matriz);

        // Limpiar los nodos y las aristas antes de cargar el nuevo grafo
        nodes = [];
        edges = [];

        // Recorrer la matriz para detectar las aristas y crear nodos ficticios
        for (let i = 0; i < matriz.length; i++) {
            for (let j = 0; j < matriz[i].length; j++) {
                // Obtener el peso de la celda actual en la matriz
                const peso = matriz[i][j];

                // Verificar si el peso es distinto de cero
                if (peso !== 0) {
                    // Crear nodos ficticios con coordenadas proporcionales a la posición en la matriz
                    const fromNode = { x: (j + 1) * 50, y: (i + 1) * 50, nombre: (i + 1).toString() };
                    const toNode = { x: (j + 2) * 50, y: (i + 2) * 50, nombre: (j + 1).toString() };
                    const edge = { from: fromNode, to: toNode, peso: peso }; // Mantener el peso como entero

                    // Agregar la arista a la lista de aristas
                    edges.push(edge);

                    // Agregar los nodos a la lista de nodos si no están ya incluidos
                    if (!nodes.find(node => node.nombre === fromNode.nombre)) {
                        nodes.push(fromNode);
                    }
                    if (!nodes.find(node => node.nombre === toNode.nombre)) {
                        nodes.push(toNode);
                    }
                }
            }
        }

        // Actualizar la matriz de adyacencia y redibujar el canvas
        adjacencyMatrix = matriz;
        updateAdjacencyMatrix(adjacencyMatrix, edges);
        redrawCanvas();
    }

    // Lógica para el botón Comenzar: obtiene el algoritmo seleccionado
    botonComenzar.addEventListener("click", async function (event) {
        var seleccion = document.getElementById("algoritmos");
        var nodoInicio = await dotNetReference.invokeMethodAsync("ObtenerNodoInicio");
        var nodoFin = await dotNetReference.invokeMethodAsync("ObtenerNodoFin");

        const algoritmo = seleccion.value;

        console.log("Nodo inicio: " + nodoInicio);
        console.log("Nodo fin: " + nodoFin);
        console.log("Algoritmo: " + algoritmo);
       // console.log(adjacencyMatrix.length);
        dotNetReference.invokeMethodAsync("setAlgoritmo", algoritmo);
        updateAdjacencyMatrix(adjacencyMatrix, edges);
        Recorridos(nodoInicio, nodoFin, algoritmo, adjacencyMatrix, nodes);
    });

    // Checa si la arista tiene peso o no
    modalAddArista.addEventListener("click", async function (event) {
        const pesoArista = await dotNetReference.invokeMethodAsync("getPeso");

        var checkBox = document.getElementById("checkSinPeso");

        if (checkBox.checked == true) {
            edges[edgeCount - 1].peso = "";
            console.log("NA");
            checkBox.checked = false;
        } else {
            edges[edgeCount - 1].peso = pesoArista;
            console.log(pesoArista);
        }

        redrawCanvas();
        return pesoArista;

    });

    // Dibuja y borra los nodos y aristas en el Canvas
    canvas.addEventListener("click", async function (event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const modoEdicion = await dotNetReference.invokeMethodAsync("ModoEdicion");

        dotNetReference.invokeMethodAsync("CanvasClick", x, y); // Muestra las coordenadas del click en el canvas

        switch (modoEdicion) {
            case 10:
                const contenidoArchivo = await dotNetReference.invokeMethodAsync("getContenidoArchivo");
                handleFileInputChange(contenidoArchivo);
                break;
            case 0:

                break;
            case 1: // Crear nodo
                nodeCount++;
                const nodo = { x, y, nombre: nodeCount.toString() };
                drawCircle(nodo, "red");
                nodes.push(nodo);
                adjacencyMatrix = initializeAdjacencyMatrix(nodeCount);
                updateAdjacencyMatrix(adjacencyMatrix, edges)


                console.log(nodes);
                break;
            case 2: // Crear arista             
                if (selectedNode) {
                    const nearestNode = nodes.reduce((prev, curr) => {
                        const prevDist = Math.hypot(prev.x - x, prev.y - y);
                        const currDist = Math.hypot(curr.x - x, curr.y - y);
                        return prevDist < currDist ? prev : curr;
                        updateAdjacencyMatrix(adjacencyMatrix, edges)
                    });

                    dotNetReference.invokeMethodAsync("AddArista", 2);

                    // Dibujar una línea entre nodos
                    const arista = { from: selectedNode, to: nearestNode, peso: "" }
                    drawLine(arista, "purple");

                    edges.push(arista);
                    selectedNode = null;
                    console.log(edges);
                    updateAdjacencyMatrix(adjacencyMatrix, edges);
                    printAdjacencyMatrix(adjacencyMatrix);
                    console.log(selectedNode);

                    edgeCount++;
                    redrawCanvas();
                    dotNetReference.invokeMethodAsync("AddArista", 0);

                } else {
                    if (nodes.length != 0) {
                        selectedNode = nodes.find(nodo => Math.hypot(nodo.x - x, nodo.y - y) <= 20);
                        dotNetReference.invokeMethodAsync("AddArista", 1);
                        updateAdjacencyMatrix(adjacencyMatrix, edges);
                        printAdjacencyMatrix(adjacencyMatrix);
                    }
                }
                break;
            case 3: // Eliminar objeto
                // Borrar nodo
                selectedNode = nodes.find(nodo => Math.hypot(nodo.x - x, nodo.y - y) <= 20);

                if (selectedNode) {
                    const index = nodes.findIndex(node => node.x === selectedNode.x && node.y === selectedNode.y);
                    if (index !== -1) {
                        nodes.splice(index, 1);

                        adjacencyMatrix = initializeAdjacencyMatrix(nodeCount);
                        updateAdjacencyMatrix(adjacencyMatrix, edges);
                        printAdjacencyMatrix(adjacencyMatrix);

                    }
                    redrawCanvas(); // Redibujar todo el canvas
                    updateAdjacencyMatrix(adjacencyMatrix, edges)
                }

                // Borrar arista
                const tolerancia = 5; // Tolerancia para determinar si el clic está cerca de una arista
                let aristaPorEliminar = null;

                edges.forEach(line => {
                    const distancia = Math.abs((line.to.y - line.from.y) * x - (line.to.x - line.from.x) * y + line.to.x * line.from.y - line.to.y * line.from.x) / Math.hypot(line.to.x - line.from.x, line.to.y - line.from.y);
                    if (distancia < tolerancia) {
                        aristaPorEliminar = line;


                        updateAdjacencyMatrix(adjacencyMatrix, edges);
                        printAdjacencyMatrix(adjacencyMatrix);

                    }
                    updateAdjacencyMatrix(adjacencyMatrix, edges)
                });

                if (aristaPorEliminar) {
                    edges = edges.filter(line => line !== aristaPorEliminar); // Eliminar la arista
                    edgeCount--;
                    updateAdjacencyMatrix(adjacencyMatrix, edges);
                    redrawCanvas(); // Redibujar todo el canvas
                }
                updateAdjacencyMatrix(adjacencyMatrix, edges);
                printAdjacencyMatrix(adjacencyMatrix);

                console.log(nodes);
                console.log(edges);
                break;

        }
        updateAdjacencyMatrix(adjacencyMatrix, edges)
        printAdjacencyMatrix(adjacencyMatrix);

    });

    function clearCanvas() {
        // Limpiar el canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Vaciar las listas
        nodes.splice(0, nodes.length); // Eliminar todos los nodos
        edges.splice(0, edges.length); // Eliminar todas las aristas

        nodeCount = 0;
        edgeCount = 0;

        adjacencyMatrix = initializeAdjacencyMatrix(nodeCount);
        updateAdjacencyMatrix(adjacencyMatrix, edges);

        console.log(nodes);
        console.log(edges);
    }

    document.getElementById("limpiar-canvas").addEventListener("click", function () {
        clearCanvas();
    });

    // Definir una función para recibir los argumentos desde C# y realizar la lógica correspondiente
    
    function Recorridos(nodoInicio, nodoFin, algoritmo, matrizAdyacencia, nodos) {
        updateAdjacencyMatrix(adjacencyMatrix, edges);
        if (adjacencyMatrix != null ) {

            const numVertices = matrizAdyacencia.length;

            if (nodoInicio === "" || nodoFin === "" || algoritmo === "- Seleccione una opción -" || matrizAdyacencia.length === 0 || nodos.length === 0) {
                cuadroDialogo = "Argumentos no válidos.";
            } else if (parseInt(nodoInicio) > numVertices || parseInt(nodoFin) > numVertices || parseInt(nodoInicio) < 1 || parseInt(nodoFin) < 1) {
                cuadroDialogo = "Nodo de inicio o fin no válido.";
            } else {
                console.log("Nodo inicio: " + nodoInicio);
                console.log("Nodo fin: " + nodoFin);
                console.log("Algoritmo: " + algoritmo);
                console.log("Matriz de adyacencia:");
                console.log(matrizAdyacencia);
                console.log("Nodos:");
                console.log(nodos);

                cuadroDialogo = "Argumentos válidos: Revisa la tabla de resultados.";
                // Obtener el algoritmo seleccionado desde la variable algoritmo
                switch (algoritmo) {
                    case "BFS":
                        // Llamar al método correspondiente para el algoritmo BFS
                        const recorridoBFS = BFS(matrizAdyacencia, nodoInicio);
                        console.log("Recorrido BFS:", recorridoBFS);
                        dotNetReference.invokeMethodAsync("setCosto", "No Aplica");
                        dotNetReference.invokeMethodAsync("setRecorrido", recorridoBFS.toString());
                        dotNetReference.invokeMethodAsync("setNodoFin", recorridoBFS[recorridoBFS.length - 1].toString());
                        botonRTabla.disabled = false;
                        break;

                    case "DFS":
                        // Llamar al método correspondiente para el algoritmo DFS
                        const recorridoDFS = DFS(matrizAdyacencia, nodoInicio);
                        console.log("Recorrido DFS:", recorridoDFS);
                        dotNetReference.invokeMethodAsync("setCosto", "No Aplica");
                        dotNetReference.invokeMethodAsync("setRecorrido", recorridoDFS.toString());
                        dotNetReference.invokeMethodAsync("setNodoFin", recorridoDFS[recorridoDFS.length - 1].toString());
                        botonRTabla.disabled = false;
                        break;

                    case "Prim":
                        const arbolExpMinimo = Prim(matrizAdyacencia);
                        arbolExpansion = arbolExpMinimo.map(nodo => ({ from: nodo.from, to: nodo.to }));
                        console.log("Árbol de expansión mínimo:", arbolExpMinimo);
                        modo = 3;
                        botonRTabla.disabled = true;
                        break;

                    case "Kruskal":
                        const arbolExpMinimoK = Kruskal(nodoInicio, matrizAdyacencia);
                        console.log("Árbol de expansión mínima (Kruskal):", arbolExpMinimoK);
                        botonRTabla.disabled = true;
                        break;

                    case "Dijkstra":
                        const shortestPath = dijkstra(matrizAdyacencia, nodoInicio, nodoFin);
                        camino = shortestPath.path;
                        console.log("El camino más corto desde el nodo", nodoInicio, "al nodo", nodoFin, "es:", shortestPath);

                        dotNetReference.invokeMethodAsync("setCosto", shortestPath.totalDistance.toString());
                        dotNetReference.invokeMethodAsync("setRecorrido", shortestPath.path.toString());
                        modo = 5;
                        botonRTabla.disabled = false;
                        break;

                    case "Bellman-Ford":
                        const resultadoBellmanFord = BellmanFord(nodoInicio, matrizAdyacencia);
                        if (resultadoBellmanFord.cicloNegativo) {
                            console.log("El grafo contiene un ciclo negativo.");
                        } else {
                            console.log("Distancias mínimas:", resultadoBellmanFord.distancias);
                            console.log("Padres de los nodos en el camino más corto:", resultadoBellmanFord.padres);
                        }
                        botonRTabla.disabled = true;
                        break;

                    case "Boruvka":
                        const resultado = Boruvka(matrizAdyacencia);
                        const arbolExpMinimoKa = Kruskal(nodoInicio, matrizAdyacencia);
                        console.log("Árbol de expansión mínima (borudka):", arbolExpMinimoKa);
                        botonRTabla.disabled = true;
                        break;

                    case "Reverse-Boruvka":
                        const arbolExpMinimoRB = ReverseBoruvka(matrizAdyacencia);

                        // Mostramos el árbol de expansión mínima resultante
                        console.log("Árbol de Expansión Mínima (Borůvka Reverso):", arbolExpMinimoRB);
                        botonRTabla.disabled = true;
                        break;

                    case "Algoritmo de coloreo":
                        // Llamar al algoritmo de coloreo de cuatro colores
                        coloresNodos = coloreoCuatroColores(matrizAdyacencia);

                        console.log("Colores asignados a los nodos:", coloresNodos);
                        modo = 9;
                        botonRTabla.disabled = true;
                        break;

                    case "Camino más corto":
                        const resultados = bellmanFord(matrizAdyacencia, nodoInicio);
                        if (typeof resultados === 'string') {
                            console.log(resultados); // El grafo contiene un ciclo de peso negativo
                        } else {
                            console.log("Distancias más cortas desde el nodo de inicio:", resultados);
                            // Utilizar los resultados según sea necesario en tu aplicación web
                        }
                        botonRTabla.disabled = true;
                        break;

                    default:
                        // Lógica para el caso en que no se haya seleccionado un algoritmo válido
                        botonRTabla.disabled = true;
                        break;
                }

                redrawCanvas();
            }
        } else {
            console.error("matrizAdyacencia no está definido o es una matriz vacía.");
        }
    }
    function BFS(matrizAdyacencia, nodoInicio) {
        const numVertices = matrizAdyacencia.length;
        const visitado = new Array(numVertices).fill(false); // Array para almacenar los nodos visitados
        const cola = []; // Cola para realizar el recorrido BFS
        const recorrido = []; // Array para almacenar el recorrido BFS

        // Marcar el nodo de inicio como visitado y agregarlo a la cola
        visitado[nodoInicio - 1] = true;
        cola.push(nodoInicio);

        // Mientras la cola no esté vacía
        while (cola.length !== 0) {
            // Sacar un nodo de la cola y agregarlo al recorrido
            const nodoActual = cola.shift();
            recorrido.push(nodoActual);

            // Obtener los nodos adyacentes al nodo actual
            for (let i = 0; i < numVertices; i++) {
                // Si el nodo adyacente no ha sido visitado y hay una arista entre el nodo actual y el nodo adyacente
                if (!visitado[i] && matrizAdyacencia[nodoActual - 1][i] !== 0) {
                    // Marcar el nodo adyacente como visitado y agregarlo a la cola
                    visitado[i] = true;
                    cola.push(i + 1);
                }
            }
        }

        return recorrido;
    }

    function DFS(matrizAdyacencia, nodoInicio) {
        const numVertices = matrizAdyacencia.length;
        const visitado = new Array(numVertices).fill(false); // Array para almacenar los nodos visitados
        const recorrido = []; // Array para almacenar el recorrido DFS

        // Función auxiliar para realizar el recorrido DFS recursivamente
        function DFSUtil(nodo) {
            // Marcar el nodo actual como visitado
            visitado[nodo - 1] = true;
            recorrido.push(nodo);

            // Recorrer los nodos adyacentes al nodo actual
            for (let i = 0; i < numVertices; i++) {
                if (!visitado[i] && matrizAdyacencia[nodo - 1][i] !== 0) {
                    // Llamar recursivamente a la función DFSUtil para los nodos adyacentes no visitados
                    DFSUtil(i + 1);
                }
            }
        }

        // Llamar a la función DFSUtil para realizar el recorrido DFS
        DFSUtil(nodoInicio);

        return recorrido;
    }
    function Prim(matrizAdyacencia) {
        const numVertices = matrizAdyacencia.length;
        const visitado = new Array(numVertices).fill(false); // Array para almacenar los nodos visitados
        const arbolExpMinimo = []; // Arreglo para almacenar las aristas del árbol de expansión mínimo
        const distancias = new Array(numVertices).fill(Number.MAX_VALUE); // Distancias mínimas a cada nodo
        const padres = new Array(numVertices).fill(-1); // Padre de cada nodo en el árbol de expansión mínimo

        // Establecer la distancia del nodo inicial como 0
        distancias[0] = 0;

        // Construir el árbol de expansión mínimo
        for (let i = 0; i < numVertices; i++) {
            // Encontrar el vértice con la distancia mínima desde el conjunto de nodos no incluidos en el árbol
            let u = -1;
            for (let v = 0; v < numVertices; v++) {
                if (!visitado[v] && (u === -1 || distancias[v] < distancias[u])) {
                    u = v;
                }
            }

            // Agregar la arista correspondiente al árbol de expansión mínimo
            if (u !== -1) {
                visitado[u] = true;
                if (padres[u] !== -1) {
                    arbolExpMinimo.push({ from: padres[u], to: u, peso: matrizAdyacencia[u][padres[u]] });
                }

                // Actualizar las distancias mínimas y los padres de los nodos adyacentes a 'u' no visitados
                for (let v = 0; v < numVertices; v++) {
                    if (!visitado[v] && matrizAdyacencia[u][v] !== 0 && matrizAdyacencia[u][v] < distancias[v]) {
                        distancias[v] = matrizAdyacencia[u][v];
                        padres[v] = u;
                    }
                }

            }
        }

        return arbolExpMinimo;
    }
    function coloreoCuatroColores(graph) {
        const numVertices = graph.length;
        const colores = new Array(numVertices).fill(-1); // Inicializar todos los nodos con color -1 (no coloreado)

        // Función para verificar si un color puede ser usado para un nodo dado
        function esColorSeguro(vertex, color) {
            for (let i = 0; i < numVertices; i++) {
                if (graph[vertex][i] && colores[i] === color) {
                    return false;
                }
            }
            return true;
        }

        // Asignar colores a los nodos
        for (let v = 0; v < numVertices; v++) {
            let color;
            for (color = 0; color < 4; color++) {
                if (esColorSeguro(v, color)) {
                    colores[v] = color;
                    break;
                }
            }
        }

        return colores;
    }

    function Kruskal(nodoInicio, matrizAdyacencia) {
        const numVertices = matrizAdyacencia.length;

        // Paso 1: Convertir la matriz de adyacencia en una lista de aristas
        const aristas = [];
        for (let i = 0; i < numVertices; i++) {
            for (let j = i + 1; j < numVertices; j++) {
                if (matrizAdyacencia[i][j] !== 0) {
                    aristas.push({ from: i, to: j, peso: matrizAdyacencia[i][j] });
                }
            }
        }

        // Paso 2: Ordenar la lista de aristas por peso
        aristas.sort((a, b) => a.peso - b.peso);

        // Paso 3: Crear una estructura para el conjunto disjunto
        const conjuntos = new Array(numVertices).fill().map((_, i) => i);

        // Función auxiliar para encontrar el conjunto al que pertenece un nodo
        function encontrar(conjuntos, nodo) {
            if (conjuntos[nodo] !== nodo) {
                conjuntos[nodo] = encontrar(conjuntos, conjuntos[nodo]);
            }
            return conjuntos[nodo];
        }

        // Función auxiliar para unir dos conjuntos
        function unir(conjuntos, a, b) {
            const raizA = encontrar(conjuntos, a);
            const raizB = encontrar(conjuntos, b);
            conjuntos[raizA] = raizB;
        }

        // Paso 4 y 5: Iterar sobre la lista de aristas y agregarlas al árbol de expansión mínima
        const arbolExpMinimo = [];
        let aristasAgregadas = 0;
        for (const arista of aristas) {
            if (aristasAgregadas === numVertices - 1) break; // Ya se han agregado suficientes aristas

            const conjuntoA = encontrar(conjuntos, arista.from);
            const conjuntoB = encontrar(conjuntos, arista.to);

            if (conjuntoA !== conjuntoB) {
                arbolExpMinimo.push(arista);
                unir(conjuntos, conjuntoA, conjuntoB);
                aristasAgregadas++;
            }
        }

        // Paso 6: Devolver el árbol de expansión mínima generado
        // Suma del peso de las aristas y obtener la lista de nodos
        let pesoTotal = 0;
        const nodosArbol = new Set();
        arbolExpMinimo.forEach(arista => {
            pesoTotal += arista.peso;
            nodosArbol.add(arista.from);
            nodosArbol.add(arista.to);
        });

        // Convertir el conjunto de nodos a una lista
        const listaNodosArbol = [...nodosArbol];

        return { pesoTotal, nodosArbol: listaNodosArbol };
    }
    function dijkstra(graph, startNode, endNode) {
        const INF = Number.MAX_SAFE_INTEGER;
        const n = graph.length;
        const distances = new Array(n).fill(INF);
        const visited = new Array(n).fill(false);
        const previous = new Array(n).fill(null);

        // Ajustar el nodo de inicio y fin para trabajar con índices basados en 0
        startNode = startNode - 1;
        endNode = endNode - 1;

        distances[startNode] = 0;

        for (let i = 0; i < n - 1; i++) {
            const minDistanceNode = minDistance(distances, visited);
            visited[minDistanceNode] = true;

            for (let j = 0; j < n; j++) {
                if (!visited[j] && graph[minDistanceNode][j] !== 0 && distances[minDistanceNode] !== INF && distances[minDistanceNode] + graph[minDistanceNode][j] < distances[j]) {
                    distances[j] = distances[minDistanceNode] + graph[minDistanceNode][j];
                    previous[j] = minDistanceNode;
                }
            }
        }

        const path = [];
        let currentNode = endNode;
        let totalDistance = 0;

        while (currentNode !== null) {
            path.unshift(currentNode + 1); // Ajustar el nodo de nuevo a 1 basado en índices
            const previousNode = previous[currentNode];
            if (previousNode !== null) {
                totalDistance += graph[currentNode][previousNode];
            }
            currentNode = previousNode;
        }

        return { path, totalDistance };
    }


    function minDistance(distances, visited) {
        let min = Number.MAX_SAFE_INTEGER;
        let minIndex = -1;

        for (let i = 0; i < distances.length; i++) {
            if (!visited[i] && distances[i] <= min) {
                min = distances[i];
                minIndex = i;
            }
        }

        return minIndex;
    }

    function BellmanFord(nodoInicio, matrizAdyacencia) {
        const numVertices = matrizAdyacencia.length;
        const distancias = new Array(numVertices).fill(Number.MAX_SAFE_INTEGER); // Distancias mínimas desde el nodo de inicio
        const padres = new Array(numVertices).fill(-1); // Padres de los nodos en el camino más corto

        // Establecer la distancia del nodo de inicio como 0
        distancias[nodoInicio] = 0;

        // Relajar todas las aristas repetidamente
        for (let i = 0; i < numVertices - 1; i++) {
            for (let u = 0; u < numVertices; u++) {
                for (let v = 0; v < numVertices; v++) {
                    if (matrizAdyacencia[u][v] !== 0) {
                        // Relaxation
                        if (distancias[u] !== Number.MAX_SAFE_INTEGER && distancias[u] + matrizAdyacencia[u][v] < distancias[v]) {
                            distancias[v] = distancias[u] + matrizAdyacencia[u][v];
                            padres[v] = u;
                        }
                    }
                }
            }
        }

        // Verificar si hay ciclos negativos
        for (let u = 0; u < numVertices; u++) {
            for (let v = 0; v < numVertices; v++) {
                if (matrizAdyacencia[u][v] !== 0 && distancias[u] !== Number.MAX_SAFE_INTEGER && distancias[u] + matrizAdyacencia[u][v] < distancias[v]) {
                    // Se ha encontrado un ciclo negativo
                    return { cicloNegativo: true };
                }
            }
        }

        // No hay ciclos negativos, devolver las distancias mínimas y los padres
        return { distancias: distancias, padres: padres };
    }
    function Boruvka(matrizAdyacencia) {
        const numVertices = matrizAdyacencia.length;
        const arbolExpMinimo = []; // Arreglo para almacenar las aristas del árbol de expansión mínimo
        let costoTotal = 0; // Inicializar el costo total del peso

        // Función auxiliar para encontrar el conjunto al que pertenece un nodo
        function encontrar(conjuntos, nodo) {
            if (conjuntos[nodo] !== nodo) {
                conjuntos[nodo] = encontrar(conjuntos, conjuntos[nodo]);
            }
            return conjuntos[nodo];
        }

        // Iterar hasta que todos los nodos estén en un solo conjunto
        while (arbolExpMinimo.length < numVertices - 1) {
            const conjuntos = new Array(numVertices).fill().map((_, i) => i); // Conjuntos iniciales, uno por cada vértice
            const aristasMasCortas = new Array(numVertices).fill({ peso: Infinity }); // Arreglo para almacenar las aristas más cortas hacia los conjuntos vecinos

            // Encontrar la arista más corta para cada conjunto
            for (let i = 0; i < numVertices; i++) {
                const conjunto = encontrar(conjuntos, i);
                for (let j = 0; j < numVertices; j++) {
                    if (conjuntos[j] !== conjunto && matrizAdyacencia[i][j] < aristasMasCortas[conjunto].peso) {
                        aristasMasCortas[conjunto] = { from: i, to: j, peso: matrizAdyacencia[i][j] };
                    }
                }
            }

            // Unir los conjuntos por las aristas más cortas encontradas
            for (const arista of aristasMasCortas) {
                const conjuntoA = encontrar(conjuntos, arista.from);
                const conjuntoB = encontrar(conjuntos, arista.to);
                if (conjuntoA !== conjuntoB) {
                    arbolExpMinimo.push(arista);
                    costoTotal += arista.peso;
                    conjuntos[conjuntoA] = conjuntoB;
                }
            }
        }

        return { arbolExpMinimo, costoTotal };
    }

    function ReverseBoruvka(matrizAdyacencia) {
        const numVertices = matrizAdyacencia.length;
        let arbolExpMinimo = []; // Arreglo para almacenar las aristas del árbol de expansión mínimo
        let costoTotal = 0; // Inicializar el costo total del peso

        // Crear un árbol completo inicial
        for (let i = 0; i < numVertices; i++) {
            for (let j = i + 1; j < numVertices; j++) {
                if (matrizAdyacencia[i][j] !== 0) { // Solo considerar aristas válidas
                    arbolExpMinimo.push({ from: i, to: j, peso: matrizAdyacencia[i][j] });
                    costoTotal += matrizAdyacencia[i][j];
                }
            }
        }

        // Ordenar las aristas por peso de manera descendente
        arbolExpMinimo.sort((a, b) => b.peso - a.peso);

        // Función auxiliar para encontrar el conjunto al que pertenece un nodo
        function encontrar(conjuntos, nodo) {
            if (conjuntos[nodo] !== nodo) {
                conjuntos[nodo] = encontrar(conjuntos, conjuntos[nodo]);
            }
            return conjuntos[nodo];
        }

        // Iterar hasta que solo quede un conjunto
        while (arbolExpMinimo.length > numVertices - 1) {
            const conjuntos = new Array(numVertices).fill().map((_, i) => i); // Conjuntos iniciales, uno por cada vértice
            let nuevasAristas = [];

            // Eliminar aristas de mayor peso que unen conjuntos diferentes
            for (const arista of arbolExpMinimo) {
                const conjuntoA = encontrar(conjuntos, arista.from);
                const conjuntoB = encontrar(conjuntos, arista.to);
                if (conjuntoA !== conjuntoB) {
                    conjuntos[conjuntoA] = conjuntoB;
                } else {
                    nuevasAristas.push(arista); // Conservar aristas que no se eliminaron
                }
            }

            // Actualizar la lista de aristas con las que no se eliminaron
            arbolExpMinimo = nuevasAristas;
        }

        return { arbolExpMinimo, costoTotal };
    }

    function bellmanFord(graph, startNode) {
        const numVertices = graph.length;
        const distances = new Array(numVertices).fill(Infinity);
        distances[startNode] = 0;

        // Relajación de aristas repetidas |V| - 1 veces
        for (let i = 0; i < numVertices - 1; i++) {
            for (let u = 0; u < numVertices; u++) {
                for (let v = 0; v < numVertices; v++) {
                    if (graph[u][v] !== 0 && distances[u] + graph[u][v] < distances[v]) {
                        distances[v] = distances[u] + graph[u][v];
                    }
                }
            }
        }

        // Detección de ciclos de peso negativo
        for (let u = 0; u < numVertices; u++) {
            for (let v = 0; v < numVertices; v++) {
                if (graph[u][v] !== 0 && distances[u] + graph[u][v] < distances[v]) {
                    // El grafo contiene un ciclo de peso negativo
                    return "El grafo contiene un ciclo de peso negativo";
                }
            }
        }

        // No hay ciclos de peso negativo, ajustar los índices y devolver distancias más cortas
        const adjustedDistances = distances.slice(1); // Recortar el primer elemento (índice 0)
        return adjustedDistances;
    }
};
