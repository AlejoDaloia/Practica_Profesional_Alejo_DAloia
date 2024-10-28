let recorridoId = null;

async function getRecorridos() {
    const res = await fetch("http://localhost:4000/recorrido");
    const data = await res.json();

    const tbody = document.querySelector('.route-table tbody');
    tbody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos

    data.forEach(recorrido => {
        const fecha = new Date(recorrido.ultima_actualizacion);
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const año = fecha.getFullYear();
        const fechaFormateada = `${dia}/${mes}/${año}`;

        const row = `
            <tr data-id="${recorrido.idRecorrido}">
                <td>${recorrido.dia}</td>
                <td>${recorrido.barrio_1}</td>
                <td>${recorrido.barrio_2}</td>
                <td>${recorrido.barrio_3}</td>
                <td>${fechaFormateada}</td>
                <td class="button-cell">
                    <button class="btn btn-primary mod-button" data-bs-toggle="modal" data-bs-target="#modalform">Modificar</button>
                    <button class="btn btn-danger delete-button">Eliminar</button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

document.querySelector('.route-table').addEventListener('click', (e) => {
    if (e.target.classList.contains('mod-button')) {
        const row = e.target.closest('tr');
        recorridoId = row.getAttribute('data-id');

        document.getElementById('dia').value = row.children[0].textContent;
        document.getElementById('barrio').value = row.children[1].textContent;
        document.getElementById('barrio_2').value = row.children[2].textContent;
        document.getElementById('barrio_3').value = row.children[3].textContent;
    }
});

// Guardar (agregar o modificar) un recorrido
document.querySelector('.save-button').addEventListener('click', async () => {
    const dia = document.getElementById('dia').value;
    const barrio_1 = document.getElementById('barrio').value;
    const barrio_2 = document.getElementById('barrio_2').value;
    const barrio_3 = document.getElementById('barrio_3').value;
    const ultima_actualizacion = new Date().toISOString().split('T')[0];


    const method = recorridoId ? "PUT" : "POST";
    const url = recorridoId ? `http://localhost:4000/recorrido/${recorridoId}` : "http://localhost:4000/recorrido";
    const response = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ dia, barrio_1, barrio_2, barrio_3, ultima_actualizacion }),
    });

    if (response.ok) {
        alert(recorridoId ? "Recorrido modificado con éxito" : "Recorrido agregado con éxito");
        document.querySelector('.close-button').click();
        getRecorridos();
        recorridoId = null; // Resetear el id después de la modificación
    } else {
        alert("Error al guardar el recorrido");
    }
});

// Eliminar un recorrido
document.querySelector('.route-table').addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-button')) {
        const row = e.target.closest('tr');
        const recorridoId = row.getAttribute('data-id');

        if (confirm("¿Estás seguro de eliminar este recorrido?")) {
            const response = await fetch(`http://localhost:4000/recorrido/${recorridoId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                alert("Recorrido eliminado con éxito");
                getRecorridos();
            } else {
                alert("Error al eliminar recorrido");
            }
        }
    }
});

// Cargar los recorridos al cargar la página
document.addEventListener('DOMContentLoaded', getRecorridos);