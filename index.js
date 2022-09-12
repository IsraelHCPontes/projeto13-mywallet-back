import express, { query } from 'express';
import cors from "cors";
import joi from "joi";
import { MongoClient, ObjectId  } from "mongodb";
import dayjs from 'dayjs';


const server = express();

server.use(cors());
server.use(express.json());

const mongoClient = new MongoClient("mongodb://localhost:27017")

let db;

mongoClient.connect().then(() => {

   db = mongoClient.db("mywallet")

})

const userSchema = joi.object({
    email: joi.string().required(),
    password: joi.string().required()
})

const cadastroSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().required(),
})

server.post("/users", async (req, res) => {
  
    const {name, email, password,confirmPassword} = req.body
    const time = dayjs().format('HH:mm:ss');
    const validation = cadastroSchema.validate({name, email, password, confirmPassword}) 
   
    if(validation.error){
        res.status(409).send({message:'Erro de usuarioName'})
    }
    
    try{
                         
        const userExiste = await db.collection("users").findOne({name});
        const emailExiste = await db.collection("users").findOne({email});

        
        if(userExiste || emailExiste){
            res.status(409).send({message:"Usuario ja existe"})
            return
          }
        
         await db.collection('users').insertOne({
             name:name, 
             email: email,
             password:password,
             confirmPassword:confirmPassword,
             lastStatus: Date.now()
            })   

        res.sendStatus(201)
    }catch{
        res.sendStatus(422)
        
    }   
})

server.get("/entradas", async (req, res) => {
    try{
        const entradas = await db.collection('entradas').find().toArray()
        res.status(200).send(entradas)
    }catch(err){
        res.status(500).send(err.message)
    }
})


server.listen(5002, () => console.log('Escutando na porta 5002'))