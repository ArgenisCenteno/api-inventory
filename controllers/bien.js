import {db} from "../conexion.js";



 

export const crearBien = async(req, res) =>{
try{ 
    const {nombre, descripcion,   categoria} = req.body;
    
    //Validamos los campos 

    if(!nombre){
        return res.send({error: "El nombre es requerido"})
    }
    if(!descripcion){
        return res.send({error: "La descripcion es requerida"})
    }
  
    if(!categoria){
        return res.send({error: "La categoria es requerida"})
    }

    //Validamos si ya existe este bien
    const q = "SELECT * FROM bien WHERE nombre = ?";
    db.query(q, [nombre], (err, data) =>{
      if (err) return res.status(500).json(err);
      if (data.length) return res.status(409).json("Este bien ya se encuentra registrado");

      const bienQuery = "INSERT INTO bien (nombre, descripcion, id_categoria) VALUES (?,?,? )"

      //INSERTAMOS LOS DATOS EN LA TABLA BIEN
      const bienValor = [nombre, descripcion,  categoria];

      db.query(bienQuery, bienValor, (err, data) =>{
        if (err) return res.status(500).json(err);
        return res.status(200).json("Bien registrado correctamente");
      })
    })}catch(error){
        // Manejar errores aquí
    console.error(error);
    res.status(500).json(error.message);
    }
}

export const actualizarBien = async(req, res) =>{
    try{ 
    const {  nombre, descripcion, categoria} = req.body;
    const {id_bien} = req.params;   
     //Validamos los campos 

     if(!nombre){
        return res.send({error: "El nombre es requerido"})
    }
    if(!descripcion){
        return res.send({error: "La descripcion es requerida"})
    }
 
    if(!categoria){
        return res.send({error: "La categoria es requerida"})
    }

    //Validamos si ya existe este bien
    const q = "SELECT * FROM bien WHERE id_bien = ?";
    db.query(q, [id_bien], (err, data) =>{
        if (err) {
            console.error(err);
            return res.status(500).json(err);
          }
        if (data.length === 0) {
            return res.status(404).json("Este bien no existe, no se puede actualizar");
          }  

      const actualizarQuery = "UPDATE bien SET nombre = ?, descripcion = ?, id_categoria = ? WHERE id_bien = ?" 

      //INSERTAMOS LOS DATOS EN LA TABLA BIEN
      const actualizarValores = [
        nombre || data[0].nombre,
        descripcion || data[0].descripcion, 
        categoria || data[0].id_categoria,
        id_bien
      ];  

      db.query(actualizarQuery, actualizarValores, (err, data) =>{
        if (err) return res.status(500).json(err);
        return res.status(200).json("Bien actualizado correctamente");
      })
    })}catch(error){
        // Manejar errores aquí
    console.error(error);
    res.status(500).json(error.message);
    }
}

export const obtenerBienes = async(req, res) =>{

    try {
        const q = "SELECT b.id_bien, b.nombre , b.descripcion, c.nombre AS categoria FROM bien AS b LEFT JOIN categoria AS c ON b.id_categoria = c.id_categoria ORDER BY nombre";

        db.query(q, (err, data) =>{
            if (err) return res.status(500).json(err);
  
            // Devolver la lista de libros ordenados por título
            return res.status(200).json(data);
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener la lista de libros" });
    }

}

export const obtenerBienPorId = async(req, res) =>{
   const id = req.params.id_bien;
   console.log(id)
    try {
       const q = "SELECT b.id_bien, b.nombre , b.descripcion, b.id_categoria, c.nombre AS categoria  FROM bien AS b LEFT JOIN categoria AS c ON b.id_categoria = c.id_categoria  WHERE b.id_bien = ?" ;
       db.query(q, [id], (err, data) =>{
        if (err) return res.status(500).json(err);
        if(data.length === 0){
            return res.send({error: "Este bien no esta registrado"})
        }
        // Devolver la lista de libros ordenados por título
        return res.status(200).json(data[0]);
       })

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener la lista de libros" });
    }
}


export const obtenerBienPorRango = async (req, res) =>{
    try {
      const {fechaDesde, fechaHasta} = req.query;
  
      //Consultar bienes por rango de fecha
      const queryCosulta = "SELECT * FROM bien WHERE fecha_adquisicion BETWEEN ? AND ?";
  
      db.query(queryCosulta, [fechaDesde, fechaHasta], (err, data) =>{
        if (err) return res.status(500).json(err);
        if(data.length === 0){
            return res.send({error: "No se encontraron bienes por este rango de fechas"})
        }
      
            // Devolver la lista de bienes ordenados por título
            return res.status(200).json(data);
      })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener la lista de bienes" });
    }
  } 

 export const eliminarBien = async (req, res) =>{
    try {
        const id  = req.params.id;
        console.log(id)
    
        // Consulta para eliminar un bien por su id
        const deleteQuery = "DELETE  FROM bien WHERE id_bien = ?";
    
        db.query(deleteQuery, [id], (err, result) => {
          if (err) return res.status(500).json(err);
    
          
          // Prestamo eliminado exitosamente
          return res.status(200).json("Bien eliminado correctamente");
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar el bien" });
      }
 } 


 export const obtenerEjemplares = async(req, res) =>{
    const id = req.params.id ;
    console.log(id)
     try {
        const q = `SELECT
        eb.id_variacion,
        eb.codigo_ejemplar,
        eb.ubicacion,
        eb.estado,
        eb.valor,
        eb.id_incorporacion
      FROM
        bien AS b
      JOIN
        ejemplar_bien AS eb ON b.id_bien = eb.id_bien
      WHERE
        b.id_bien  = ? 
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

 export const obtenerEjemplaresPorCategoria = async(req, res) =>{
    const id = req.params.id ;
    console.log(id)
     try {
        const q = `SELECT eb.codigo_ejemplar, eb.id_variacion , b.nombre
        FROM ejemplar_bien AS eb
        JOIN bien AS b ON eb.id_bien = b.id_bien
        WHERE b.id_categoria =  ? AND eb.estado = 'disponible'
    ` ;
        db.query(q, [id], (err, data) =>{
         if (err) return res.status(500).json(err);
         if(data.length === 0){
             return res.send({error: "Sin bienes con esta categoria"})
         }
         // Devolver la lista de bienes  
         return res.status(200).json(data);
        })
 
     } catch (error) {
         console.error(error);
         res.status(500).json({ message: "Error al obtener los datos" });
     }
 }

 export const generarCatalogo = async(req, res) =>{  
     try {
        const q = `SELECT 
        eb.id_variacion,
        eb.codigo_ejemplar,
        eb.ubicacion,
        eb.estado,
        eb.valor,
        eb.id_incorporacion,
        b.nombre AS nombre_bien,
        b.descripcion AS descripcion_bien,
        c.nombre AS nombre_categoria,
        c.descripcion AS descripcion_categoria
    FROM ejemplar_bien eb
    JOIN bien b ON eb.id_bien = b.id_bien
    JOIN categoria c ON b.id_categoria = c.id_categoria
    ` ;
        db.query(q, (err, data) =>{
         if (err) return res.status(500).json(err);
         if(data.length === 0){
             return res.send({error: "No existen bienes "})
         }
         // Devolver la lista de bienes  
         return res.status(200).json(data);
        })
 
     } catch (error) {
         console.error(error);
         res.status(500).json({ message: "Error al obtener los datos" });
     }
 }