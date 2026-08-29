// Inicializar el mapa centrado en El Salvador (San Salvador) con zoom 12
const map = L.map('map').setView([13.6929, -89.1922], 12);

// Agregar capa visual de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let listaNodos = [];
let marcadoresLayer = L.layerGroup().addTo(map);

// Función para cargar, parsear el archivo KML y desplegar los nodos en el mapa
async function cargarArchivoKML() {
    try {
        // IMPORTANTE: Asegúrate de que el nombre de tu archivo KML coincida exactamente aquí
        const respuesta = await fetch('nodos.kml'); 
        const texto = await respuesta.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(texto, "text/xml");
        
        const placemarks = xmlDoc.getElementsByTagName("Placemark");
        
        for (let p of placemarks) {
            const nombre = p.getElementsByTagName("name")[0]?.textContent || "Nodo sin nombre";
            const coordsText = p.getElementsByTagName("coordinates")[0]?.textContent.trim();
            
            let lat = null;
            let lon = null;

            if (coordsText) {
                // KML usa formato "longitud,latitud,altitud". Tomamos la primera coordenada.
                const primeraCoord = coordsText.split(/\s+/)[0];
                const partes = primeraCoord.split(',');
                if (partes.length >= 2) {
                    lon = parseFloat(partes[0]);
                    lat = parseFloat(partes[1]);
                }
            }

            if (lat && lon) {
                const nodoData = {
                    original: nombre,
                    lower: nombre.toLowerCase(),
                    lat: lat,
                    lon: lon
                };
                listaNodos.push(nodoData);

                // Crear marcador interactivo en el mapa para cada nodo
                const marker = L.marker([lat, lon]).bindPopup(`<b>${nombre}</b>`);
                marker.nodoRef = nodoData;
                
                marker.on('click', () => {
                    mostrarDetallesNodo(nodoData);
                });

                marcadoresLayer.addLayer(marker);
            }
        }
        console.log(`¡Éxito! Se cargaron y mapearon ${listaNodos.length} nodos.`);
    } catch (error) {
        console.error("Error al cargar el archivo KML:", error);
        document.getElementById('nodeInfo').innerHTML = `<p style="color: red;">No se pudo leer el archivo KML. Verifica que se llame 'nodos.kml' y esté en la misma carpeta.</p>`;
    }
}

// Ejecutar la carga al iniciar
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
            centrarMapaEnNodo(nodo);
        });
        resultsList.appendChild(li);
    });
});

// Centrar el mapa automáticamente al seleccionar un nodo
function centrarMapaEnNodo(nodo) {
    map.setView([nodo.lat, nodo.lon], 16); // Acerca el zoom a nivel de calle
    mostrarDetallesNodo(nodo);
    
    // Abrir la ventana emergente (popup) del marcador en el mapa
    marcadoresLayer.eachLayer(layer => {
        if (layer.nodoRef && layer.nodoRef.original === nodo.original) {
            layer.openPopup();
        }
    });
}

// Mostrar los datos en el panel lateral izquierdo
function mostrarDetallesNodo(nodo) {
    nodeInfo.innerHTML = `
        <h3>Información del Nodo</h3>
        <p><b>Zona/Nodo:</b> ${nodo.original}</p>
        <p><b>Latitud:</b> ${nodo.lat}</p>
        <p><b>Longitud:</b> ${nodo.lon}</p>
        <button onclick="navigator.clipboard.writeText('${nodo.original}'); alert('¡Nombre copiado al portapapeles!');" style="margin-top: 12px; padding: 8px 12px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Copiar Nombre</button>
    `;
}

// Cerrar lista flotante si se hace clic fuera del buscador
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
        resultsList.innerHTML = '';
    }
});