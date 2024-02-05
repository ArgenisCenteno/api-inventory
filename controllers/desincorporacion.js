import { db } from "../conexion.js";

export const crearDesincorporacion = async (req, res) => {
  try {
    const { desincorporacion, bienes } = req.body;
    console.log(bienes)
    console.log(desincorporacion)

    const anioActual = new Date().getFullYear(); 
        anioActual.toString()
    
        // Consultar el número de secuencia actual para este año
        const r = `SELECT MAX(CAST(SUBSTRING(codigo, 5) AS UNSIGNED)) as ultimoNumero
            FROM desincorporacion
            WHERE SUBSTRING(codigo, 1, 4) = ?`;

         await db.query(r, [anioActual], (err, data) =>{
          console.log(data[0].ultimoNumero)
          const ultimoNumero = data[0].ultimoNumero || 0; 
          const nuevoNumero = ultimoNumero + 1;  
          const codigo_asignacion = anioActual.toString() + String(nuevoNumero).padStart(2, '0');



          const q = `INSERT INTO desincorporacion (fecha_desincorporacion, causa, id_usuario, codigo) VALUES (?,?,?,?)`;

          // Registra la asignación en la tabla 'asignacion'
           db.query(q, [desincorporacion.fecha_incorporacion, desincorporacion.motivo, desincorporacion.id_usuario,   codigo_asignacion ], (err, data) => {
            console.log(err)
            if (err) return res.status(500).json(err);
            
            const id_transferencia = data.insertId;
      
            // Actualiza el id_incorporacion en el objeto bienes
            const bienesConId = bienes.map((bien) => ({
              ...bien,
              id_transferencia,
            }));  

            console.log(bienesConId)
      
            // Registra los bienes asignados en la tabla 'bienes_asignados'
            const q2 = `INSERT INTO bienes_desincorporados (id_bien, id_desincorporacion) VALUES ?`;
            console.log(bienesConId)
            // Construye un array de arrays para la inserción múltiple
            const bienesValues = bienesConId.map((bien) => [bien.id_bien, bien.id_transferencia]); 
            db.query(q2, [bienesValues], (err2, data2) => {
              if (err2) return res.status(500).json(err2);
        
              const q3 = "UPDATE ejemplar_bien SET estado = ?, ubicacion = ? WHERE id_variacion = ?";
const updateValues = bienesConId.map((bien) => [ "Desincorporado", bien.valor, bien.id_bien ]);

for (const values of updateValues) {
  db.query(q3, values, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  });
}
res.status(200).json('Desincorporacion registrada exitosamente.');        
 });
     });
         })

        
  } catch (error) {
    console.error('Error al registrar la desincorporacion:', error);
    res.status(500).json({ error: 'Error al registrar la asignación.' });
  }
};

export const obtenerDesincorporaciones = async (req, res) => {
    try {
      const consulta =  `SELECT
      d.id_desincorporacion,
      d.fecha_desincorporacion,
      d.causa,
      d.codigo,
      d.estado,
      d.id_usuario,
      CONCAT(u.nombre, ' ', u.apellido) AS nombre_completo_usuario
  FROM
      desincorporacion AS d
  JOIN
      usuario AS u ON d.id_usuario = u.id_usuario; 
  `;
      db.query(consulta, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
    }
  };



  export const obtenerDesincorporacionParaResumen = async (req, res) =>{
    const { id  } = req.params;
    try {
      const consulta = `SELECT
      d.id_desincorporacion,
      d.fecha_desincorporacion,
      d.causa,
      d.estado,
      d.codigo,
      d.id_usuario,
      u.nombre AS nombre_usuario,
      u.apellido AS apellido_usuario
  FROM
      desincorporacion AS d
  JOIN
      usuario AS u ON d.id_usuario = u.id_usuario WHERE d.id_desincorporacion = ?`;
      db.query(consulta, [id],  (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("Desincorporación no encontrada");
        return res.status(200).json(data[0]);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
    }
  }  


  export const obtenerBienesDesincorporados = async(req, res) =>{
    const id = req.params.id ;
    console.log(id)
     try {
        const q = `SELECT
        e.id_variacion AS id_ejemplar,
        e.codigo_ejemplar AS codigo_ejemplar,
        e.ubicacion AS ubicacion,
        e.estado AS estado,
        e.valor AS valor,
        b.nombre AS nombre_bien,
        b.descripcion
    FROM
        ejemplar_bien AS e
    JOIN
        bien AS b ON e.id_bien = b.id_bien
    JOIN
        bienes_desincorporados AS bd ON e.id_variacion = bd.id_bien
    WHERE
        bd.id_desincorporacion =  ?
    ` ;
        db.query(q, [id], (err, data) =>{
         if (err) return res.status(500).json(err);
         if(data.length === 0){
             return res.send({error: "No existen bienes en esta desincorporacion"})
         }
         // Devolver la lista de bienes  
         return res.status(200).json(data);
        })
 
     } catch (error) {
         console.error(error);
         res.status(500).json({ message: "Error al obtener los datos" });
     }
 }

 export const eliminarDesincorporacionPorId = async (req, res) => {
    const { id } = req.params;
    try {
      // Verificar si el departamento existe
      const verificarExistencia = "SELECT * FROM desincorporacion WHERE id_desincorporacion = ?";
      db.query(verificarExistencia, [id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("Desincorporacion no encontrado");
  
        // Eliminar el departamento
        const eliminarDepartamento = "DELETE FROM desincorporacion WHERE id_desincorporacion = ?";
        db.query(eliminarDepartamento, [id], (err, data) => {
          if (err) return res.status(500).json(err);
          return res.status(200).json("Desincorporacion eliminada correctamente");
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json(error.message);
    }
  };


  export const bienesDesincorporadosPorFecha = async(req, res) =>{
    try {
      const { fechaInicial, fechaFinal } = req.query;
       

      // Realiza la consulta a la base de datos
      const query = `
      SELECT 
      b.nombre AS nombre_bien,
      eb.codigo_ejemplar,
      d.fecha_desincorporacion,
      d.causa AS motivo_desincorporacion,
      eb.ubicacion
  FROM 
      bien AS b
  JOIN 
      ejemplar_bien AS eb ON b.id_bien = eb.id_bien
  JOIN 
      bienes_desincorporados AS bd ON eb.id_variacion = bd.id_bien
  JOIN 
      desincorporacion AS d ON bd.id_desincorporacion = d.id_desincorporacion
  WHERE 
      d.fecha_desincorporacion BETWEEN ? AND ? `;
      await db.query(query, [fechaInicial, fechaFinal], (err, datos) =>{
        if (err) return res.status(500).json(err);
        if(datos.length === 0){
            return res.send({error: "No existen bienes en esta desincorporacion"})
        }else{
            res.json({ success: true, data: datos });
        }
    
      });

      
  } catch (error) {
      console.error('Error al obtener bienes desincorporados:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
  }