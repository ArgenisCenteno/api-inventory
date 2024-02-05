import {db} from "../conexion.js";
import  JWT   from "jsonwebtoken";
import bcrypt from "bcryptjs"
import { requireSignIn } from "../middleware/authMiddleware.js";

export const crearUsuario = async(req, res) =>{
    try {
        const {nombre, apellido, email, clave, rol } = req.body;

        //VALIDAR CAMPOS DEL FORMULARIO
        if (!nombre) {
            return res.send({ message: "Nombre es requerido" });
          }
          if (!apellido) {
            return res.send({ message: "Apellido es requerido" });
          }
          if (!clave) {
            return res.send({ message: "Clave es requerida" });
          }
          if (!email) {
            return res.send({ message: "Email es requerido" });
          }
          
          //CONSULTAR SI EL USUARIO EXISTE
          const q = "SELECT * FROM usuario WHERE email = ?";
          db.query(q, [email],  (err, data) => {
            if (err) return res.status(500).json(err);
            if (data.length) return res.status(409).json("Este usuario se encuentra registrado");
        //CREAR USUARIO
            //ENCRIPTAR CLAVE
            const salt =   bcrypt.genSaltSync(10);
            const hashedPassword =  bcrypt.hashSync(clave, salt);
        
            const q =
              "INSERT INTO usuario (`nombre`,`apellido`,`email`,`clave`,`rol`, `estado`) VALUE (?)";
             
             const estadoUsuario = "activo"
        
            const values = [
              nombre,
              apellido,
              email,
              hashedPassword,
              rol,
              estadoUsuario
            ];
        
            db.query(q, [values], (err, data) => {
              if (err) return res.status(500).json(err);
              console.log(err)
              return res.status(200).json("Usuario creado correctamente");
            });
          })

    } catch (error) {
        console.log(error)
        return res.status(500).json("Error inesperado")
    }


}

export const actualizarUsuario = async (req, res ) =>{
    try {
        const {nombre, apellido, email, rol,   estado } = req.body;
        const {id} = req.params

           
          //CONSULTAR SI EL USUARIO EXISTE
          const q = "SELECT * FROM usuario WHERE id_usuario = ?";
          db.query(q, [id],  (err, data) => {
            if (err) return res.status(500).json(err);
            if (data.length === 0) return res.status(409).json("Este usuario no se encuentra registrado");
        //ACTUALIZAR USUARIO
            
        
        const q = "UPDATE usuario SET nombre = ?, apellido = ?, email = ?, rol = ?, estado = ? WHERE id_usuario = ?";

              
            const values = [
              nombre || data[0].nombre,
              apellido || data[0].apellido,
              email || data[0].email,
              rol || data[0].rol,
              estado || data[0].estado,
              id 
            ]; 
        console.log(values)
            db.query(q,  values , (err, data) => {
              if (err) return res.status(500).json(err);
              console.log(data)
              return res.status(200).json("Usuario actualizado correctamente");
            });
          })

    } catch (error) {
        console.log(error)
        return res.status(500).json("Error inesperado")
    }

}

export const iniciarSesion = async(req, res) =>{
  try {
      
    //CONSULTAR SI EL USUARIO YA EXISTE
   const user =  "SELECT * FROM usuario WHERE email = ? AND estado = 'activo'";
    

   db.query(user, [req.body.email], (err, data) =>{
       if(err) return res.status(500).json(err);
       if(data.length === 0) return res.status(404).json("Usuario o contraseña incorrecta");
       
   //COMPARAR CONTRASEÑAS
   const checkPassword = bcrypt.compareSync(req.body.clave, data[0].clave);
   if(!checkPassword) return res.status(400).json("Usuario o contraseña incorrecta ")
  // Enviar la información del usuario en la respuesta
 const usuarioInfo = {
   id_usuario: data[0].id_usuario,
   nombre: data[0].nombre,
   apellido: data[0].apellido,
   email: data[0].email,
   rol: data[0].cedula,
 };     
   //GENERAR TOKEN
   const token =  JWT.sign({id_usuario: data.id_usuario }, process.env.JWT_SECRET, {
   expiresIn: "30d",
   });
   console.log(data.id_usuario)
   res.status(200).send({
   success: true,
   message: "Inicio de sesión",
   user: usuarioInfo,
   token,
 });
   })

} catch (error) {
   console.log(error);
res.status(500).send({
 success: false,
 message: "Error in login",
 error,
});
}

}

export const obtenerTodosLosUsuarios = async (req, res) => {
  try {
    const consulta = "SELECT * FROM usuario";
    db.query(consulta, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

export const obtenerUsuarioPorId = async (req, res) => {
  const { id  } = req.params;
  try {
    const consulta = "SELECT * FROM usuario WHERE id_usuario = ?";
    db.query(consulta, [id], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.length === 0) return res.status(404).json("Usuario no encontrado");
      return res.status(200).json(data[0]);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

export const eliminarUsuarioPorId = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar si el departamento existe
    const verificarExistencia = "SELECT * FROM usuario WHERE id_usuario = ?";
    db.query(verificarExistencia, [id], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.length === 0) return res.status(404).json("Usuario no encontrado");

      // Eliminar el departamento
      const eliminarDepartamento = "DELETE FROM usuario WHERE id_usuario = ?";
      db.query(eliminarDepartamento, [id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Usuario eliminado correctamente");
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};