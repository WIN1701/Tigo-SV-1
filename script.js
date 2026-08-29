let baseDatosCobertura = [];

// Cargar el archivo KML automáticamente cuando se abre la web
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('mapa.kml');
        const kmlText = await response.text();
        
        // Parsear el KML usando el navegador
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(kmlText, "text/xml");
        const placemarks = xmlDoc.getElementsByTagName("Placemark");

        baseDatosCobertura = Array.from(placemarks).map(pm => {
            const nombre = pm.getElementsByTagName("name")[0]?.textContent.trim() || "Sin nombre";
            const descripcion = pm.getElementsByTagName("description")[0]?.textContent.trim() || "";
            const coordenadas = pm.getElementsByTagName("coordinates")[0]?.textContent.trim() || "No disponibles";

            return {
                departamento: descripcion, // Ajusta esto según cómo tengas estructurado tu KML
                municipio: descripcion,
                colonia: nombre,
                nodo: nombre,
                categoria: "GENERAL",
                tipoServicio: "Internet / Cable",
                promocion: descripcion,
                precio: "Consultar",
                instalacion: "Consultar",
                coordenadas: coordenadas
            };
        });
        
        console.log("KML cargado correctamente con", baseDatosCobertura.length, "registros.");
    } catch (error) {
        console.error("Error al cargar el archivo mapa.kml:", error);
    }
});

// Función para normalizar texto (elimina acentos y pasa a minúsculas)
function normalizarTexto(texto) {
    return texto
        ? texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
        : "";
}

function buscarNodosYPromociones() {
    const deptoInput = document.getElementById('departamentoInput').value;
    const muniInput = document.getElementById('municipioInput').value;
    const coloniaInput = document.getElementById('coloniaInput').value;
    const container = document.getElementById('resultadosContainer');

    container.innerHTML = '';

    if (!deptoInput.trim() || !muniInput.trim() || !coloniaInput.trim()) {
        alert('Por favor, complete todos los campos de ubicación.');
        return;
    }

    const deptoBusqueda = normalizarTexto(deptoInput);
    const muniBusqueda = normalizarTexto(muniInput);
    const coloniaBusqueda = normalizarTexto(coloniaInput);

    // Búsqueda robusta que ignora mayúsculas, minúsculas y tildes
    const resultados = baseDatosCobertura.filter(item => {
        const contenidoTotal = normalizarTexto(`${item.departamento} ${item.municipio} ${item.colonia}`);
        return contenidoTotal.includes(deptoBusqueda) && 
               contenidoTotal.includes(muniBusqueda) && 
               contenidoTotal.includes(coloniaBusqueda);
    });

    if (resultados.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align: center;">
                <p class="status-msg" style="color: var(--text-muted);">No se encontraron registros para la ubicación ingresada.</p>
            </div>`;
        return;
    }

    let htmlResultados = '';
    resultados.forEach(res => {
        htmlResultados += `
            <div class="resultado-card">
                <h4>NODO: ${res.nodo}</h4>
                <p><strong>Descripción:</strong> ${res.promocion}</p>
                <p><strong>Coordenadas:</strong> ${res.coordenadas}</p>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="card" style="text-align: left;">
            <h3 class="results-header">Nodos Encontrados (${resultados.length})</h3>
            ${htmlResultados}
        </div>`;
}