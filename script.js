// Configuración e inicialización de Supabase con tus credenciales
const SUPABASE_URL = 'https://jbecwhpkjefoqvkevtea.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_H8jz7_R7LKVSt2aAeoIjqQ_HXZCqiuI';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const usuariosRegistrados = {
    "17": {
        password: "WIN",
        nombre: "Edwin Hernández"
    },
    "2": {
        password: "0.2",
        nombre: "Usuario de Campo 2"
    }
};

const baseDatosCobertura = [
    {
        departamento: "san salvador",
        municipio: "ilopango",
        colonia: "jardines de selt-sut",
        nodo: "ILO8",
        categoria: "FOCALIZADA",
        tipoServicio: "Internet + TV Digital",
        promocion: "150MB + TV DIGITAL",
        precio: "$30.99",
        instalacion: "$10.00"
    },
    {
        departamento: "san salvador",
        municipio: "soyapango",
        colonia: "reparto san fernando",
        nodo: "S6",
        categoria: "CABLERA ORIENTE",
        tipoServicio: "Internet + TV Digital",
        promocion: "150MB + TV DIGITAL + PLAN MOVIL CORTESIA",
        precio: "$30.99",
        instalacion: "$10.00"
    },
    {
        departamento: "san salvador",
        municipio: "soyapango",
        colonia: "centro de soyapango",
        nodo: "S65",
        categoria: "CABLERA ORIENTE",
        tipoServicio: "Solo Internet",
        promocion: "150MB SOLO INTERNET",
        precio: "$25.99",
        instalacion: "$10.00"
    },
    {
        departamento: "san salvador",
        municipio: "nejapa",
        colonia: "Barrio concepcion",
        nodo: "NJ1",
        categoria: "REGULAR",
        tipoServicio: "Solo Internet",
        promocion: "100MB Fibra Óptica",
        precio: "$26.99",
        instalacion: "Gratis"
    },
    {
        departamento: "san salvador",
        municipio: "san salvador",
        colonia: "barrio concepcion",
        nodo: "CENE1",
        categoria: "DTH",
        tipoServicio: "Solo Cable",
        promocion: "TV satelital",
        precio: "$14.99",
        instalacion: "$20.00"
    },
    {
        departamento: "santa ana",
        municipio: "coatepeque",
        colonia: "colonia el milagro",
        nodo: "COA01-FDH04",
        categoria: "FTTH",
        tipoServicio: "Internet + TV Digital",
        promocion: "TV Avanzada Telemas",
        precio: "$19.99",
        instalacion: "$5.00"
    },
    {
        departamento: "la libertad",
        municipio: "la libertad",
        colonia: "tepeagua",
        nodo: "CELI1",
        categoria: "DTH",
        tipoServicio: "Solo Cable",
        promocion: "TV SATELITAL",
        precio: "$14.99",
        instalacion: "$20.00"
    },
    {
        departamento: "san salvador",
        municipio: "san marcos",
        colonia: "planes de renderos",
        nodo: "C47",
        categoria: "HFC",
        tipoServicio: "Internet + TV Digital",
        promocion: "TV SATELITAL",
        precio: "$14.99",
        instalacion: "$20.00"
    }
];

let resultadosGlobales = [];
let categoriaFiltroActiva = 'TODOS';
let servicioFiltroActivo = 'TODOS';
let usuarioActualId = null;
let promocionSeleccionadaTemporal = null;

function verificarLogin() {
    const usuarioVal = document.getElementById('userInput').value.trim();
    const passwordVal = document.getElementById('passInput').value.trim();
    const errorDiv = document.getElementById('loginError');

    errorDiv.textContent = "";

    if (!usuarioVal || !passwordVal) {
        errorDiv.textContent = "Por favor, complete ambos campos.";
        return;
    }

    if (usuariosRegistrados[usuarioVal] && usuariosRegistrados[usuarioVal].password === passwordVal) {
        usuarioActualId = usuarioVal;
        const usuarioActivo = usuariosRegistrados[usuarioVal];
        document.getElementById('nombreUsuarioDisplay').textContent = usuarioActivo.nombre;

        document.body.style.justifyContent = "flex-start";
        document.body.style.alignItems = "stretch";

        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');

        mostrarPantallaBusqueda();
        cargarHistorial();
    } else {
        errorDiv.textContent = "Credenciales incorrectas. Verifique su usuario y contraseña.";
    }
}

function cerrarSesion() {
    document.getElementById('userInput').value = "";
    document.getElementById('passInput').value = "";
    document.getElementById('loginError').textContent = "";
    usuarioActualId = null;
    
    document.body.style.justifyContent = "center";
    document.body.style.alignItems = "center";

    document.getElementById('appContainer').classList.add('hidden');
    document.getElementById('loginContainer').classList.remove('hidden');
    document.getElementById('resultadosContainer').innerHTML = "";
    document.getElementById('historialContainer').innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; margin: 0;">No hay búsquedas recientes registradas.</p>`;
    document.getElementById('userDropdownMenu').classList.remove('show');
    resultadosGlobales = [];
}

function toggleMenuDropdown() {
    const menu = document.getElementById('userDropdownMenu');
    menu.classList.toggle('show');
}

window.addEventListener('click', function(e) {
    if (!e.target.closest('.user-menu-container')) {
        const menu = document.getElementById('userDropdownMenu');
        if (menu) menu.classList.remove('show');
    }
});

function mostrarPantallaBusqueda() {
    document.getElementById('seccionBusqueda').classList.remove('hidden');
    document.getElementById('seccionClientes').classList.add('hidden');
    document.getElementById('userDropdownMenu').classList.remove('show');
}

function irAPantallaClientes() {
    document.getElementById('userDropdownMenu').classList.remove('show');
    document.getElementById('seccionBusqueda').classList.add('hidden');
    document.getElementById('seccionClientes').classList.remove('hidden');
    renderizarListaClientesAmplia();
}

function normalizarTexto(texto) {
    return texto
        ? texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
        : "";
}

function buscarNodosYPromociones() {
    const deptoInput = document.getElementById('departamentoInput').value;
    const muniInput = document.getElementById('municipioInput').value;
    const coloniaInput = document.getElementById('coloniaInput').value;

    if (!deptoInput.trim() || !muniInput.trim() || !coloniaInput.trim()) {
        alert('Por favor, complete todos los campos de ubicación (Departamento, Municipio y Colonia).');
        return;
    }

    guardarEnHistorial(deptoInput, muniInput, coloniaInput);

    const deptoBusqueda = normalizarTexto(deptoInput);
    const muniBusqueda = normalizarTexto(muniInput);
    const coloniaBusqueda = normalizarTexto(coloniaInput);

    resultadosGlobales = baseDatosCobertura.filter(item => {
        const itemDepto = normalizarTexto(item.departamento);
        const itemMuni = normalizarTexto(item.municipio);
        const itemColonia = normalizarTexto(item.colonia);

        return itemDepto.includes(deptoBusqueda) && 
               itemMuni.includes(muniBusqueda) && 
               itemColonia.includes(coloniaBusqueda);
    });

    categoriaFiltroActiva = 'TODOS';
    servicioFiltroActivo = 'TODOS';

    renderizarResultados();
}

function guardarEnHistorial(depto, muni, colonia) {
    if (!usuarioActualId) return;
    
    const claveStorage = `historial_tigo_${usuarioActualId}`;
    let historial = JSON.parse(localStorage.getItem(claveStorage)) || [];

    const nuevaBusqueda = {
        depto: depto.trim(),
        muni: muni.trim(),
        colonia: colonia.trim(),
        fecha: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (historial.length > 0 && 
        historial[0].depto.toLowerCase() === nuevaBusqueda.depto.toLowerCase() &&
        historial[0].muni.toLowerCase() === nuevaBusqueda.muni.toLowerCase() &&
        historial[0].colonia.toLowerCase() === nuevaBusqueda.colonia.toLowerCase()) {
        return;
    }

    historial.unshift(nuevaBusqueda);
    if (historial.length > 5) historial.pop();

    localStorage.setItem(claveStorage, JSON.stringify(historial));
    cargarHistorial();
}

function cargarHistorial() {
    if (!usuarioActualId) return;

    const claveStorage = `historial_tigo_${usuarioActualId}`;
    let historial = JSON.parse(localStorage.getItem(claveStorage)) || [];
    const container = document.getElementById('historialContainer');

    if (historial.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem; font-style: italic; margin: 0;">No hay búsquedas recientes registradas.</p>`;
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 6px;">';
    historial.forEach((item) => {
        html += `
            <div style="background: #FAFCFF; border: 1px solid var(--border); padding: 6px 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
                <div>
                    <strong>${item.colonia}</strong>, ${item.muni} (${item.depto})
                    <span style="font-size: 0.65rem; color: var(--text-muted); margin-left: 6px;">${item.fecha}</span>
                </div>
                <button onclick="repetirBusqueda('${item.depto}', '${item.muni}', '${item.colonia}')" style="background: var(--tigo-cyan); color: white; border: none; padding: 3px 8px; border-radius: 4px; cursor: pointer; font-size: 0.7rem; font-weight: 600;">Buscar</button>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

function repetirBusqueda(depto, muni, colonia) {
    document.getElementById('departamentoInput').value = depto;
    document.getElementById('municipioInput').value = muni;
    document.getElementById('coloniaInput').value = colonia;
    buscarNodosYPromociones();
}

function limpiarHistorial() {
    if (!usuarioActualId) return;
    localStorage.removeItem(`historial_tigo_${usuarioActualId}`);
    cargarHistorial();
}

function filtrarPorCategoria(cat) {
    categoriaFiltroActiva = cat;
    renderizarResultados();
}

function filtrarPorServicio(serv) {
    servicioFiltroActivo = serv;
    renderizarResultados();
}

function renderizarResultados() {
    const container = document.getElementById('resultadosContainer');
    container.innerHTML = '';

    if (resultadosGlobales.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align: center; margin-top: 16px;">
                <p style="color: var(--text-muted); font-style: italic; margin: 0;">No se encontraron registros de nodos o promociones para la ubicación ingresada.</p>
            </div>`;
        return;
    }

    const resultadosFiltrados = resultadosGlobales.filter(res => {
        const catUpper = res.categoria.toUpperCase();
        const servUpper = res.tipoServicio.toUpperCase();

        let cumpleCat = false;
        if (categoriaFiltroActiva === 'TODOS') {
            cumpleCat = true;
        } else if (categoriaFiltroActiva === 'FOCALIZADA') {
            cumpleCat = catUpper === 'FOCALIZADA' || catUpper.includes('FOCALIZADA');
        } else if (categoriaFiltroActiva === 'CABLERA_ORIENTE') {
            cumpleCat = catUpper === 'CABLERA ORIENTE' || (catUpper.includes('CABLERA ORIENTE') && !catUpper.includes('TELEMAS'));
        } else if (categoriaFiltroActiva === 'REGULAR') {
            cumpleCat = catUpper === 'REGULAR' || catUpper.includes('REGULAR');
        } else if (categoriaFiltroActiva === 'TELEMAS') {
            cumpleCat = catUpper.includes('TELEMAS');
        }

        let cumpleServ = false;
        if (servicioFiltroActivo === 'TODOS') {
            cumpleServ = true;
        } else if (servicioFiltroActivo === 'SOLO_INTERNET') {
            cumpleServ = servUpper.includes('SOLO INTERNET');
        } else if (servicioFiltroActivo === 'SOLO_CABLE') {
            cumpleServ = servUpper.includes('SOLO CABLE') || (servUpper.includes('CABLE') && !servUpper.includes('INTERNET') && !servUpper.includes('TV DIGITAL'));
        } else if (servicioFiltroActivo === 'INTERNET_TV') {
            cumpleServ = servUpper.includes('INTERNET + TV DIGITAL') || (servUpper.includes('INTERNET') && servUpper.includes('TV'));
        }

        return cumpleCat && cumpleServ;
    });

    let htmlFiltros = `
        <div style="margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">
            <div class="filter-section">
                <span class="filter-label">Filtrar por Categoría:</span>
                <div class="filter-buttons-group">
                    <button class="filter-btn ${categoriaFiltroActiva === 'TODOS' ? 'active' : ''}" style="background: ${categoriaFiltroActiva === 'TODOS' ? 'var(--tigo-blue)' : '#FAFCFF'}" onclick="filtrarPorCategoria('TODOS')">Todos</button>
                    <button class="filter-btn ${categoriaFiltroActiva === 'FOCALIZADA' ? 'active' : ''}" style="background: ${categoriaFiltroActiva === 'FOCALIZADA' ? 'var(--tag-focalizada)' : '#FAFCFF'}" onclick="filtrarPorCategoria('FOCALIZADA')">Focalizada</button>
                    <button class="filter-btn ${categoriaFiltroActiva === 'CABLERA_ORIENTE' ? 'active' : ''}" style="background: ${categoriaFiltroActiva === 'CABLERA_ORIENTE' ? 'var(--tag-cablera)' : '#FAFCFF'}" onclick="filtrarPorCategoria('CABLERA_ORIENTE')">Cablera Oriente</button>
                    <button class="filter-btn ${categoriaFiltroActiva === 'REGULAR' ? 'active' : ''}" style="background: ${categoriaFiltroActiva === 'REGULAR' ? 'var(--tag-regular)' : '#FAFCFF'}" onclick="filtrarPorCategoria('REGULAR')">Regular</button>
                    <button class="filter-btn ${categoriaFiltroActiva === 'TELEMAS' ? 'active' : ''}" style="background: ${categoriaFiltroActiva === 'TELEMAS' ? 'var(--tag-telemas)' : '#FAFCFF'}" onclick="filtrarPorCategoria('TELEMAS')">Cablera Oriente Telemas</button>
                </div>
            </div>

            <div class="filter-section" style="margin-bottom: 0;">
                <span class="filter-label">Filtrar por Tipo de Servicio:</span>
                <div class="filter-buttons-group">
                    <button class="filter-btn ${servicioFiltroActivo === 'TODOS' ? 'active' : ''}" style="background: ${servicioFiltroActivo === 'TODOS' ? 'var(--tigo-cyan)' : '#FAFCFF'}" onclick="filtrarPorServicio('TODOS')">Todos los Servicios</button>
                    <button class="filter-btn ${servicioFiltroActivo === 'SOLO_INTERNET' ? 'active' : ''}" style="background: ${servicioFiltroActivo === 'SOLO_INTERNET' ? 'var(--tigo-cyan)' : '#FAFCFF'}" onclick="filtrarPorServicio('SOLO_INTERNET')">Solo Internet</button>
                    <button class="filter-btn ${servicioFiltroActivo === 'SOLO_CABLE' ? 'active' : ''}" style="background: ${servicioFiltroActivo === 'SOLO_CABLE' ? 'var(--tigo-cyan)' : '#FAFCFF'}" onclick="filtrarPorServicio('SOLO_CABLE')">Solo Cable</button>
                    <button class="filter-btn ${servicioFiltroActivo === 'INTERNET_TV' ? 'active' : ''}" style="background: ${servicioFiltroActivo === 'INTERNET_TV' ? 'var(--tigo-cyan)' : '#FAFCFF'}" onclick="filtrarPorServicio('INTERNET_TV')">Internet + TV Digital</button>
                </div>
            </div>
        </div>
    `;

    let htmlResultadosCards = '';
    if (resultadosFiltrados.length === 0) {
        htmlResultadosCards = `<p style="text-align: center; color: var(--text-muted); font-style: italic; padding: 16px; grid-column: 1 / -1;">No hay resultados que coincidan con los filtros seleccionados.</p>`;
    } else {
        resultadosFiltrados.forEach((res, index) => {
            let catClass = 'cat-regular';
            const catUpper = res.categoria.toUpperCase();
            if (catUpper.includes('FOCALIZADA')) catClass = 'cat-focalizada';
            else if (catUpper.includes('TELEMAS')) catClass = 'cat-telemas';
            else if (catUpper.includes('CABLERA')) catClass = 'cat-cablera';

            htmlResultadosCards += `
                <div class="resultado-card">
                    <div>
                        <span class="badge-categoria ${catClass}">${res.categoria}</span>
                        <span class="badge-tipo">${res.tipoServicio}</span>
                        <h4>NODO: ${res.nodo}</h4>
                        <p><strong>Ubicación:</strong> ${res.colonia.toUpperCase()}, ${res.municipio.toUpperCase()}, ${res.departamento.toUpperCase()}</p>
                        <p><strong>Promoción:</strong> ${res.promocion}</p>
                        <div class="price-box">
                            <div class="price-item">
                                <span>Precio</span>
                                <strong>${res.precio}</strong>
                            </div>
                            <div class="price-item">
                                <span>Instalación</span>
                                <strong>${res.instalacion}</strong>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; margin-top: 8px;">
                        <button class="tigo-btn" style="flex: 1; padding: 8px; font-size: 0.85rem; background: #EBF3FF; color: var(--tigo-blue); box-shadow: none;" onclick="abrirDetallesPromo(${index})">Detalles</button>
                        <button class="tigo-btn" style="flex: 1; padding: 8px; font-size: 0.85rem;" onclick="abrirModalCliente(${index})">Elegir Promoción</button>
                    </div>
                </div>
            `;
        });
    }

    container.innerHTML = `
        <div class="card" style="text-align: left; margin-top: 20px;">
            <h3 class="results-header">Nodos y Promociones Encontradas (${resultadosFiltrados.length})</h3>
            ${htmlFiltros}
            <div class="results-grid">
                ${htmlResultadosCards}
            </div>
        </div>`;
}

function abrirDetallesPromo(index) {
    const promo = resultadosGlobales[index];
    if (!promo) return;

    const contenido = document.getElementById('detallesPromoContenido');
    contenido.innerHTML = `
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">Paquete</div>
        <h3 style="color: var(--tigo-blue); font-size: 1.5rem; margin: 0 0 4px 0; font-weight: 800;">${promo.promocion}</h3>
        <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-bottom: 16px;">${promo.precio} <span style="font-size: 0.85rem; font-weight: normal; color: var(--text-muted);">/ Mes</span></div>
        
        <div style="border-top: 1px solid var(--border); padding-top: 12px; margin-bottom: 12px;">
            <div style="font-weight: 700; color: var(--tigo-blue); margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                <span>Tipo de Servicio</span>
                <span>▲</span>
            </div>
            <p style="margin: 0; font-size: 0.9rem; color: var(--text-main);">✓ ${promo.tipoServicio}</p>
        </div>

        <div style="border-top: 1px solid var(--border); padding-top: 12px; margin-bottom: 12px;">
            <div style="font-weight: 700; color: var(--tigo-blue); margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                <span>Información de Cobertura y Nodo</span>
                <span>▲</span>
            </div>
            <p style="margin: 0 0 4px 0; font-size: 0.9rem;"><strong>Nodo:</strong> ${promo.nodo}</p>
            <p style="margin: 0 0 4px 0; font-size: 0.9rem;"><strong>Categoría:</strong> ${promo.categoria}</p>
            <p style="margin: 0; font-size: 0.9rem;"><strong>Ubicación:</strong> ${promo.colonia.toUpperCase()}, ${promo.municipio.toUpperCase()}, ${promo.departamento.toUpperCase()}</p>
        </div>

        <div style="border-top: 1px solid var(--border); padding-top: 12px; margin-bottom: 16px;">
            <div style="font-weight: 700; color: var(--tigo-blue); margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                <span>Costo de Instalación</span>
                <span>▲</span>
            </div>
            <p style="margin: 0; font-size: 0.9rem;">✓ Instalación: <strong>${promo.instalacion}</strong></p>
        </div>

        <div style="text-align: right; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px;">
            Vigencia: 30 días
        </div>

        <button class="tigo-btn" style="width: 100%; padding: 10px;" onclick="cerrarDetallesPromo(); abrirModalCliente(${resultadosGlobales.indexOf(promo)});">Elegir esta Promoción</button>
    `;

    document.getElementById('detallesPromoModal').classList.add('show');
}

function cerrarDetallesPromo() {
    document.getElementById('detallesPromoModal').classList.remove('show');
}

function abrirModalCliente(index) {
    promocionSeleccionadaTemporal = resultadosGlobales[index];
    document.getElementById('modalPromoInfo').textContent = `${promocionSeleccionadaTemporal.promocion} (${promocionSeleccionadaTemporal.precio}) - Nodo ${promocionSeleccionadaTemporal.nodo}`;
    document.getElementById('clienteNombre').value = '';
    document.getElementById('clienteApellido').value = '';
    document.getElementById('clienteCelular').value = '';
    document.getElementById('modalError').textContent = '';
    document.getElementById('clienteModal').classList.add('show');
}

function cerrarModalCliente() {
    document.getElementById('clienteModal').classList.remove('show');
    promocionSeleccionadaTemporal = null;
}

async function guardarClienteRegistrado() {
    if (!usuarioActualId || !promocionSeleccionadaTemporal) return;

    const nombre = document.getElementById('clienteNombre').value.trim();
    const apellido = document.getElementById('clienteApellido').value.trim();
    const celular = document.getElementById('clienteCelular').value.trim();
    const errorDiv = document.getElementById('modalError');

    errorDiv.textContent = '';

    const regexCelular = /^\d{8}$/;
    if (!regexCelular.test(celular)) {
        errorDiv.textContent = "El número de celular es obligatorio y debe tener exactamente 8 dígitos.";
        return;
    }

    const nuevoRegistro = {
        usuario_id: usuarioActualId,
        nombre: nombre || "Sin Nombre",
        apellido: apellido || "",
        celular: celular,
        promocion: promocionSeleccionadaTemporal.promocion,
        nodo: promocionSeleccionadaTemporal.nodo,
        precio: promocionSeleccionadaTemporal.precio,
        departamento: promocionSeleccionadaTemporal.departamento,
        municipio: promocionSeleccionadaTemporal.municipio,
        colonia: promocionSeleccionadaTemporal.colonia,
        fecha: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
        const { error } = await supabase
            .from('clientes_tigo')
            .insert([nuevoRegistro]);

        if (error) {
            console.warn('Aviso: Guardado remoto en Supabase omitido o pendiente de tabla:', error.message);
        }
    } catch (err) {
        console.warn('Conexión con Supabase no disponible temporalmente.');
    }

    const claveStorage = `clientes_tigo_${usuarioActualId}`;
    let listaClientes = JSON.parse(localStorage.getItem(claveStorage)) || [];
    listaClientes.unshift(nuevoRegistro);
    localStorage.setItem(claveStorage, JSON.stringify(listaClientes));

    cerrarModalCliente();
    alert('¡Promoción y datos del cliente guardados exitosamente!');
}

async function renderizarListaClientesAmplia() {
    if (!usuarioActualId) return;

    const container = document.getElementById('listaClientesAmpliaContainer');
    container.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-style: italic; padding: 20px; grid-column: 1 / -1;">Cargando registros...</p>`;

    let listaClientes = [];

    try {
        const { data, error } = await supabase
            .from('clientes_tigo')
            .select('*')
            .eq('usuario_id', usuarioActualId);

        if (!error && data && data.length > 0) {
            listaClientes = data;
        }
    } catch (err) {
        console.warn('Consulta remota no disponible');
    }

    if (listaClientes.length === 0) {
        const claveStorage = `clientes_tigo_${usuarioActualId}`;
        listaClientes = JSON.parse(localStorage.getItem(claveStorage)) || [];
    }

    if (listaClientes.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-style: italic; padding: 20px; grid-column: 1 / -1;">No hay clientes o promociones guardadas todavía.</p>`;
        return;
    }

    let html = '';
    listaClientes.forEach((cli, index) => {
        html += `
            <div class="resultado-card" style="text-align: left;">
                <span class="badge-categoria cat-focalizada">${cli.promocion}</span>
                <h4>${cli.nombre} ${cli.apellido}</h4>
                <p><strong>Celular:</strong> ${cli.celular}</p>
                <p><strong>Nodo:</strong> ${cli.nodo} (${cli.precio})</p>
                <p><strong>Ubicación:</strong> ${cli.colonia.toUpperCase()}, ${cli.municipio.toUpperCase()}</p>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 8px;">Guardado: ${cli.fecha}</p>
                <button class="logout-btn" style="margin-top: 10px; width: 100%; padding: 6px;" onclick="eliminarClienteRegistrado(${index}, '${cli.id || ''}')">Eliminar Registro</button>
            </div>
        `;
    });
    container.innerHTML = html;
}

async function eliminarClienteRegistrado(index, supabaseId) {
    if (!usuarioActualId) return;

    if (supabaseId && supabaseId !== 'undefined') {
        try {
            await supabase
                .from('clientes_tigo')
                .delete()
                .eq('id', supabaseId);
        } catch (err) {
            console.warn('No se pudo eliminar de Supabase');
        }
    }

    const claveStorage = `clientes_tigo_${usuarioActualId}`;
    let listaClientes = JSON.parse(localStorage.getItem(claveStorage)) || [];
    if (listaClientes[index]) {
        listaClientes.splice(index, 1);
        localStorage.setItem(claveStorage, JSON.stringify(listaClientes));
    }

    renderizarListaClientesAmplia();
}