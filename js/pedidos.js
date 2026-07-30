import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


const botonConfirmar =
    document.getElementById("confirmar-pedido");

const mensajePedido =
    document.getElementById("mensaje-pedido");


if (botonConfirmar) {
    botonConfirmar.addEventListener(
        "click",
        crearPedido
    );
}


async function crearPedido() {
    const nombre =
        document
            .getElementById("cliente-nombre")
            .value
            .trim();

    const telefono =
        document
            .getElementById("cliente-telefono")
            .value
            .trim();

    const email =
        document
            .getElementById("cliente-email")
            .value
            .trim();

    const direccion =
        document
            .getElementById("cliente-direccion")
            .value
            .trim();

    const notas =
        document
            .getElementById("cliente-notas")
            .value
            .trim();

    const carrito =
        JSON.parse(
            localStorage.getItem("carrito")
        ) || [];


    if (!nombre || !telefono || !direccion) {
        mostrarMensaje(
            "Completá nombre, WhatsApp y dirección.",
            "error"
        );

        return;
    }


    if (carrito.length === 0) {
        mostrarMensaje(
            "Tu carrito está vacío.",
            "error"
        );

        return;
    }


    const productosPedido =
        carrito.map(item => ({
            productoId: String(item.id),

            nombre: item.nombre,

            precio: Number(item.precio),

            talle: item.talle || "",

            imagen: item.imagen || "",

            cantidad: Number(item.cantidad),

            subtotal:
                Number(item.precio) *
                Number(item.cantidad)
        }));


    const total =
        productosPedido.reduce(
            (acumulado, producto) =>
                acumulado + producto.subtotal,
            0
        );


    try {
        botonConfirmar.disabled = true;

        botonConfirmar.textContent =
            "Procesando pedido...";


        /*
        Primero guardamos el pedido.
        Firebase genera un ID único.
        */

        const referenciaPedido =
            await addDoc(
                collection(db, "pedidos"),
                {
                    cliente: {
                        nombre,
                        telefono,
                        email,
                        direccion
                    },

                    notas,

                    productos: productosPedido,

                    total,

                    estado: "pendiente",

                    creadoEn: serverTimestamp(),

                    actualizadoEn: serverTimestamp()
                }
            );


        /*
        Convertimos el ID de Firebase
        en un código más corto.
        */

        const codigoPedido =
            referenciaPedido.id
                .slice(0, 8)
                .toUpperCase();


        /*
        Construimos el detalle de productos
        para WhatsApp.
        */

        const detalleProductos =
            productosPedido
                .map(producto => {
                    return [
                        `• ${producto.nombre}`,
                        `Talle: ${
                            producto.talle ||
                            "Sin especificar"
                        }`,
                        `Cantidad: ${producto.cantidad}`,
                        `Precio: $${producto.precio.toLocaleString("es-AR")}`,
                        `Subtotal: $${producto.subtotal.toLocaleString("es-AR")}`
                    ].join("\n");
                })
                .join("\n\n");


        const mensajeWhatsApp = `
Hola, quiero realizar un pedido en El Baúl de la Moda.

Código del pedido: ${codigoPedido}

PRODUCTOS

${detalleProductos}

TOTAL: $${total.toLocaleString("es-AR")}

DATOS DEL CLIENTE

Nombre: ${nombre}
WhatsApp: ${telefono}
Correo: ${email || "No informado"}
Dirección: ${direccion}
Notas: ${notas || "Sin notas"}
        `.trim();


        /*
        IMPORTANTE:
        Cambiá este número por el WhatsApp
        real del negocio.

        Formato:
        54 + 9 + código de área + número
        sin espacios, guiones ni signo +.
        */

        const numeroNegocio =
            "5493518112558";


        const enlaceWhatsApp =
            `https://wa.me/${numeroNegocio}?text=${
                encodeURIComponent(
                    mensajeWhatsApp
                )
            }`;


        /*
        Vaciamos el carrito después
        de guardar correctamente.
        */

        localStorage.setItem(
            "carrito",
            "[]"
        );

        if (Array.isArray(window.carrito)) {
            window.carrito.length = 0;
        }

        if (
            typeof window.actualizarContador ===
            "function"
        ) {
            window.actualizarContador();
        }

        if (
            typeof window.mostrarCarrito ===
            "function"
        ) {
            window.mostrarCarrito();
        }


        mostrarMensaje(
            `Pedido guardado. Código: ${codigoPedido}. Abriendo WhatsApp...`,
            "exito"
        );


        limpiarFormulario();


        /*
        Abrimos WhatsApp.
        */

        window.location.href =
            enlaceWhatsApp;

    } catch (error) {
        console.error(
            "Error al crear el pedido:",
            error
        );

        mostrarMensaje(
            "No se pudo enviar el pedido. Revisá la conexión e intentá nuevamente.",
            "error"
        );

    } finally {
        botonConfirmar.disabled = false;

        botonConfirmar.textContent =
            "Confirmar pedido";
    }
}


function mostrarMensaje(texto, tipo) {
    if (!mensajePedido) {
        return;
    }

    mensajePedido.textContent = texto;

    mensajePedido.className =
        tipo === "exito"
            ? "mensaje-exito"
            : "mensaje-error";
}


function limpiarFormulario() {
    document.getElementById(
        "cliente-nombre"
    ).value = "";

    document.getElementById(
        "cliente-telefono"
    ).value = "";

    document.getElementById(
        "cliente-email"
    ).value = "";

    document.getElementById(
        "cliente-direccion"
    ).value = "";

    document.getElementById(
        "cliente-notas"
    ).value = "";
}