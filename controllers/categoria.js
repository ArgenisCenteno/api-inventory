import { db } from "../conexion.js";


export const crearCategoria = async(req, res) =>{
    const {nombre, descripcion} = req.body;

    try{ 
        const {nombre, descripcion, fecha_adquisicion, valor, estado, proveedor, categoria} = req.body;
        
        //Validamos los campos 
    
        if(!nombre){
            return res.send({error: "El nombre es requerido"})
        }
        if(!descripcion){
            return res.send({error: "La descripcion es requerida"})
        }
    
        //Validamos si ya existe este bien
        const q = "SELECT * FROM categoria WHERE nombre = ?";
        db.query(q, [nombre], (err, data) =>{
          if (err) return res.status(500).json(err);
          if (data.length) return res.status(409).json("Esta categoria ya se encuentra registrado");
    
          const categoriaQuery = "INSERT INTO categoria (nombre, descripcion) VALUES (?,? )"
    
          //INSERTAMOS LOS DATOS EN LA TABLA BIEN
          const categoria = [nombre, descripcion];
    
          db.query(categoriaQuery, categoria, (err, data) =>{
            if (err) return res.status(500).json(err);
            return res.status(200).json("Categoria registrada correctamente");
          })
        })}catch(error){
            // Manejar errores aquí
        console.error(error);
        res.status(500).json(error.message);
        }
}


export const obtenerCategorias = async (req, res) =>{
    try {
        const q = "SELECT * FROM categoria ORDER BY nombre";

        db.query(q, (err, data) =>{
            if (err) return res.status(500).json(err);
  
            // Devolver la lista de libros ordenados por título
            return res.status(200).json(data);
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener la lista de categorias" });
    }
}

// ELIMINAR UN CATEGORIA POR SU CÓDIGO
export const eliminarCategoria = async (req, res) => {
    try {
      const { codigo } = req.params;
  
      // Consulta para eliminar un libro por su código
      const deleteQuery = "DELETE FROM categoria WHERE id_categoria = ?";
  
      db.query(deleteQuery, [codigo], (err, result) => {
        if (err) return res.status(500).json(err);
  
        if (result.affectedRows === 0) {
          return res.status(404).json("Categoria no encontrada, no se pudo eliminar");
        }
  
        // Libro eliminado exitosamente
        return res.status(200).json("Categoria eliminada correctamente");
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al eliminar la categoria" });
    }
  };

// OBTENER UNA CATEGORIA POR SU CÓDIGO
export const obtenerCategoriaPorId = async (req, res) => {
    try {
      const { codigo } = req.params;
  
      // Consulta para obtener una categoria por su código
      const query = "SELECT * FROM categoria WHERE id_categoria = ?";
      
      db.query(query, [codigo], (err, data) => {
        if (err) return res.status(500).json(err);
  
        if (data.length === 0) {
          return res.status(404).json("Categoria no encontrada");
        }
  
        // Devolver la categoria encontrado en la respuesta JSON
        return res.status(200).json(data[0]);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener la categoria" });
    }
  };
 
  // Actualizar una categoría por su código
export const actualizarCategoria = async (req, res) => {
    try {
        const { codigo } = req.params;
        const { nombre, descripcion } = req.body;

        // Validar los campos
        if (!nombre || !descripcion) {
            return res.status(400).json({ error: "Nombre y descripción son requeridos" });
        }

        // Consulta para actualizar la categoría
        const updateQuery = "UPDATE categoria SET nombre = ?, descripcion = ? WHERE id_categoria = ?";

        db.query(updateQuery, [nombre, descripcion, codigo], (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }

            if (result.affectedRows === 0) {
                return res.status(404).json("Categoría no encontrada, no se pudo actualizar");
            }

            // Categoría actualizada exitosamente
            return res.status(200).json("Categoría actualizada correctamente");
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar la categoría" });
    }
};
