// Clave de acceso requerida
const PASSWORD_CORRECTO = "1";

// Base de datos de nodos
const coberturaData = [
    {
        id: 1,
        departamento: "San Salvador",
        municipio: "Ilopango",
        urbanizacion: "Jardines de Selt-Sut",
        pasaje: "Pasaje 17",
        nodo: "ILO8",
        tipoPromocion: "Focalizada",
        velocidad: "150 Megas",
        incluye: "Internet Residencial + Cable TV",
        precio: "$30.99"
    },
    {
        id: 2,
        departamento: "San Miguel",
        municipio: "San Miguel",
        urbanizacion: "Colonia El Milagro",
        pasaje: "Calle Principal",
        nodo: "SMI2",
        tipoPromocion: "Cablera Oriente",
        velocidad: "200 Megas",
        incluye: "Internet + TV + Telefonía",
        precio: "$29.99"
    },
    {
        id: 3,
        departamento: "San Salvador",
        municipio: "Soyapango",
        urbanizacion: "Bosques del Río",
        pasaje: "Senda 4",
        nodo: "SOY3",
        tipoPromocion: "Focalizada",
        velocidad: "200 Megas",
        incluye: "Internet + TV",
        precio: "$34.99"
    },
    {
        id: 4,
        departamento: "La Libertad",
        municipio: "Santa Tecla",
        urbanizacion: "Merliot",
        pasaje: "Polígono B",
        nodo: "STC5",
        tipoPromocion: "Nacional",
        velocidad: "100 Megas",
        incluye: "Solo Internet Residencial",
        precio: "$25.99"
    }
];

const loginOverlay = document.getElementById('loginOverlay');
const appContent = document.getElementById('appContent');
const passwordInput = document.getElementById('passwordInput');
const errorMessage = document.getElementById('errorMessage');

const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');
const categoryButtons = document.querySelectorAll('.filter-btn');

let categoriaSeleccionada = 'todas';

// Función para validar la contraseña de acceso
function validarAcceso(event) {
    event.preventDefault();
    const passwordIngresado = passwordInput.value.trim();

    if (passwordIngresado === PASSWORD_CORRECTO) {
        // Ocultar pantalla de bienvenida y mostrar la aplicación
        loginOverlay.style.display = 'none';
        appContent.classList.remove('hidden');
        renderCards(coberturaData);
    } else {
        errorMessage.innerText = '❌ Contraseña incorrecta. Inténtalo de nuevo.';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// Renderizar tarjetas
function renderCards(lista) {
    resultsContainer.innerHTML = '';

    if (lista.length === 0) {
        resultsContainer.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color: #64748b;">⚠️ No se encontraron nodos u ofertas en esta categoría.</p>`;
        return;
    }

    lista.forEach(item => {
        const card = document.createElement('article');
        card.classList.add('card');

        const promoText = `*Oferta Tigo Residencial (${item.tipoPromocion})*\n📍 Ubicación: ${item.urbanizacion}, ${item.pasaje} (${item.municipio})\n📶 Nodo: ${item.nodo}\n🚀 Plan: ${item.velocidad} (${item.incluye})\n💵 Precio: ${item.precio}/mes`;

        card.innerHTML = `
            <div>
                <div class="card-header">
                    <span class="node-badge">Nodo: ${item.nodo}</span>
                    <span class="promo-tag">${item.tipoPromocion}</span>
                </div>
                
                <h3 class="card-title">${item.urbanizacion}</h3>
                <p class="card-address"><strong>${item.pasaje}</strong> — ${item.municipio}, ${item.departamento}</p>
                
                <div class="card-divider"></div>
                
                <div class="price-box">
                    <span class="price-amount">${item.precio}</span>
                    <span class="price-period">/ mes</span>
                </div>
                
                <p class="plan-details">
                    <strong>${item.velocidad}</strong> • ${item.incluye}
                </p>
            </div>

            <div class="card-actions">
                <button class="btn-copy" onclick="copiarOferta(\`${promoText.replace(/\n/g, '\\n')}\`, this)">
                    📋 Copiar
                </button>
                <button class="btn-whatsapp" onclick="enviarWhatsApp(\`${promoText.replace(/\n/g, '\\n')}\`)">
                    💬 WhatsApp
                </button>
            </div>
        `;

        resultsContainer.appendChild(card);
    });
}

// Filtrar por búsqueda y categorías
function filterData() {
    const query = searchInput.value.toLowerCase().trim();
    const terms = query.split(' ').filter(t => t.length > 0);

    const filtered = coberturaData.filter(item => {
        const matchCategory = (categoriaSeleccionada === 'todas') || (item.tipoPromocion.toLowerCase() === categoriaSeleccionada.toLowerCase());
        const fullString = `${item.nodo} ${item.urbanizacion} ${item.pasaje} ${item.municipio} ${item.departamento} ${item.velocidad} ${item.incluye} ${item.precio} ${item.tipoPromocion}`.toLowerCase();
        const matchText = terms.every(term => fullString.includes(term));

        return matchCategory && matchText;
    });

    renderCards(filtered);
}

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        categoriaSeleccionada = button.getAttribute('data-category');
        filterData();
    });
});

function copiarOferta(texto, boton) {
    navigator.clipboard.writeText(texto).then(() => {
        const textoOriginal = boton.innerHTML;
        boton.innerHTML = '✅ Copiado';
        boton.classList.add('copied');

        setTimeout(() => {
            boton.innerHTML = textoOriginal;
            boton.classList.remove('copied');
        }, 2000);
    });
}

function enviarWhatsApp(texto) {
    const textoCodificado = encodeURIComponent(texto);
    const url = `https://api.whatsapp.com/send?text=${textoCodificado}`;
    window.open(url, '_blank');
}

searchInput.addEventListener('input', filterData);