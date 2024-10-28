document.addEventListener("DOMContentLoaded", () => {
    cargarClientes();
    cargarProductos();
    getPedidos();
    getPedidosEntregados();
    document.querySelector(".btn-guardar").addEventListener("click", guardarPedido);
});

async function cargarClientes() {
    const res = await fetch("http://localhost:4000/cliente");
    const data = await res.json();
    const select = document.getElementById("cliente");
    data.forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.idCliente;
        option.textContent = cliente.nombre;
        select.appendChild(option);
    });
}
async function cargarProductos() {
    const res = await fetch("http://localhost:4000/producto");
    const data = await res.json();
    const select = document.getElementById("producto");
    data.forEach(producto => {
        const option = document.createElement("option");
        option.value = producto.idProducto;
        option.textContent = producto.tipo_producto;
        select.appendChild(option);
    });
}

async function guardarPedido() {
    const clienteId = document.getElementById("cliente").value;
    const productoId = document.getElementById("producto").value;
    const cantidad = document.getElementById("cantidad").value;

    if (clienteId && productoId && cantidad) {
        const pedido = {
            cliente: clienteId,
            producto: productoId,
            cantidad: parseInt(cantidad)
        };

        await fetch("http://localhost:4000/pedido", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(pedido)
        });

        getPedidos();
        
        // Cerrar el modal
        const modalElement = document.getElementById("modalform");
        const modal = bootstrap.Modal.getInstance(modalElement);
        
        if (modal) {
            modal.hide();
        }

        // Resetear el formulario
        document.getElementById("pedidoForm").reset();
    } else {
        alert("Por favor, completa todos los campos.");
    }
}

async function getPedidos() {
    const res = await fetch("http://localhost:4000/pedido");
    const data = await res.json();
    
    const tbody = document.querySelector('.order-table tbody');
    tbody.innerHTML = '';

    data.forEach(pedido => {
        if (pedido.estado === 'En camino') { // Mostrar solo pedidos en camino
            const row = `
                <tr>
                    <td>${pedido.cliente}</td>
                    <td>${pedido.direccion}</td>
                    <td>${pedido.nombre_barrio}</td>
                    <td>${pedido.producto}</td>
                    <td>${pedido.cantidad}</td>
                    <td>${new Date(pedido.fecha).toLocaleDateString('es-ES')}</td>
                    <td>${pedido.estado}</td>
                    <td class="button-cell">
                        <button class="btn btn-success deliver-button" data-id="${pedido.idPedido}">Entregar</button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        }
    });

    document.querySelectorAll('.deliver-button').forEach(button => {
        button.addEventListener('click', handleEntregado);
    });
}

async function getPedidosEntregados() {
    const res = await fetch("http://localhost:4000/pedido/entregado");
    const data = await res.json();
    
    const tbody = document.querySelector('.inactive-order-table tbody');
    tbody.innerHTML = '';

    data.forEach(pedido => {
        if (pedido.estado === 'Entregado') { // Mostrar solo clientes activos
            const row = `
                <tr data-id="${pedido.idPedido}">
                    <td>${pedido.cliente}</td>
                    <td>${pedido.direccion}</td>
                    <td>${pedido.nombre_barrio}</td>
                    <td>${pedido.producto}</td>
                    <td>${pedido.cantidad}</td>
                    <td>${new Date(pedido.fecha).toLocaleDateString('es-ES')}</td>
                    <td>${pedido.estado}</td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        }
    });
}

async function handleEntregado(event) {
    const idPedido = event.target.getAttribute("data-id");

    if (confirm("¿Estás seguro de que deseas marcar este pedido como entregado?")) {
        try {
            const response = await fetch(`http://localhost:4000/pedido/${idPedido}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al marcar el pedido como entregado: ' + response.statusText);
            }
            
            getPedidos();
            getPedidosEntregados();
            alert('Pedido marcado como entregado exitosamente.');
        } catch (error) {
            console.error('Error al marcar el pedido como entregado:', error);
            alert('Error al marcar el pedido como entregado: ' + error.message);
        }
    }
}