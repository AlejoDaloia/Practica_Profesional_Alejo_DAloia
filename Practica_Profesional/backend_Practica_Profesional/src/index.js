const express = require("express");
const morgan = require("morgan");
const { connectDB } = require("./database");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.set("port", 4000);
app.use(cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:4000"]
}));    
app.use(morgan("dev"));
app.use(express.json());

    // Endpoint para login
app.post("/login", async (req, res) => {
    try {
        const { username, passwordd } = req.body;
        const connection = await connectDB();
    
        // Buscar el usuario en la base de datos
        const [user] = await connection.query("SELECT * FROM usuarios WHERE username = ?", [username]);
    
        console.log("Usuario encontrado:", user); // Para depuración
    
        if (user) {
            if (await bcrypt.compare(passwordd, user.passwordd)) {
                    res.status(200).send("Inicio de sesión exitoso.");
            } else {
                res.status(401).send("Usuario o contraseña incorrectos.");
            }
        } else {
            res.status(401).send("Usuario o contraseña incorrectos.");
        }
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).send('Error en el inicio de sesión.');
    }
});    

// Obtener todos los clientes
app.get("/cliente", async (req, res) => {
    try {
        const connection = await connectDB();
        const result = await connection.query(`
            SELECT cliente.*, 
                barrio.nombre AS nombre_barrio
            FROM cliente
            JOIN Barrio ON cliente.barrio = barrio.idBarrio
            WHERE cliente.estado = "Activo"
        `);
        res.json(result);
    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).send('Error en la consulta');
    }
});

app.get("/cliente/inactivos", async (req, res) => {
    try {
        const connection = await connectDB();
        const result = await connection.query(`
            SELECT cliente.*, 
                barrio.nombre AS nombre_barrio
            FROM cliente
            JOIN Barrio ON cliente.barrio = barrio.idBarrio
            WHERE cliente.estado = 'Inactivo'
        `);
        res.json(result);
    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).send('Error en la consulta');
    }
});

// Agregar un nuevo cliente
app.post("/cliente", async (req, res) => {
    const { nombre, contacto, direccion, barrio } = req.body;
    try {
        const connection = await connectDB();
        await connection.query(
            "INSERT INTO cliente (nombre, contacto, direccion, barrio) VALUES (?, ?, ?, ?)",
            [nombre, contacto, direccion, barrio]
        );
        res.status(201).send("Cliente agregado");
    } catch (error) {
        console.error('Error al agregar cliente:', error);
        res.status(500).send('Error al agregar cliente');
    }
});

// Modificar un cliente existente
app.put("/cliente/:idCliente", async (req, res) => {
    const { idCliente } = req.params;
    const { nombre, contacto, direccion, barrio } = req.body;
    console.log(`Modificando cliente ID: ${idCliente}`, req.body);
    try {
        const connection = await connectDB();
        await connection.query(
            "UPDATE cliente SET nombre = ?, contacto = ?, direccion = ?, barrio = ? WHERE idCliente = ?",
            [nombre, contacto, direccion, barrio, idCliente]
        );
        res.send("Cliente modificado");
    } catch (error) {
        console.error('Error al modificar cliente:', error);
        res.status(500).send('Error al modificar cliente');
    }
});

// Cambiar el estado del cliente a inactivo
app.put("/cliente/baja/:idCliente", async (req, res) => {
    const { idCliente } = req.params;
    try {
        const connection = await connectDB();
        await connection.query(
            "UPDATE cliente SET estado = 'Inactivo' WHERE idCliente = ?",
            [idCliente]
        );
        res.send("Cliente dado de baja");
    } catch (error) {
        console.error('Error al dar de baja al cliente:', error);
        res.status(500).send('Error al dar de baja al cliente');
    }
});

app.put("/cliente/alta/:idCliente", async (req, res) => {
    const { idCliente } = req.params;
    try {
        const connection = await connectDB();
        await connection.query(
            "UPDATE cliente SET estado = 'Activo' WHERE idCliente = ?",
            [idCliente]
        );
        res.send("Cliente dado de Alta");
    } catch (error) {
        console.error('Error al dar de Alta al cliente:', error);
        res.status(500).send('Error al dar de Alta al cliente');
    }
});

app.get("/barrio", async (req, res) => {
    try {
        const connection = await connectDB(); // Obtiene la conexión desde connectDB
        const result = await connection.query(`SELECT * FROM barrio`);
        res.json(result); // Retorna los resultados
    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).send('Error en la consulta');
    }
});

app.get("/recorrido", async (req, res) => {
    try {
        const connection = await connectDB(); // Obtiene la conexión desde connectDB
        const result = await connection.query(`SELECT * FROM recorrido`);
        res.json(result); // Retorna los resultados
    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).send('Error en la consulta');
    }
});

app.post("/recorrido", async (req, res) => {
    const { dia, barrio_1, barrio_2, barrio_3, ultima_actualizacion } = req.body;
    try {
        const connection = await connectDB();
        await connection.query(
            "INSERT INTO recorrido (dia, barrio_1, barrio_2, barrio_3, ultima_actualizacion) VALUES (?, ?, ?, ?, ?)",
            [dia, barrio_1, barrio_2, barrio_3, ultima_actualizacion]
        );
        res.status(201).send("Recorrido agregado");
    } catch (error) {
        console.error('Error al agregar Recorrido:', error);
        res.status(500).send('Error al agregar Recorrido');
    }
});

app.put("/recorrido/:idRecorrido", async (req, res) => {
    const { idRecorrido } = req.params;
    const { dia, barrio_1, barrio_2, barrio_3, ultima_actualizacion } = req.body;

    console.log(`Modificando Recorrido ID: ${idRecorrido}`, req.body);

    try {
        const connection = await connectDB();
        await connection.query(
            "UPDATE recorrido SET dia = ?, barrio_1 = ?, barrio_2 = ?, barrio_3 = ?, ultima_actualizacion = ? WHERE idRecorrido = ?",
            [dia, barrio_1, barrio_2, barrio_3, ultima_actualizacion, idRecorrido]
        );
        res.send("Recorrido modificado");
    } catch (error) {
        console.error('Error al modificar recorrido:', error);
        res.status(500).send('Error al modificar recorrido');
    }
});

app.delete("/recorrido/:idRecorrido", async (req, res) => {
    const { idRecorrido } = req.params;
    try {
        const connection = await connectDB();
        await connection.query("DELETE FROM recorrido WHERE idRecorrido = ?", [idRecorrido]);
        res.send("Recorrido eliminado");
    } catch (error) {
        console.error('Error al eliminar recorrido:', error);
        res.status(500).send('Error al eliminar recorrido');
    }
});

app.get("/pedido", async (req, res) => {
    try {
        const connection = await connectDB();

        // Consulta para obtener los pedidos junto con la información relacionada
        const pedidos = await connection.query(`
            SELECT pedido.*, 
                cliente.nombre AS cliente, 
                barrio.nombre AS nombre_barrio,
                cliente.direccion AS direccion,   
                producto.tipo_producto AS producto
            FROM Pedido 
            JOIN Cliente ON pedido.cliente = cliente.idCliente
            JOIN Producto ON pedido.producto = producto.idProducto
            JOIN Barrio ON cliente.barrio = barrio.idBarrio
        `);
        res.json(pedidos); // Retorna los resultados
    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).send('Error en la consulta');
    }
});

app.get("/pedido/entregado", async (req, res) => {
    try {
        const connection = await connectDB();

        // Consulta para obtener los pedidos junto con la información relacionada
        const pedidos = await connection.query(`
            SELECT pedido.*, 
                cliente.nombre AS cliente, 
                barrio.nombre AS nombre_barrio,
                cliente.direccion AS direccion,   
                producto.tipo_producto AS producto
            FROM Pedido 
            JOIN Cliente ON pedido.cliente = cliente.idCliente
            JOIN Producto ON pedido.producto = producto.idProducto
            JOIN Barrio ON cliente.barrio = barrio.idBarrio
            WHERE pedido.estado = 'Entregado'
        `);
        res.json(pedidos); // Retorna los resultados
    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).send('Error en la consulta');
    }
});

app.put("/pedido/:idPedido", async (req, res) => {
    const { idPedido } = req.params;
    try {
        const connection = await connectDB();
        await connection.query(
            "UPDATE pedido SET estado = 'Entregado' WHERE idPedido = ?",
            [idPedido]
        );
        res.send("Pedido entregado");
    } catch (error) {
        console.error('Error al entregar pedido:', error);
        res.status(500).send('Error al entregar pedido');
    }
});

app.post("/pedido", async (req, res) => {
    const { cliente, producto, cantidad} = req.body;
    const fecha = new Date().toISOString().split('T')[0];
    try {
        const connection = await connectDB();
        await connection.query(
            "INSERT INTO pedido (fecha, cliente, producto, cantidad) VALUES (?, ?, ?, ?)",
            [fecha, cliente, producto, cantidad]
        );
        res.status(201).send("Recorrido agregado");
    } catch (error) {
        console.error('Error al agregar Recorrido:', error);
        res.status(500).send('Error al agregar Recorrido');
    }
});

app.get("/producto", async (req, res) => {
    try {
        const connection = await connectDB(); // Obtiene la conexión desde connectDB
        const result = await connection.query(`
            SELECT * FROM producto
            WHERE estado = 'Activo'
            `);
        res.json(result);
    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).send('Error en la consulta');
    }
});

app.get("/producto/inactivos", async (req, res) => {
    try {
        const connection = await connectDB();
        const result = await connection.query(`
            SELECT * FROM producto
            WHERE estado = 'Inactivo'
        `);
        res.json(result);
    } catch (error) {
        console.error('Error en la consulta:', error);
        res.status(500).send('Error en la consulta');
    }
});

// Ruta para agregar un producto
app.post("/producto", async (req, res) => {
    const { tipo_producto, cantidad, precio } = req.body;
    const ultima_actualizacion = new Date().toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'

    try {
        const connection = await connectDB();
        await connection.query(
            "INSERT INTO producto (tipo_producto, cantidad, precio, ultima_actualizacion) VALUES (?, ?, ?, ?)",
            [tipo_producto, cantidad, precio, ultima_actualizacion]
        );
        res.status(201).send("Producto agregado");
    } catch (error) {
        console.error('Error al agregar producto:', error);
        res.status(500).send('Error al agregar producto');
    }
});

//modificar producto
app.put('/producto/:idProducto', async (req, res) => {
    const { idProducto } = req.params;
    const { tipo_producto, cantidad, precio } = req.body;
    try {
        const connection = await connectDB();
        await connection.query('UPDATE producto SET tipo_producto = ?, cantidad = ?, precio = ?, ultima_actualizacion = NOW() WHERE idProducto = ?', 
            [tipo_producto, cantidad, precio, idProducto]);
        res.status(200).json({ message: 'Producto actualizado' });
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

app.put('/producto/baja/:idProducto', async (req, res) => {
    const { idProducto } = req.params;
    try {
        const connection = await connectDB();
        await connection.query('UPDATE producto SET estado = ?, ultima_actualizacion = NOW() WHERE idProducto = ?', 
            ['Inactivo', idProducto]);
        res.status(200).json({ message: 'Producto actualizado' });
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

app.put('/producto/alta/:idProducto', async (req, res) => {
    const { idProducto } = req.params;
    try {
        const connection = await connectDB();
        await connection.query('UPDATE producto SET estado = ?, ultima_actualizacion = NOW() WHERE idProducto = ?', 
            ['Activo', idProducto]);
        res.status(200).json({ message: 'Producto actualizado' });
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

app.listen(app.get("port"), () => {
    console.log('Servidor escuchando en el puerto ' + app.get("port"));
});