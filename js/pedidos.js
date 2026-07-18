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


    const pedido = {

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

    };


    try {

        botonConfirmar.disabled = true;

        botonConfirmar.textContent =
            "Guardando pedido...";


        const referenciaPedido =
            await addDoc(
                collection(db, "pedidos"),
                pedido
            );


        localStorage.removeItem("carrito");

        if (
            typeof window.actualizarContador ===
            "function"
        ) {

            window.actualizarContador();

        }


        mostrarMensaje(
            `Pedido enviado correctamente. Código: ${referenciaPedido.id.slice(0, 8).toUpperCase()}`,
            "exito"
        );


        limpiarFormulario();

        actualizarVistaCarrito();


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


function actualizarVistaCarrito() {

    const lista =
        document.getElementById("lista-carrito");

    const total =
        document.getElementById("total");

    if (lista) {

        lista.innerHTML = `
            <div class="carrito-vacio">
                <h3>Pedido enviado</h3>
                <p>Tu carrito ahora está vacío.</p>
            </div>
        `;

    }

    if (total) {

        total.textContent = "Total: $0";

    }

}