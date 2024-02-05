import { db } from "../conexion.js";
import { v4 as uuidv4 } from 'uuid';

export const crearIncorporacion = async (req, res) => {
    const { incorporacion, bienes } = req.body;

    try {
        const anioActual = new Date().getFullYear(); 
        anioActual.toString()
    
        // Consultar el número de secuencia actual para este año
        const q = `SELECT MAX(CAST(SUBSTRING(codigo_incorporacion, 5) AS UNSIGNED)) as ultimoNumero
            FROM incorporacion
            WHERE SUBSTRING(codigo_incorporacion, 1, 4) = ?`;

         await db.query(q, [anioActual], (err, data) =>{
        console.log(data[0].ultimoNumero)
        const ultimoNumero = data[0].ultimoNumero || 0; 
        const nuevoNumero = ultimoNumero + 1;  
        const codigo_incorporacion = anioActual.toString() + String(nuevoNumero).padStart(2, '0');
       
        // Inserta en la tabla incorporacion
        const q1 = "INSERT INTO incorporacion SET ?";
       
        db.query(q1, [{ ...incorporacion, codigo_incorporacion }], (err1, data1) => {
            if (err1) return res.status(500).json(err1);
            const incorporacionId = data1.insertId;

            // Actualiza el id_incorporacion en el objeto bienes
            const bienesConId = bienes.map((bien) => ({
                ...bien,
                incorporacionId,
                codigo_ejemplar: uuidv4() 
            }));

            // Inserta en la tabla ejemplar_bien
            const q2 = "INSERT INTO ejemplar_bien (id_bien, codigo_ejemplar, estado, valor, id_incorporacion) VALUES ?";
            db.query(q2, [bienesConId.map((bien) => [bien.id_bien, bien.codigo_ejemplar, bien.estado, bien.valor, bien.incorporacionId])], (err2, data2) => {
                if (err2) return res.status(500).json(err2);

                return res.status(200).json("Incorporación creada exitosamente.");
            });
        });

        });
        
       
    } catch (error) {
        console.error("Error al crear la incorporación:", error);
        res.status(500).json({ error: "Error al crear la incorporación." });
    }
};


export const obtenerIncorporaciones = async(req, res) =>{

    try {
        const q = `SELECT
        CONCAT(u.nombre, ' ', u.apellido) AS nombre_completo_usuario,
        p.nombre AS nombre_proveedor,
        i.id_incorporacion,
        i.fecha_incorporacion ,
        i.cantidad,
        i.costo,
        i.codigo_incorporacion
    FROM
        incorporacion i
    JOIN
        usuario u ON i.id_usuario = u.id_usuario
    JOIN
        proveedor p ON i.id_proveedor = p.id_proveedor;
    ` ;

        db.query(q, (err, data) =>{
            if (err) return res.status(500).json(err);
  
            // Devolver la lista de libros ordenados por título
            return res.status(200).json(data);
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener la lista de incorporaciones" });
    }

}

export const obtenerIncorporacion = async(req, res) =>{
    const id = req.params.id ;
    console.log(id)
     try {
        const q = `SELECT
        CONCAT(u.nombre, ' ', u.apellido) AS nombre_completo_usuario,
        p.nombre AS nombre_proveedor,
        i.id_incorporacion,
        i.fecha_incorporacion ,
        i.cantidad,
        i.costo,
        i.codigo_incorporacion
    FROM
        incorporacion i
    JOIN
        usuario u ON i.id_usuario = u.id_usuario
    JOIN
        proveedor p ON i.id_proveedor = p.id_proveedor WHERE i.id_incorporacion = ?
    ` ;
        db.query(q, [id], (err, data) =>{
         if (err) return res.status(500).json(err);
         if(data.length === 0){
             return res.send({error: "Esta incorporación no esta registrado"})
         }
         // Devolver la lista de libros ordenados por título
         return res.status(200).json(data[0]);
        })
 
     } catch (error) {
         console.error(error);
         res.status(500).json({ message: "Error al obtener la incorporación" });
     }
 }

 export const obtenerBienesIncorporacion = async(req, res) =>{
    const id = req.params.id ;
    console.log(id)
     try {
        const q = `SELECT eb.id_variacion, eb.codigo_ejemplar, eb.ubicacion, eb.estado, eb.valor, 
        eb.id_incorporacion, b.id_bien, b.nombre, b.descripcion, b.id_categoria
         FROM ejemplar_bien AS eb JOIN bien AS b ON eb.id_bien = b.id_bien WHERE id_incorporacion = ?
    ` ;
        db.query(q, [id], (err, data) =>{
         if (err) return res.status(500).json(err);
         if(data.length === 0){
             return res.send({error: "No existen bienes en esta incorporacion"})
         }
         // Devolver la lista de bienes  
         return res.status(200).json(data);
        })
 
     } catch (error) {
         console.error(error);
         res.status(500).json({ message: "Error al obtener los datos" });
     }
 }

 export const eliminarIncorporacion = async (req, res) =>{
    try {
        const id  = req.params.id;
        console.log(id)
     
        const deleteQuery = "DELETE  FROM incorporacion WHERE id_incorporacion = ?";
    
        db.query(deleteQuery, [id], (err, result) => {
          if (err) return res.status(500).json(err);
    
           
          return res.status(200).json("Incorporación eliminada correctamente");
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar el bien" });
      }
 } 

 
 export const obtenerIncorporacionesPorRangoDeFechaPdf = async (req, res) => {
    try {
        const { fechaInicial, fechaFinal } = req.query;

        // Realiza la consulta a la base de datos
        const query = `
            SELECT 
                eb.id_variacion,
                b.nombre AS nombre_bien,
                eb.codigo_ejemplar,
                eb.ubicacion,
                eb.estado,
                eb.valor,
                i.fecha_incorporacion,
                p.nombre AS nombre_proveedor
            FROM 
                incorporacion AS i
            JOIN 
                ejemplar_bien AS eb ON i.id_incorporacion = eb.id_incorporacion
            JOIN 
                bien AS b ON eb.id_bien = b.id_bien
            JOIN 
                proveedor AS p ON i.id_proveedor = p.id_proveedor
            WHERE 
                i.fecha_incorporacion BETWEEN ? AND ?
        `;
       await  db.query(query, [fechaInicial, fechaFinal], (err, datos)=>{
            // Enviar la respuesta con los datos obtenidos de la base de datos
        res.json({ success: true, data: datos });
        });
 
    } catch (error) {
        console.error('Error al obtener bienes incorporados:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  };

