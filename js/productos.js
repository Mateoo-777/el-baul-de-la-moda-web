window.productosLocales = [];

/* ===========================
   PREPARAR RUTA DE IMAGEN
=========================== */

function prepararRutaImagen(ruta) {
    if (typeof ruta !== "string" || ruta.trim() === "") {
        return "";
    }

    return ruta.trim();
}

/* ===========================
   PROTEGER TEXTOS DEL HTML
=========================== */

function escaparTexto(texto) {
    return String(texto ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* ===========================
   OBTENER IMÁGENES
=========================== */

function obtenerImagenesProducto(producto) {
    let imagenes = [];

    if (Array.isArray(producto.imagenes)) {
        imagenes = producto.imagenes.filter(imagen =>
            typeof imagen === "string" &&
            imagen.trim() !== ""
        );
    }

    if (
        imagenes.length === 0 &&
        typeof producto.imagen === "string" &&
        producto.imagen.trim() !== ""
    ) {
        imagenes.push(producto.imagen);
    }

    return [...new Set(imagenes)];
}

/* ===========================
   MOSTRAR PRODUCTOS
=========================== */

function mostrarProductos(lista) {
    const contenedor =
        document.getElementById("contenedor-productos");

    if (!contenedor) {
        console.error(
            'No existe un elemento con id="contenedor-productos".'
        );
        return;
    }

    contenedor.innerHTML = "";

    if (!Array.isArray(lista)) {
        console.error("La lista de productos no es válida.");
        return;
    }

    const productosVisibles = lista.filter(producto =>
        producto &&
        producto.visible !== false
    );

    if (productosVisibles.length === 0) {
        contenedor.innerHTML = `
            <p class="sin-productos">
                No hay productos disponibles.
            </p>
        `;

        return;
    }

    productosVisibles.forEach(producto => {
        const imagenes =
            obtenerImagenesProducto(producto);

        const precio =
            Number(producto.precio) || 0;

        const precioAnteriorNumero =
            Number(producto.precioAnterior);

        const precioAnterior =
            producto.precioAnterior !== null &&
            producto.precioAnterior !== undefined &&
            !Number.isNaN(precioAnteriorNumero) &&
            precioAnteriorNumero > precio
                ? precioAnteriorNumero
                : null;

        const stock =
            producto.stock === null ||
            producto.stock === undefined ||
            producto.stock === ""
                ? null
                : Number(producto.stock);

        const sinStock =
            stock !== null &&
            !Number.isNaN(stock) &&
            stock <= 0;

        const nombreSeguro =
            escaparTexto(
                producto.nombre || "Producto sin nombre"
            );

        const talleSeguro =
            escaparTexto(producto.talle || "");

        const marcaSegura =
            escaparTexto(producto.marca || "");

        const tarjeta =
            document.createElement("article");

        tarjeta.className = "producto";

        const contenidoImagenes =
            imagenes.length > 0
                ? imagenes.map((imagen, indice) => `
                    <img
                        src="${prepararRutaImagen(imagen)}"
                        alt="${nombreSeguro}"
                        class="producto-slide"
                        loading="lazy"
                        style="display: ${
                            indice === 0
                                ? "block"
                                : "none"
                        };"
                    >
                `).join("")
                : `
                    <div class="producto-sin-imagen">
                        Imagen no disponible
                    </div>
                `;

        tarjeta.innerHTML = `
            <div class="slider">
                <button
                    class="prev"
                    type="button"
                    aria-label="Imagen anterior"
                >
                    &#10094;
                </button>

                ${contenidoImagenes}

                <button
                    class="next"
                    type="button"
                    aria-label="Imagen siguiente"
                >
                    &#10095;
                </button>
            </div>

            <div class="producto-info">
                <h3>${nombreSeguro}</h3>

                ${
                    talleSeguro
                        ? `<p>Talle: ${talleSeguro}</p>`
                        : ""
                }

                ${
                    marcaSegura
                        ? `<p>Marca: ${marcaSegura}</p>`
                        : ""
                }

                <div class="precios">
                    ${
                        precioAnterior !== null
                            ? `
                                <span class="precio-anterior">
                                    $${precioAnterior.toLocaleString("es-AR")}
                                </span>
                            `
                            : ""
                    }

                    <strong>
                        $${precio.toLocaleString("es-AR")}
                    </strong>
                </div>

                <button
                    class="agregar-carrito"
                    type="button"
                    ${sinStock ? "disabled" : ""}
                >
                    ${
                        sinStock
                            ? "Sin stock"
                            : "Agregar al carrito"
                    }
                </button>
            </div>
        `;

        const imagenesTarjeta =
            tarjeta.querySelectorAll(".producto-slide");

        imagenesTarjeta.forEach(imagen => {
            imagen.addEventListener("error", () => {
                console.error(
                    "No se pudo cargar la imagen:",
                    imagen.getAttribute("src")
                );

                imagen.style.display = "none";
            });
        });

        const botonAgregar =
            tarjeta.querySelector(".agregar-carrito");

        if (!sinStock && botonAgregar) {
            botonAgregar.addEventListener("click", () => {
                if (
                    typeof window.agregarAlCarrito ===
                    "function"
                ) {
                    window.agregarAlCarrito(producto);
                } else {
                    console.error(
                        "No existe la función agregarAlCarrito."
                    );
                }
            });
        }

        prepararSlider(tarjeta);

        contenedor.appendChild(tarjeta);
    });
}

/* ===========================
   SLIDER DE CADA PRODUCTO
=========================== */

function prepararSlider(tarjeta) {
    const slides =
        tarjeta.querySelectorAll(".producto-slide");

    const botonAnterior =
        tarjeta.querySelector(".prev");

    const botonSiguiente =
        tarjeta.querySelector(".next");

    if (slides.length === 0) {
        if (botonAnterior) {
            botonAnterior.style.display = "none";
        }

        if (botonSiguiente) {
            botonSiguiente.style.display = "none";
        }

        return;
    }

    let indiceActual = 0;

    function mostrarSlide(indice) {
        slides.forEach((slide, posicion) => {
            slide.style.display =
                posicion === indice
                    ? "block"
                    : "none";
        });
    }

    mostrarSlide(0);

    if (slides.length === 1) {
        if (botonAnterior) {
            botonAnterior.style.display = "none";
        }

        if (botonSiguiente) {
            botonSiguiente.style.display = "none";
        }

        return;
    }

    if (botonAnterior) {
        botonAnterior.addEventListener("click", () => {
            indiceActual--;

            if (indiceActual < 0) {
                indiceActual = slides.length - 1;
            }

            mostrarSlide(indiceActual);
        });
    }

    if (botonSiguiente) {
        botonSiguiente.addEventListener("click", () => {
            indiceActual++;

            if (indiceActual >= slides.length) {
                indiceActual = 0;
            }

            mostrarSlide(indiceActual);
        });
    }
}

window.mostrarProductos = mostrarProductos;