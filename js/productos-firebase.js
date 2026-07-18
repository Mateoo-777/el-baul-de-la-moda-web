import { db } from "./firebase.js";

import {
    collection,
    onSnapshot
} from
"https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


const productosLocales =
    Array.isArray(window.productosLocales)
        ? window.productosLocales
        : [];

let productosFirebase = [];


function prepararProductoFirebase(documento) {

    const datos = documento.data();

    let imagenes = [];

    // Formato nuevo del administrador:
    // imagen: "img/productos/foto.jpg"
    if (
        typeof datos.imagen === "string" &&
        datos.imagen.trim() !== ""
    ) {

        imagenes.push(datos.imagen.trim());

    }

    // Formato anterior:
    // imagenes: ["foto1.jpg", "foto2.jpg"]
    if (Array.isArray(datos.imagenes)) {

        const imagenesValidas =
            datos.imagenes.filter(imagen =>
                typeof imagen === "string" &&
                imagen.trim() !== ""
            );

        imagenes.push(...imagenesValidas);

    }

    // Evita imágenes repetidas
    imagenes = [...new Set(imagenes)];

    return {

        id: documento.id,

        nombre:
            datos.nombre ||
            "Producto sin nombre",

        categoria:
            datos.categoria || "",

        talle:
            datos.talle || "",

        precio:
            Number(datos.precio) || 0,

        precioAnterior:
            datos.precioAnterior === null ||
            datos.precioAnterior === undefined
                ? null
                : Number(datos.precioAnterior),

        stock:
            datos.stock === undefined
                ? null
                : Number(datos.stock),

        marca:
            datos.marca || "",

        color:
            datos.color || "",

        estado:
            datos.estado || "Normal",

        destacado:
            Boolean(datos.destacado),

        visible:
            datos.visible !== false,

        descripcion:
            datos.descripcion || "",

        // Conservamos ambos formatos para que funcione
        // con cualquier parte de tu tienda.
        imagen:
            imagenes[0] || "",

        imagenes

    };

}


function obtenerProductosCombinados() {

    const idsFirebase =
        new Set(
            productosFirebase.map(producto =>
                String(producto.id)
            )
        );

    const localesNoRepetidos =
        productosLocales.filter(producto =>
            !idsFirebase.has(String(producto.id))
        );

    return [
        ...localesNoRepetidos,
        ...productosFirebase
    ];

}


function aplicarFiltros(lista) {

    const parametros =
        new URLSearchParams(window.location.search);

    const categoria =
        parametros.get("categoria");

    const talle =
        parametros.get("talle");

    const busqueda =
        parametros.get("busqueda");

    let resultado = [...lista];


    if (categoria) {

        resultado =
            resultado.filter(producto =>
                producto.categoria
                    ?.toLowerCase() ===
                categoria.toLowerCase()
            );

    }


    if (talle) {

        resultado =
            resultado.filter(producto =>
                String(producto.talle)
                    .toLowerCase() ===
                talle.toLowerCase()
            );

    }


    if (busqueda) {

        const texto =
            busqueda.toLowerCase();

        resultado =
            resultado.filter(producto =>

                producto.nombre
                    ?.toLowerCase()
                    .includes(texto) ||

                producto.descripcion
                    ?.toLowerCase()
                    .includes(texto) ||

                producto.color
                    ?.toLowerCase()
                    .includes(texto)

            );

    }

    actualizarTitulo(categoria, talle);

    return resultado;

}


function actualizarTitulo(categoria, talle) {

    const titulo =
        document.getElementById("titulo");

    if (!titulo) return;


    if (categoria && talle) {

        titulo.textContent =
            `${capitalizar(categoria)} - Talle ${talle}`;

    } else if (categoria) {

        titulo.textContent =
            capitalizar(categoria);

    } else {

        titulo.textContent =
            "Todos los productos";

    }

}


function capitalizar(texto) {

    return texto.charAt(0).toUpperCase() +
        texto.slice(1);

}


function actualizarTienda() {

    const todos =
        obtenerProductosCombinados();

    window.todosLosProductos = todos;

    if (
        typeof window.mostrarProductos ===
        "function"
    ) {

        const filtrados =
            aplicarFiltros(todos);

        window.mostrarProductos(filtrados);

    }

    if (
        typeof window.mostrarDestacados ===
        "function"
    ) {

        window.mostrarDestacados(todos);

    }

}


onSnapshot(
    collection(db, "productos"),

    snapshot => {

        productosFirebase =
            snapshot.docs.map(
                prepararProductoFirebase
            );

        actualizarTienda();

    },

    error => {

        console.error(
            "Error al obtener productos de Firebase:",
            error
        );

        /* Aunque Firebase falle,
           seguimos mostrando los productos locales. */
        actualizarTienda();

    }
);