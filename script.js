let listaNodos = [];

// Función para leer el archivo KML y extraer los nodos automáticamente
async function cargarArchivoKML() {
    try {
        // Asegúrate de que tu archivo KML esté en la misma carpeta y se llame 'nodos.kml'
        const respuesta = await fetch('nodos.kml'); 
        const texto = await respuesta.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(texto, "text/xml");
        
        const placemarks = xmlDoc.getElementsByTagName("Placemark");
        
        for (let p of placemarks) {
            const nombre = p.getElementsByTagName("name")[0]?.textContent || "Nodo sin nombre";
            const coordsText = p.getElementsByTagName("coordinates")[0]?.textContent.trim();
            
            let lat = "N/D";
            let lon = "N/D";

            if (coordsText) {
                const primeraCoord = coordsText.split(/\s+/)[0];
                const partes = primeraCoord.split(',');
                if (partes.length >= 2) {
                    lon = partes[0];
                    lat = partes[1];
                }
            }

            listaNodos.push({
                original: nombre,
                lower: nombre.toLowerCase(),
                lat: lat,
                lon: lon
            });
        }
        console.log(`¡Éxito! Se cargaron ${listaNodos.length} nodos desde el archivo KML.`);
    } catch (error) {
        console.error("Error al leer el archivo KML:", error);
        document.getElementById('nodeInfo').innerHTML = `<p style="color: red;">No se pudo leer el archivo 'nodos.kml'. Verifica que esté guardado en la misma carpeta de tu proyecto.</p>`;
    }
}

// Cargar al iniciar la página
cargarArchivoKML();

// Elementos de la interfaz
const searchInput = document.getElementById('searchInput');
const resultsList = document.getElementById('resultsList');
const nodeInfo = document.getElementById('nodeInfo');

// Lógica de búsqueda en tiempo real
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    resultsList.innerHTML = '';

    if (query.length < 2) return;

    const filtrados = listaNodos.filter(nodo => nodo.lower.includes(query));

    filtrados.forEach(nodo => {
        const li = document.createElement('li');
        li.textContent = nodo.original;
        li.addEventListener('click', () => {
            searchInput.value = nodo.original;
            resultsList.innerHTML = '';
            mostrarDetallesNodo(nodo);
        });
        resultsList.appendChild(li);
    });
});

// Mostrar detalles del nodo seleccionado
function mostrarDetallesNodo(nodo) {
    nodeInfo.innerHTML = `
        <h3>Información del Nodo</h3>
        <p><b>Nombre:</b> ${nodo.original}</p>
        <p><b>Coordenadas:</b> ${nodo.lat}, ${nodo.lon}</p>
        <button onclick="navigator.clipboard.writeText('${nodo.original}'); alert('¡Nombre copiado al portapapeles!');" style="margin-top: 12px; width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem;">Copiar Nombre del Nodo</button>
    `;
}

// Ocultar lista de sugerencias si hace clic fuera del cuadro
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
        resultsList.innerHTML = '';
    }
});