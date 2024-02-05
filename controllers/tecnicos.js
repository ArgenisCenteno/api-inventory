import { db } from "../conexion.js";

export const crearTecnico = async (req, res) => {
    try {
        const { nombre, descripcion, telefono, sector, calle, local } = req.body;

        const q = "INSERT INTO tecnico (nombre, descripcion, telefono, sector, calle, local) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(q, [nombre, descripcion, telefono, sector, calle, local], (err, data) => {
            if (err) return res.status(500).json(err);
            return res.status(201).json("Técnico creado correctamente");
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear el técnico" });
    }
};

export const actualizarTecnico = async (req, res) => {
    const { id } = req.params;
    try {
        const { nombre, descripcion, telefono, sector, calle, local } = req.body;

        const q = "UPDATE tecnico SET nombre = ?, descripcion = ?, telefono = ?, sector = ?, calle = ?, local = ? WHERE id = ?";
        db.query(q, [nombre, descripcion, telefono, sector, calle, local, id], (err, data) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json("Técnico actualizado correctamente");
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar el técnico" });
    }
};

export const obtenerTodosTecnicos = async (req, res) => {
    try {
        const q = "SELECT id, nombre, descripcion, telefono, sector, calle, local FROM tecnico";
        db.query(q, (err, data) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json(data);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener todos los técnicos" });
    }
};

export const obtenerTecnicoPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const q = "SELECT id, nombre, descripcion, telefono, sector, calle, local FROM tecnico WHERE id = ?";
        db.query(q, [id], (err, data) => {
            if (err) return res.status(500).json(err);
            if (data.length === 0) return res.status(404).json("Técnico no encontrado");
            return res.status(200).json(data[0]);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el técnico" });
    }
};
