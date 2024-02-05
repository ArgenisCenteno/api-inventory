import { db } from "../conexion.js";

export const registrarDepartamento = async(req, res) =>{
    const {nombre, descripcion, ubicacion} = req.body;
    console.log( ubicacion)
    try {

        const q = "SELECT * FROM departamento WHERE nombre = ?";

        db.query(q, [nombre], (err, data) =>{
            if(err) return res.status(500).json(err)
            if(data.length) return res.status(409).json("Existe un departamento con ese nombre");

            const insertarDatos = "INSERT INTO departamento (nombre, descripcion, ubicacion) VALUES (?,?,?)";
            const datos = [nombre, descripcion, ubicacion];

            db.query(insertarDatos, datos, (err, data) =>{
                if (err) return res.status(500).json(err);
                return res.status(200).json("Departamento registrado correctamente");
            })
        })
       
    } catch (error) {
        // Manejar errores aquí
         console.error(error);
        res.status(500).json(error.message);
    }
}

export const actualizarDepartamento = async (req, res) => {
    const {   nombre, descripcion, ubicacion } = req.body;
    const {id} = req.params;
    try {
      // Verificar si el departamento existe
      const verificarExistencia = "SELECT * FROM departamento WHERE id_departamento = ?";
      db.query(verificarExistencia, [id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("El departamento no existe");
  
        // Actualizar el departamento
        const actualizarDatos = "UPDATE departamento SET nombre = ?, descripcion = ?, ubicacion = ? WHERE id_departamento = ?";
        const datos = [nombre, descripcion, ubicacion, id];
        db.query(actualizarDatos, datos, (err, data) => {
          if (err) return res.status(500).json(err);
          return res.status(200).json("Departamento actualizado correctamente");
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
    }
  };
 
  export const obtenerTodosLosDepartamentos = async (req, res) => {
    try {
      const consulta = "SELECT * FROM departamento";
      db.query(consulta, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
    }
  };

  export const obtenerBienesAsignados = async (req, res) => {
    const { id  } = req.params;
    try {
      const consulta = `SELECT
      ba.id_bienes_asinados,
      b.nombre AS nombre_bien,
      b.descripcion AS descripcion_bien,
      eb.codigo_ejemplar,
      eb.ubicacion AS ubicacion_ejemplar,
      eb.estado AS estado_ejemplar,
      eb.valor AS valor_ejemplar,
      ba.vigencia,
      d.nombre AS nombre_departamento
  FROM
      bienes_asignados ba
  JOIN
      ejemplar_bien eb ON ba.id_ejemplar_bien = eb.id_variacion
  JOIN
      bien b ON eb.id_bien = b.id_bien
  JOIN
      asignacion a ON ba.id_asignacion = a.id_asignacion
  JOIN
      departamento d ON a.departamento_id = d.id_departamento
  WHERE
      d.id_departamento = ?`;
      db.query(consulta, [id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("Departamento no encontrado");
        return res.status(200).json(data);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
    }
  };

  export const obtenerDepartamentoPorId = async (req, res) => {
    const { id  } = req.params;
    try {
      const consulta = "SELECT * FROM departamento WHERE id_departamento = ?";
      db.query(consulta, [id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("Departamento no encontrado");
        return res.status(200).json(data[0]);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
    }
  };

  export const obtenerBienesDeDepartamento = async (req, res) => {
    const { id  } = req.params;
    try {
      const consulta = `SELECT
      ea.id_bienes_asinados,
      eb.id_variacion,
      b.nombre AS nombre_bien,
      eb.codigo_ejemplar,
      eb.ubicacion,
      eb.estado,
      eb.valor
  FROM bienes_asignados ea
  JOIN ejemplar_bien eb ON ea.id_ejemplar_bien = eb.id_variacion
  JOIN bien b ON eb.id_bien = b.id_bien
  JOIN asignacion a ON ea.id_asignacion = a.id_asignacion
  JOIN departamento d ON a.departamento_id = d.id_departamento
  WHERE d.id_departamento = ?` ;
      db.query(consulta, [id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("Este departamento no tiene bienes");
        return res.status(200).json(data);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
    }
  };

  export const eliminarDepartamentoPorId = async (req, res) => {
    const { id } = req.params;
    try {
      // Verificar si el departamento existe
      const verificarExistencia = "SELECT * FROM departamento WHERE id_departamento = ?";
      db.query(verificarExistencia, [id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("Departamento no encontrado");
  
        // Eliminar el departamento
        const eliminarDepartamento = "DELETE FROM departamento WHERE id_departamento = ?";
        db.query(eliminarDepartamento, [id], (err, data) => {
          if (err) return res.status(500).json(err);
          return res.status(200).json("Departamento eliminado correctamente");
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
    }
  };

  export const obtenerBieness = async(req, res) =>{
    const id = req.params.id ;
    console.log(id)   
     try {
        const q = `SELECT 
        ba.id_bienes_asinados,
        eb.codigo_ejemplar,
        eb.ubicacion,
        eb.estado,
        eb.valor,
        eb.id_incorporacion,
        b.nombre AS nombre_bien,
        b.descripcion AS descripcion_bien
    FROM bienes_asignados ba
    JOIN ejemplar_bien eb ON ba.id_ejemplar_bien = eb.id_variacion
    JOIN asignacion a ON ba.id_asignacion = a.id_asignacion
    JOIN bien b ON eb.id_bien = b.id_bien
    WHERE a.departamento_id  = ?
    ` ;
        db.query(q, [id], (err, data) =>{
         if (err) return res.status(500).json(err);
         if(data.length === 0){
             return res.send({error: "No existen bienes en este Departamento"})
         }
         // Devolver la lista de bienes  
         return res.status(200).json(data);
        })
 
     } catch (error) {
         console.error(error);
         res.status(500).json({ message: "Error al obtener los datos" });
     }
 }