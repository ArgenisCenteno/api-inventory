import {db} from "../conexion.js";
import { v4 as uuidv4 } from 'uuid';


 

export const crearProveedor = async(req, res) =>{
try{ 
    const {nombre, email, direccion, telefono} = req.body;
    
    //Validamos los campos 

    if(!nombre){
        return res.send({error: "El nombre es requerido"})
    }
    if(!email){
        return res.send({error: "El email es requerido"})
    }
  
    if(!telefono){
        return res.send({error: "El telefono es requerido"})
    }

    //Validamos si ya existe este bien
    const q = "SELECT * FROM proveedor WHERE nombre = ?";
    db.query(q, [nombre], (err, data) =>{
      if (err) return res.status(500).json(err);
      if (data.length) return res.status(409).json("Este proveedor ya se encuentra registrado");

      const bienQuery = "INSERT INTO proveedor (nombre, direccion, telefono, email) VALUES (?,?,?,? )"

      //INSERTAMOS LOS DATOS EN LA TABLA BIEN
      const bienValor = [nombre, direccion, telefono, email];

      db.query(bienQuery, bienValor, (err, data) =>{
        if (err) return res.status(500).json(err);
        return res.status(200).json("Proveedor registrado correctamente");
      })
    })}catch(error){
        // Manejar errores aquí
    console.error(error);
    res.status(500).json(error.message);
    }
}

export const actualizarProveedor = async(req, res) =>{
    try{ 
    const { nombre, direccion, telefono, email} = req.body;
    const {id_proveedor} = req.params;   
     //Validamos los campos 

   
     if(!nombre){
        return res.send({error: "El nombre es requerido"})
    }
    if(!email){
        return res.send({error: "El email es requerido"})
    }
  
    if(!telefono){
        return res.send({error: "El telefono es requerido"})
    }

    //Validamos si ya existe este bien
    const q = "SELECT * FROM proveedor WHERE id_proveedor = ?";
    db.query(q, [id_proveedor], (err, data) =>{
        if (err) {
            console.error(err);
            return res.status(500).json(err);
          }
        if (data.length === 0) {
            return res.status(404).json("Este proveedor no existe, no se puede actualizar");
          }  

      const actualizarQuery = "UPDATE proveedor SET nombre = ?, direccion = ?, telefono = ?, email = ? WHERE id_proveedor = ?" 

      //INSERTAMOS LOS DATOS EN LA TABLA BIEN
      const actualizarValores = [
        nombre || data[0].nombre,
        direccion || data[0].direccion, 
        telefono || data[0].telefono,
        email || data[0].email, 
        id_proveedor
      ];  

      db.query(actualizarQuery, actualizarValores, (err, data) =>{
        if (err) return res.status(500).json(err);
        return res.status(200).json("Proveedor actualizado correctamente");
      })
    })}catch(error){
        // Manejar errores aquí
    console.error(error);
    res.status(500).json(error.message);
    }
}

export const obtenerProveedores = async(req, res) =>{

    try {
        const q = "SELECT * FROM proveedor ORDER BY nombre";

        db.query(q, (err, data) =>{
            if (err) return res.status(500).json(err);
  
            // Devolver la lista de libros ordenados por título
            return res.status(200).json(data);
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener la lista de proveedores" });
    }

}

export const obtenerProveedorPorId = async(req, res) =>{
   const id = req.params.id_proveedor;
   console.log(id)
    try {
       const q = "SELECT * FROM proveedor WHERE id_proveedor = ?" ;
       db.query(q, [id], (err, data) =>{
        if (err) return res.status(500).json(err);
        if(data.length === 0){
            return res.send({error: "Este proveedor no esta registrado"})
        }
        // Devolver la lista de libros ordenados por título
        return res.status(200).json(data[0]);
       })

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el proveedor" });
    }
}
 

 export const eliminarProveedor = async (req, res) =>{
    try {
        const id  = req.params.id_proveedor; 
    
        // Consulta para eliminar un bien por su id
        const deleteQuery = "DELETE  FROM proveedor WHERE id_proveedor = ?";
    
        db.query(deleteQuery, [id], (err, result) => {
          if (err) return res.status(500).json(err);
    
          
          // Prestamo eliminado exitosamente
          return res.status(200).json("Proveedor eliminado correctamente");
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en el sistema" });
      }
 } 