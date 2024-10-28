document.addEventListener("DOMContentLoaded", () => {
    getProductos();
    getInactiveProductos();
    // Botón para guardar o modificar un producto
    document.getElementById('guardarProducto').addEventListener('click', async () => {
        const nombre = document.getElementById('nombre').value;
        const cantidad = document.getElementById('cantidad').value;
        const precio = document.getElementById('precio').value;
        const idProducto = document.getElementById('guardarProducto').dataset.id;

        if (nombre && cantidad && precio) {
            const producto = {
                tipo_producto: nombre,
                cantidad: parseInt(cantidad),
                precio: parseFloat(precio)
            };

            if (idProducto) {
                // Si hay un idProducto, es una modificación
                await fetch(`http://localhost:4000/producto/${idProducto}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(producto)
                });
            } else {
                // Si no hay un idProducto, es un producto nuevo
                await fetch('http://localhost:4000/producto', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(producto)
                });
            }

            // Actualiza la tabla después de agregar o modificar
            getProductos();

            // Cierra el modal y limpia los campos
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalform'));
            modal.hide();
            limpiarFormulario();
        } else {
            alert('Por favor, completa todos los campos.');
        }
    });
});

// Obtener productos y mostrarlos en la tabla
async function getProductos() {
    const res = await fetch("http://localhost:4000/producto");
    const data = await res.json();
    
    const tbody = document.querySelector('.inventory-table tbody');
    tbody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos

    data.forEach(producto => {
        if (producto.estado === 'Activo') { // Mostrar solo productos activos
            const fecha = new Date(producto.ultima_actualizacion);
            const dia = String(fecha.getDate()).padStart(2, '0');
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const año = fecha.getFullYear();                        
            const fechaFormateada = `${dia}/${mes}/${año}`;

            const row = `
                <tr data-id="${producto.idProducto}">
                    <td>${producto.tipo_producto}</td>
                    <td>${producto.cantidad}</td>
                    <td>$${producto.precio.toFixed(2)}</td>
                    <td>${fechaFormateada}</td>
                    <td>${producto.estado}</td>
                    <td class="button-cell">
                        <button class="btn btn-primary btn-modificar" data-bs-toggle="modal" data-bs-target="#modalform">Modificar</button>
                        <button class="btn btn-danger btn-eliminar">Dar de Baja</button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        }
    });

    // Agregar eventos a los botones de "Modificar" y "Eliminar"
    document.querySelectorAll('.btn-modificar').forEach(button => {
        button.addEventListener('click', handleModificar);
    });
    document.querySelectorAll('.btn-eliminar').forEach(button => {
        button.addEventListener('click', handleEliminar);
    });
}

async function getInactiveProductos() {
    const res = await fetch("http://localhost:4000/producto/inactivos");
    const data = await res.json();
    
    const tbody = document.querySelector('.inactive-inventory-table tbody');
    tbody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos

    data.forEach(producto => {
        if(producto.estado === 'Inactivo') { // Mostrar solo productos inactivos
            const fecha = new Date(producto.ultima_actualizacion);
            const dia = String(fecha.getDate()).padStart(2, '0');
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const año = fecha.getFullYear();
            const fechaFormateada = `${dia}/${mes}/${año}`;

            const row = `
                <tr data-id="${producto.idProducto}">
                    <td>${producto.tipo_producto}</td>
                    <td>${producto.cantidad}</td>
                    <td>$${producto.precio.toFixed(2)}</td>
                    <td>${fechaFormateada}</td>
                    <td>${producto.estado}</td>
                    <td class="button-cell">
                        <button class="btn btn-success btn-activar">Activar</button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        }
    });

    // Agregar eventos a los botones de "Modificar" y "Eliminar"
    document.querySelectorAll('.btn-modificar').forEach(button => {
        button.addEventListener('click', handleModificar);
    });
    document.querySelectorAll('.btn-activar').forEach(button => {
        button.addEventListener('click', handleActivar);
    });
}

// Función para manejar la modificación de un producto
function handleModificar(event) {
    const row = event.target.closest('tr');
    const idProducto = row.getAttribute('data-id');
    const nombre = row.children[0].innerText;
    const cantidad = row.children[1].innerText;
    const precio = row.children[2].innerText.replace('$', '');

    // Rellenar los campos del modal con los datos del producto
    document.getElementById('nombre').value = nombre;
    document.getElementById('cantidad').value = cantidad;
    document.getElementById('precio').value = precio;

    // Guardar el ID del producto en el botón "Guardar"
    document.getElementById('guardarProducto').dataset.id = idProducto;

    // Cambiar el título del modal para reflejar que se está editando
    document.getElementById('modalformLabel').innerText = 'Modificar Producto';
}

// Función para limpiar el formulario
function limpiarFormulario() {
    document.getElementById('nombre').value = '';
    document.getElementById('cantidad').value = '';
    document.getElementById('precio').value = '';
    document.getElementById('guardarProducto').dataset.id = ''; // Limpiar el ID
    document.getElementById('modalformLabel').innerText = 'Registrar Producto'; // Restablecer el título
}

// Función para manejar la eliminación de un producto
async function handleEliminar(event) {
    const row = event.target.closest('tr');
    const idProducto = row.getAttribute('data-id'); // Obtener el ID del producto

    if (confirm('¿Estás seguro de que deseas dar de baja este producto?')) {
        await fetch(`http://localhost:4000/producto/baja/${idProducto}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: 'Inactivo' })
        });

        getProductos(); // Actualiza la lista de productos después de eliminar
        getInactiveProductos(); // Actualiza la lista de productos inactivos después de eliminar
    }
}

async function handleActivar(event) {
    const row = event.target.closest('tr');
    const idProducto = row.getAttribute('data-id'); // Obtener el ID del producto

    if (confirm('¿Estás seguro de que deseas activar este producto?')) {
        await fetch(`http://localhost:4000/producto/alta/${idProducto}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: 'Activo' })
        });

        getProductos(); // Actualiza la lista de productos después de activar
        getInactiveProductos(); // Actualiza la lista de productos inactivos después de activar
    }
}