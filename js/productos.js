const productos = window.productosLocales = [
    {
        id: 1,
        nombre: "Vestido Animal Print",
        categoria: "vestidos",
        talle: "L",
        precio: 14000,
        imagenes: [
            "img/productos/animal print L (1).jpeg",
            "img/productos/animal print L (2).jpeg",
            "img/productos/animal print L (3).jpeg"
        ],
        destacado: true
    },
    {
        id: 2,
        nombre: "Jardinero Celeste",
        categoria: "vestidos",
        talle: "XL",
        precio: 23000,
        imagenes: [
            "img/productos/celeste XL (1).jpeg",
            "img/productos/celeste XL (2).jpeg"
        ],
        destacado: true
    },
    {
        id: 3,
        nombre: "Vestido Floreado",
        categoria: "vestidos",
        talle: "M",
        precio: 20000,
        imagenes: [
            "img/productos/floreado M (1).jpeg",
            "img/productos/floreado M (2).jpeg",
            "img/productos/floreado M (3).jpeg",
            "img/productos/floreado M (4).jpeg"
        ],
        destacado: true
    },
    {
        id: 4,
        nombre: "Vestido Rojo Sastrero",
        categoria: "vestidos",
        talle: "XL",
        precio: 22000,
        imagenes: [
            "img/productos/rojo XL (1).jpeg",
            "img/productos/rojo XL (2).jpeg",
            "img/productos/rojo XL (3).jpeg"
        ],
        destacado: true
    }
];

function mostrarProductos(lista) {
    const contenedor =
        document.getElementById("contenedor-productos");

    if (!contenedor) {
        console.error(
            'No existe un elemento con id="contenedor-productos"'
        );
        return;
    }

    contenedor.innerHTML = "";

    const productosVisibles = lista.filter(producto =>
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
            Array.isArray(producto.imagenes) &&
            producto.imagenes.length > 0
                ? producto.imagenes
                : [
                    producto.imagen ||
                    "img/productos/sin-imagen.jpg"
                ];

        const precio =
            Number(producto.precio) || 0;

        const precioAnterior =
            producto.precioAnterior !== null &&
            producto.precioAnterior !== undefined &&
            Number(producto.precioAnterior) > precio
                ? Number(producto.precioAnterior)
                : null;

        const sinStock =
            producto.stock !== null &&
            producto.stock !== undefined &&
            Number(producto.stock) <= 0;

        const tarjeta =
            document.createElement("article");

        tarjeta.className = "producto";

        tarjeta.innerHTML = `
            <div class="slider">
                <button
                    class="prev"
                    type="button"
                    aria-label="Imagen anterior"
                >
                    &#10094;
                </button>

                ${imagenes.map((imagen, indice) => `
                    <img
                        src="${imagen}"
                        alt="${producto.nombre}"
                        class="slide ${indice === 0 ? "activa" : ""}"
                        onerror="
                            this.onerror=null;
                            this.src='img/productos/sin-imagen.jpg';
                        "
                    >
                `).join("")}

                <button
                    class="next"
                    type="button"
                    aria-label="Imagen siguiente"
                >
                    &#10095;
                </button>
            </div>

            <div class="producto-info">
                <h3>${producto.nombre}</h3>

                ${
                    producto.talle
                        ? `<p>Talle: ${producto.talle}</p>`
                        : ""
                }

                ${
                    producto.marca
                        ? `<p>Marca: ${producto.marca}</p>`
                        : ""
                }

                <div class="precios">
                    ${
                        precioAnterior
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
                    ${sinStock
                        ? "Sin stock"
                        : "Agregar al carrito"}
                </button>
            </div>
        `;

        const botonAgregar =
            tarjeta.querySelector(".agregar-carrito");

        if (!sinStock) {
            botonAgregar.addEventListener("click", () => {
                if (
                    typeof window.agregarAlCarrito ===
                    "function"
                ) {
                    window.agregarAlCarrito(producto);
                } else {
                    console.error(
                        "No existe la función agregarAlCarrito"
                    );
                }
            });
        }

        prepararSlider(tarjeta);

        contenedor.appendChild(tarjeta);
    });
}

function prepararSlider(tarjeta) {
    const slides =
        tarjeta.querySelectorAll(".slide");

    const botonAnterior =
        tarjeta.querySelector(".prev");

    const botonSiguiente =
        tarjeta.querySelector(".next");

    if (slides.length <= 1) {
        botonAnterior.style.display = "none";
        botonSiguiente.style.display = "none";
        return;
    }

    let indiceActual = 0;

    function mostrarSlide(indice) {
        slides.forEach((slide, posicion) => {
            slide.classList.toggle(
                "activa",
                posicion === indice
            );
        });
    }

    botonAnterior.addEventListener("click", () => {
        indiceActual--;

        if (indiceActual < 0) {
            indiceActual = slides.length - 1;
        }

        mostrarSlide(indiceActual);
    });

    botonSiguiente.addEventListener("click", () => {
        indiceActual++;

        if (indiceActual >= slides.length) {
            indiceActual = 0;
        }

        mostrarSlide(indiceActual);
    });
}

window.mostrarProductos = mostrarProductos;