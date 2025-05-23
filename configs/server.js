"use strict"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import { dbConnection } from "./mongo.js"
import apiLimiter  from "../src/middlewares/rate-limit-validator.js"
import cursoRoutes from "../src/curso/curso.routes.js"
import publicacionRoutes from "../src/publicaciones/publicacion.routes.js"
import comentarioRoutes from "../src/comentarios/comentario.routes.js"
import { swaggerDocs, swaggerUi } from "./swagger.js" 
import { inicializarCursos } from "./curso.default.js"



const middlewares = (app) => {
    app.use(express.urlencoded({extended: false}))
    app.use(express.json())
    app.use(cors())
    app.use(helmet())
    app.use(morgan("dev"))
    app.use(apiLimiter)
}

const conectarDB = async () =>{
    try{
        await dbConnection()
        await inicializarCursos();
    }catch(err){
        console.log(`Database connection failed: ${err}`)
    }
}

const routes = (app) => {
    app.use("/neuroCode/v1/curso", cursoRoutes);
    app.use("/neuroCode/v1/publicaciones", publicacionRoutes);
    app.use("/neuroCode/v1/comentarios", comentarioRoutes);
    app.use("/neuroCode/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}

export const initServer = () => {
    const app = express()
    try{
        middlewares(app)
        conectarDB()
        routes(app)
        app.listen(process.env.PORT)
        console.log(`Server running on port ${process.env.PORT}`)
    }catch(err){
        console.log(`Server init failed: ${err}`)
    }
}