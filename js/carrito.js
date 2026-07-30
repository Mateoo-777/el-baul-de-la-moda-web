/* ===========================
   CONFIGURACIÓN DEL CARRITO
=========================== */

let carrito = obtenerCarritoGuardado();

window.carrito = carrito;


/* ===========================
   OBTENER CARRITO
=========================== */

function obtenerCarritoGuardado() {
    try {
        const carritoGuardado =
            JSON.parse(
                localStorage.getItem("carrito")
            );

        return Array.isArray(carritoGuardado)
            ? carritoGuardado
            : [];
    } catch (error) {
        console.error(
            "No se pudo leer el carrito:",
            error
        );

        return [];
    }
}


/* ===========================
   GUARDAR CARRITO
=========================== */

function guardarCarrito() {
    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );

    window.carrito = carrito;

    actualizarContador();
}


/* ===========================
   OBTENER IMAGEN
=========================== */

function obtenerImagenProducto(producto) {
    if (
        Array.isArray(producto.imagenes) &&
        producto.imagenes.length > 0
    ) {
        return producto.imagenes[0];
    }

    if (
        typeof producto.imagen === "string"
    ) {
        return producto.imagen;
    }

    return "";
}


/* ===========================
   AGREGAR PRODUCTO COMPLETO
=========================== */

window.agregarAlCarrito = function (producto) {
    if (!producto || producto.id === undefined) {
        alert("No se pudo agregar el producto.");

        return;
    }

    const stock =
        producto.stock === null ||
        producto.stock === undefined ||
        producto.stock === ""
            ? null
            : Number(producto.stock);

    if (
        stock !== null &&
        !Number.isNaN(stock) &&
        stock <= 0
    ) {
        alert("Este producto no tiene stock.");

        return;
    }

    const existente =
        carrito.find(item =>
            String(item.id) ===
            String(producto.id)
        );

    if (existente) {
        if (
            stock !== null &&
            !Number.isNaN(stock) &&
            existente.cantidad >= stock
        ) {
            alert(
                "No hay más unidades disponibles."
            );

            return;
        }

        existente.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            nombre:
                producto.nombre ||
                "Producto sin nombre",
            precio:
                Number(producto.precio) || 0,
            imagen:
                obtenerImagenProducto(producto),
            talle:
                producto.talle || "",
            stock: stock,
            cantidad: 1
        });
    }

    guardarCarrito();
    mostrarCarrito();

    alert("Producto agregado al carrito.");
};


/* ===========================
   AGREGAR PRODUCTO POR ID
=========================== */

window.agregarCarritoPorId = function (id) {
    const lista =
        window.todosLosProductos ||
        window.productosLocales ||
        [];

    const producto =
        lista.find(item =>
            String(item.id) === String(id)
        );

    if (!producto) {
        alert("No se encontró el producto.");

        return;
    }

    window.agregarAlCarrito(producto);
};


/* ===========================
   ACTUALIZAR CONTADOR
=========================== */

function actualizarContador() {
    const contador =
        document.getElementById(
            "contador-carrito"
        );

    if (!contador) {
        return;
    }

    const cantidad =
        carrito.reduce(
            (total, item) =>
                total +
                (Number(item.cantidad) || 0),
            0
        );

    contador.textContent = cantidad;
}

window.actualizarContador =
    actualizarContador;


/* ===========================
   FORMATEAR PRECIO
=========================== */

function formatearPrecio(valor) {
    return Number(valor || 0)
        .toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0
        });
}


/* ===========================
   EVITAR HTML PELIGROSO
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
   MOSTRAR CARRITO
=========================== */

function mostrarCarrito() {
    const lista =
        document.getElementById(
            "lista-carrito"
        );

    if (!lista) {
        return;
    }

    lista.innerHTML = "";

    if (carrito.length === 0) {
        lista.innerHTML = `
            <div class="carrito-vacio">
                <div class="icono-carrito-vacio">
                    🛍️
                </div>

                <h3>Tu carrito está vacío</h3>

                <p>
                    Todavía no agregaste productos.
                </p>

                <a
                    href="productos.html"
                    class="btn-ver-productos"
                >
                    Ver productos
                </a>
            </div>
        `;

        actualizarResumen();

        return;
    }

    carrito.forEach(item => {
        const producto =
            document.createElement("article");

        producto.className = "item-carrito";

        const imagen =
            typeof item.imagen === "string"
                ? item.imagen
                : "";

        const nombreSeguro =
            escaparTexto(item.nombre);

        const talleSeguro =
            escaparTexto(item.talle);

        const subtotal =
            Number(item.precio) *
            Number(item.cantidad);

        producto.innerHTML = `
            <div class="imagen-item-carrito">
                ${
                    imagen
                        ? `
                            <img
                                src="${imagen}"
                                alt="${nombreSeguro}"
                                loading="lazy"
                            >
                        `
                        : `
                            <div class="sin-imagen-carrito">
                                Sin imagen
                            </div>
                        `
                }
            </div>

            <div class="informacion-item">
                <h3>${nombreSeguro}</h3>

                ${
                    talleSeguro
                        ? `
                            <p class="talle-item">
                                Talle:
                                <strong>
                                    ${talleSeguro}
                                </strong>
                            </p>
                        `
                        : ""
                }

                <p class="precio-unitario">
                    ${formatearPrecio(item.precio)}
                    por unidad
                </p>

                <button
                    class="eliminar-item"
                    type="button"
                    data-id="${escaparTexto(item.id)}"
                >
                    Eliminar
                </button>
            </div>

            <div class="acciones-item">
                <div class="control-cantidad">
                    <button
                        class="disminuir-cantidad"
                        type="button"
                        data-id="${escaparTexto(item.id)}"
                        aria-label="Disminuir cantidad"
                    >
                        −
                    </button>

                    <span>
                        ${Number(item.cantidad) || 1}
                    </span>

                    <button
                        class="aumentar-cantidad"
                        type="button"
                        data-id="${escaparTexto(item.id)}"
                        aria-label="Aumentar cantidad"
                    >
                        +
                    </button>
                </div>

                <strong class="subtotal-item">
                    ${formatearPrecio(subtotal)}
                </strong>
            </div>
        `;

        lista.appendChild(producto);
    });

    prepararBotonesCarrito();
    prepararErroresImagen();
    actualizarResumen();
}

window.mostrarCarrito = mostrarCarrito;


/* ===========================
   BOTONES DEL CARRITO
=========================== */

function prepararBotonesCarrito() {
    document
        .querySelectorAll(
            ".aumentar-cantidad"
        )
        .forEach(boton => {
            boton.addEventListener(
                "click",
                () => {
                    aumentarCantidad(
                        boton.dataset.id
                    );
                }
            );
        });

    document
        .querySelectorAll(
            ".disminuir-cantidad"
        )
        .forEach(boton => {
            boton.addEventListener(
                "click",
                () => {
                    disminuirCantidad(
                        boton.dataset.id
                    );
                }
            );
        });

    document
        .querySelectorAll(".eliminar-item")
        .forEach(boton => {
            boton.addEventListener(
                "click",
                () => {
                    eliminarProducto(
                        boton.dataset.id
                    );
                }
            );
        });
}


/* ===========================
   ERROR DE IMAGEN
=========================== */

function prepararErroresImagen() {
    document
        .querySelectorAll(
            ".imagen-item-carrito img"
        )
        .forEach(imagen => {
            imagen.addEventListener(
                "error",
                () => {
                    imagen.parentElement
                        .innerHTML = `
                            <div class="sin-imagen-carrito">
                                Sin imagen
                            </div>
                        `;
                }
            );
        });
}


/* ===========================
   AUMENTAR CANTIDAD
=========================== */

function aumentarCantidad(id) {
    const producto =
        carrito.find(item =>
            String(item.id) === String(id)
        );

    if (!producto) {
        return;
    }

    const stock =
        producto.stock === null ||
        producto.stock === undefined ||
        producto.stock === ""
            ? null
            : Number(producto.stock);

    if (
        stock !== null &&
        !Number.isNaN(stock) &&
        producto.cantidad >= stock
    ) {
        alert(
            "No hay más unidades disponibles."
        );

        return;
    }

    producto.cantidad++;

    guardarCarrito();
    mostrarCarrito();
}


/* ===========================
   DISMINUIR CANTIDAD
=========================== */

function disminuirCantidad(id) {
    const producto =
        carrito.find(item =>
            String(item.id) === String(id)
        );

    if (!producto) {
        return;
    }

    if (producto.cantidad > 1) {
        producto.cantidad--;
    } else {
        carrito =
            carrito.filter(item =>
                String(item.id) !== String(id)
            );
    }

    guardarCarrito();
    mostrarCarrito();
}


/* ===========================
   ELIMINAR PRODUCTO
=========================== */

function eliminarProducto(id) {
    carrito =
        carrito.filter(item =>
            String(item.id) !== String(id)
        );

    guardarCarrito();
    mostrarCarrito();
}


/* ===========================
   ACTUALIZAR RESUMEN
=========================== */

function actualizarResumen() {
    const subtotalElemento =
        document.getElementById("subtotal");

    const totalElemento =
        document.getElementById("total");

    const cantidadElemento =
        document.getElementById(
            "cantidad-productos"
        );

    const botonFinalizar =
        document.getElementById(
            "ir-finalizar"
        );

    const botonConfirmar =
        document.getElementById(
            "confirmar-pedido"
        );

    const total =
        carrito.reduce(
            (suma, item) =>
                suma +
                Number(item.precio) *
                Number(item.cantidad),
            0
        );

    const cantidad =
        carrito.reduce(
            (suma, item) =>
                suma +
                Number(item.cantidad),
            0
        );

    if (subtotalElemento) {
        subtotalElemento.textContent =
            formatearPrecio(total);
    }

    if (totalElemento) {
        totalElemento.textContent =
            formatearPrecio(total);
    }

    if (cantidadElemento) {
        cantidadElemento.textContent =
            cantidad;
    }

    if (botonFinalizar) {
        botonFinalizar.disabled =
            carrito.length === 0;
    }

    if (botonConfirmar) {
        botonConfirmar.disabled =
            carrito.length === 0;
    }
}


/* ===========================
   VACIAR CARRITO
=========================== */

function vaciarCarrito() {
    if (carrito.length === 0) {
        return;
    }

    const confirmar =
        window.confirm(
            "¿Querés vaciar todo el carrito?"
        );

    if (!confirmar) {
        return;
    }

    carrito = [];

    guardarCarrito();
    mostrarCarrito();
}


/* ===========================
   INICIAR CARRITO
=========================== */

function iniciarCarrito() {
    actualizarContador();
    mostrarCarrito();

    const botonVaciar =
        document.getElementById("vaciar");

    if (botonVaciar) {
        botonVaciar.addEventListener(
            "click",
            vaciarCarrito
        );
    }

    const botonFinalizar =
        document.getElementById(
            "ir-finalizar"
        );

    if (botonFinalizar) {
        botonFinalizar.addEventListener(
            "click",
            () => {
                const formulario =
                    document.getElementById(
                        "seccion-finalizar"
                    );

                formulario?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        );
    }
}

if (
    document.readyState === "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        iniciarCarrito
    );
} else {
    iniciarCarrito();
}