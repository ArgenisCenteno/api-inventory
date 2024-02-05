import mysql from "mysql"


export const db = mysql.createConnection({
    host: "localhost",
    user: "root", 
    password: "",
    database: "db_uptnmls"

 
})

if(db){
    console.log("Conexion creada")
}else{
    console.log("Sin conectar")
}