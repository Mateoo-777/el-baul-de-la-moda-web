import { db, auth } from "../js/firebase.js";

import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";


const formulario =
    document.getElementById("formulario-producto");

const seccionFormulario =
    document.getElementById("seccion-formulario");

const listaProductos =
    document.getElementById("lista-productos");

const inputArchivo =
    document.getElementById("archivo-imagen");

const inputRutaImagen =
    document.getElementById("ruta-imagen");

const vistaPrevia =
    document.getElementById("vista-previa");

const textoVistaPrevia =
    document.getElementById("texto-vista-previa");

const nombreArchivo =
    document.getElementById("nombre-archivo");

const mensajeFormulario =
    document.getElementById("mensaje-formulario");

const tituloFormulario =
    document.getElementById("titulo-formulario");

const botonGuardar =
    document.getElementById("guardar-producto");

const buscador =
    document.getElementById("buscador-productos");

const modalEliminar =
    document.getElementById("modal-eliminar");


let productos = [];

let productoAEliminar = null;

let urlTemporalImagen = null;


/* =========================
   AUTENTICACIÓN
========================= */

onAuthStateChanged(auth, usuario => {

    if (!usuario) {

        window.location.href = "login.html";

    }

});


document
    .getElementById("cerrar-sesion")
    .addEventListener("click", async () => {

        try {

            await signOut(auth);

            window.location.href = "login.html";

        } catch (error) {

            console.error(
                "Error al cerrar sesión:",
                error
            );

        }

    });


/* =========================
   MOSTRAR FORMULARIO
========================= */

document
    .getElementById("boton-nuevo-producto")
    .addEventListener("click", () => {

        limpiarFormulario();

        tituloFormulario.textContent =
            "Nuevo producto";

        seccionFormulario.classList.remove(
            "oculto"
        );

        seccionFormulario.scrollIntoView({
            behavior: "smooth"
        });

    });


document
    .getElementById("cerrar-formulario")
    .addEventListener(
        "click",
        cerrarFormulario
    );


document
    .getElementById("cancelar-producto")
    .addEventListener(
        "click",
        cerrarFormulario
    );


function cerrarFormulario() {

    seccionFormulario.classList.add("oculto");

    limpiarFormulario();

}


/* =========================
   SELECCIONAR IMAGEN
========================= */

inputArchivo.addEventListener("change", evento => {

    const archivo = evento.target.files[0];

    if (!archivo) {
        return;
    }


    if (!archivo.type.startsWith("image/")) {

        mostrarMensaje(
            "Seleccioná un archivo de imagen válido.",
            "error"
        );

        inputArchivo.value = "";

        return;

    }


    const tamañoMaximo =
        8 * 1024 * 1024;

    if (archivo.size > tamañoMaximo) {

        mostrarMensaje(
            "La imagen no puede superar los 8 MB.",
            "error"
        );

        inputArchivo.value = "";

        return;

    }


    if (urlTemporalImagen) {

        URL.revokeObjectURL(
            urlTemporalImagen
        );

    }


    urlTemporalImagen =
        URL.createObjectURL(archivo);


    vistaPrevia.src =
        urlTemporalImagen;

    vistaPrevia.style.display =
        "block";

    textoVistaPrevia.style.display =
        "none";


    nombreArchivo.textContent =
        archivo.name;


    const nombreSeguro =
        convertirNombreSeguro(archivo.name);


    inputRutaImagen.value =
        `img/productos/${nombreSeguro}`;


    mostrarMensaje(
        `Ahora copiá "${archivo.name}" dentro de img/productos y renombrala como "${nombreSeguro}".`,
        "exito"
    );

});


function convertirNombreSeguro(nombre) {

    const partes =
        nombre.split(".");

    const extension =
        partes.pop().toLowerCase();

    const nombreSinExtension =
        partes.join(".");


    const nombreLimpio =
        nombreSinExtension
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");


    return `${nombreLimpio}.${extension}`;

}


/* =========================
   RUTA ESCRITA MANUALMENTE
========================= */

inputRutaImagen.addEventListener("input", () => {

    const ruta =
        inputRutaImagen.value.trim();

    if (!ruta) {

        ocultarVistaPrevia();

        return;

    }


    if (inputArchivo.files.length > 0) {
        return;
    }


    const rutaVistaPrevia =
        ruta.startsWith("http")
            ? ruta
            : `../${ruta}`;


    vistaPrevia.src =
        rutaVistaPrevia;

    vistaPrevia.style.display =
        "block";

    textoVistaPrevia.style.display =
        "none";

});


vistaPrevia.addEventListener("error", () => {

    if (inputArchivo.files.length > 0) {
        return;
    }

    ocultarVistaPrevia();

    textoVistaPrevia.textContent =
        "No se encontró la imagen en esa ruta.";

});


function ocultarVistaPrevia() {

    vistaPrevia.removeAttribute("src");

    vistaPrevia.style.display =
        "none";

    textoVistaPrevia.style.display =
        "block";

}


/* =========================
   GUARDAR PRODUCTO
========================= */

formulario.addEventListener(
    "submit",
    guardarProducto
);


async function guardarProducto(evento) {

    evento.preventDefault();


    const id =
        document
            .getElementById("producto-id")
            .value;


    const nombre =
        document
            .getElementById("nombre")
            .value
            .trim();

    const precio =
        Number(
            document
                .getElementById("precio")
                .value
        );

    const precioAnteriorTexto =
        document
            .getElementById("precio-anterior")
            .value;

    const precioAnterior =
        precioAnteriorTexto
            ? Number(precioAnteriorTexto)
            : null;

    const stock =
        Number(
            document
                .getElementById("stock")
                .value
        );

    const categoria =
        document
            .getElementById("categoria")
            .value;

    const talle =
        document
            .getElementById("talle")
            .value;

    const marca =
        document
            .getElementById("marca")
            .value
            .trim();

    const imagen =
        inputRutaImagen.value.trim();

    const descripcion =
        document
            .getElementById("descripcion")
            .value
            .trim();

    const destacado =
        document
            .getElementById("destacado")
            .checked;

    const visible =
        document
            .getElementById("visible")
            .checked;


    if (
        !nombre ||
        !categoria ||
        !imagen
    ) {

        mostrarMensaje(
            "Completá nombre, categoría e imagen.",
            "error"
        );

        return;

    }


    if (
        !Number.isFinite(precio) ||
        precio < 0
    ) {

        mostrarMensaje(
            "Ingresá un precio válido.",
            "error"
        );

        return;

    }


    if (
        !Number.isInteger(stock) ||
        stock < 0
    ) {

        mostrarMensaje(
            "El stock debe ser un número entero mayor o igual a cero.",
            "error"
        );

        return;

    }


    const datosProducto = {

        nombre,
        precio,
        precioAnterior,
        stock,
        categoria,
        talle,
        marca,
        imagen,
        descripcion,
        destacado,
        visible,
        actualizadoEn:
            serverTimestamp()

    };


    try {

        botonGuardar.disabled = true;

        botonGuardar.textContent =
            id
                ? "Guardando cambios..."
                : "Creando producto...";


        if (id) {

            await updateDoc(
                doc(db, "productos", id),
                datosProducto
            );

            mostrarMensaje(
                "Producto actualizado correctamente.",
                "exito"
            );

        } else {

            await addDoc(
                collection(db, "productos"),
                {
                    ...datosProducto,

                    creadoEn:
                        serverTimestamp()
                }
            );

            mostrarMensaje(
                "Producto creado correctamente.",
                "exito"
            );

        }


        setTimeout(() => {

            cerrarFormulario();

        }, 800);


    } catch (error) {

        console.error(
            "Error al guardar producto:",
            error
        );

        mostrarMensaje(
            "No se pudo guardar el producto.",
            "error"
        );

    } finally {

        botonGuardar.disabled = false;

        botonGuardar.textContent =
            "Guardar producto";

    }

}


/* =========================
   LEER PRODUCTOS
========================= */

onSnapshot(
    collection(db, "productos"),

    consulta => {

        productos =
            consulta.docs.map(documento => ({

                id: documento.id,

                ...documento.data()

            }));


        productos.sort((a, b) =>

            String(a.nombre || "")
                .localeCompare(
                    String(b.nombre || "")
                )

        );


        mostrarProductos(productos);

        actualizarEstadisticas();

    },

    error => {

        console.error(
            "Error al leer productos:",
            error
        );

        listaProductos.innerHTML = `
            <p class="sin-productos">
                No se pudieron cargar los productos.
            </p>
        `;

    }
);


/* =========================
   MOSTRAR PRODUCTOS
========================= */

function mostrarProductos(lista) {

    if (lista.length === 0) {

        listaProductos.innerHTML = `
            <p class="sin-productos">
                Todavía no hay productos.
            </p>
        `;

        return;

    }


    listaProductos.innerHTML =
        lista.map(producto => {

            const rutaImagen =
                obtenerRutaImagen(
                    producto.imagen
                );

            const precio =
                Number(
                    producto.precio || 0
                ).toLocaleString(
                    "es-AR"
                );

            return `
                <article class="producto-admin">

                    <img
                        src="${escaparHTML(rutaImagen)}"
                        alt="${escaparHTML(producto.nombre || "Producto")}"
                        onerror="this.src='../img/sin-imagen.png'"
                    >

                    <div class="producto-info">

                        <h3>
                            ${escaparHTML(producto.nombre || "Sin nombre")}
                        </h3>

                        <p>
                            $${precio}
                            · Stock:
                            ${Number(producto.stock || 0)}
                        </p>

                        <p>
                            ${escaparHTML(producto.categoria || "Sin categoría")}
                            ${producto.talle
                                ? ` · Talle ${escaparHTML(producto.talle)}`
                                : ""
                            }
                        </p>

                        <div class="etiquetas">

                            ${producto.destacado
                                ? `
                                    <span class="etiqueta etiqueta-destacado">
                                        Destacado
                                    </span>
                                `
                                : ""
                            }

                            ${producto.visible === false
                                ? `
                                    <span class="etiqueta etiqueta-oculto">
                                        Oculto
                                    </span>
                                `
                                : `
                                    <span class="etiqueta">
                                        Visible
                                    </span>
                                `
                            }

                        </div>

                    </div>

                    <div class="acciones-producto">

                        <button
                            class="boton-editar"
                            data-editar="${producto.id}"
                        >
                            ✏ Editar
                        </button>

                        <button
                            class="boton-eliminar"
                            data-eliminar="${producto.id}"
                        >
                            🗑 Eliminar
                        </button>

                    </div>

                </article>
            `;

        }).join("");


    document
        .querySelectorAll("[data-editar]")
        .forEach(boton => {

            boton.addEventListener(
                "click",
                () => editarProducto(
                    boton.dataset.editar
                )
            );

        });


    document
        .querySelectorAll("[data-eliminar]")
        .forEach(boton => {

            boton.addEventListener(
                "click",
                () => abrirModalEliminar(
                    boton.dataset.eliminar
                )
            );

        });

}


function obtenerRutaImagen(ruta) {

    if (!ruta) {

        return "../img/sin-imagen.png";

    }

    if (
        ruta.startsWith("http://") ||
        ruta.startsWith("https://") ||
        ruta.startsWith("data:")
    ) {

        return ruta;

    }

    return `../${ruta}`;

}


/* =========================
   EDITAR
========================= */

function editarProducto(id) {

    const producto =
        productos.find(item =>
            item.id === id
        );

    if (!producto) {
        return;
    }


    limpiarFormulario();


    document
        .getElementById("producto-id")
        .value = producto.id;

    document
        .getElementById("nombre")
        .value = producto.nombre || "";

    document
        .getElementById("precio")
        .value = producto.precio ?? "";

    document
        .getElementById("precio-anterior")
        .value = producto.precioAnterior ?? "";

    document
        .getElementById("stock")
        .value = producto.stock ?? 0;

    document
        .getElementById("categoria")
        .value = producto.categoria || "";

    document
        .getElementById("talle")
        .value = producto.talle || "";

    document
        .getElementById("marca")
        .value = producto.marca || "";

    inputRutaImagen.value =
        producto.imagen || "";

    document
        .getElementById("descripcion")
        .value = producto.descripcion || "";

    document
        .getElementById("destacado")
        .checked = Boolean(
            producto.destacado
        );

    document
        .getElementById("visible")
        .checked =
            producto.visible !== false;


    if (producto.imagen) {

        vistaPrevia.src =
            obtenerRutaImagen(
                producto.imagen
            );

        vistaPrevia.style.display =
            "block";

        textoVistaPrevia.style.display =
            "none";

    }


    tituloFormulario.textContent =
        "Editar producto";

    seccionFormulario.classList.remove(
        "oculto"
    );

    seccionFormulario.scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================
   ELIMINAR
========================= */

function abrirModalEliminar(id) {

    productoAEliminar = id;

    modalEliminar.classList.remove(
        "oculto"
    );

}


document
    .getElementById("cancelar-eliminacion")
    .addEventListener("click", () => {

        productoAEliminar = null;

        modalEliminar.classList.add(
            "oculto"
        );

    });


document
    .getElementById("confirmar-eliminacion")
    .addEventListener("click", async () => {

        if (!productoAEliminar) {
            return;
        }


        try {

            await deleteDoc(
                doc(
                    db,
                    "productos",
                    productoAEliminar
                )
            );

            modalEliminar.classList.add(
                "oculto"
            );

            productoAEliminar = null;

        } catch (error) {

            console.error(
                "Error al eliminar producto:",
                error
            );

            alert(
                "No se pudo eliminar el producto."
            );

        }

    });


/* =========================
   BUSCADOR
========================= */

buscador.addEventListener("input", () => {

    const texto =
        buscador.value
            .trim()
            .toLowerCase();


    const filtrados =
        productos.filter(producto => {

            const contenido = `
                ${producto.nombre || ""}
                ${producto.categoria || ""}
                ${producto.talle || ""}
                ${producto.marca || ""}
            `.toLowerCase();

            return contenido.includes(texto);

        });


    mostrarProductos(filtrados);

});


/* =========================
   ESTADÍSTICAS
========================= */

function actualizarEstadisticas() {

    document
        .getElementById("total-productos")
        .textContent =
            productos.length;


    document
        .getElementById("productos-visibles")
        .textContent =
            productos.filter(
                producto =>
                    producto.visible !== false
            ).length;


    document
        .getElementById("productos-sin-stock")
        .textContent =
            productos.filter(
                producto =>
                    Number(producto.stock || 0) <= 0
            ).length;

}


/* =========================
   LIMPIAR
========================= */

function limpiarFormulario() {

    formulario.reset();

    document
        .getElementById("producto-id")
        .value = "";

    document
        .getElementById("stock")
        .value = 0;

    document
        .getElementById("visible")
        .checked = true;

    inputArchivo.value = "";

    nombreArchivo.textContent =
        "Ningún archivo seleccionado";

    mensajeFormulario.textContent = "";

    mensajeFormulario.className = "";

    tituloFormulario.textContent =
        "Nuevo producto";

    if (urlTemporalImagen) {

        URL.revokeObjectURL(
            urlTemporalImagen
        );

        urlTemporalImagen = null;

    }

    ocultarVistaPrevia();

}


function mostrarMensaje(texto, tipo) {

    mensajeFormulario.textContent = texto;

    mensajeFormulario.className =
        tipo === "exito"
            ? "mensaje-exito"
            : "mensaje-error";

}


function escaparHTML(valor) {

    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}