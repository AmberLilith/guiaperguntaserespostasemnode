const express = require("express");
const app = express();
const connection = require("./database/database");
const pergunta = require("./database/pergunta");
const resposta = require("./database/resposta");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
connection
    .authenticate()
    .then(() => {
        console.log("Conectado!");
    })
    .catch((msgErro)=>{
        console.log(msgErro);
    })

app.set('view engine', 'ejs');
app.use(express.static('public'))

app.get("/", (req, res) => {
    pergunta.findAll({raw:true, order:[
        ['createdAt',"DESC"]
    ]}).then(perguntas =>{
        res.render("index",{
            perguntas:perguntas
        });
    })    
});

app.get("/perguntar", (req, res) => {
    res.render("perguntar");
});

app.post("/salvarpergunta",(req,res) =>{
    var titulo = req.body.titulo;
    var descricao = req.body.descricao;
    pergunta.create({
        titulo: titulo,
        descricao:descricao
    }).then(() =>{        
        res.redirect('/perguntar');
    });
});

app.get("/pergunta/:id",(req,res) =>{
    let id = req.params.id;
    pergunta.findOne({
        where:{id:id}
    }).then(pergunta =>{
       if(pergunta != undefined){
        resposta.findAll({
            where:{idPergunta: pergunta.id},
            order:[
                ['createdAt',"DESC"]
            ]
        }).then(respostas =>{
            res.render("pergunta",{
                pergunta:pergunta,
                respostas:respostas
            });
        })
       }else{
        res.redirect("/");
       }
    })
});

app.post("/responder",(req,res)=>{    
    let corpo = req.body.resposta;
    let idPergunta = req.body.idPergunta;
    resposta.create({
        corpo:corpo,
        idPergunta: idPergunta

    }).then(()=>{
        res.redirect("/pergunta/"+idPergunta);
    });
});


app.listen(8080, (erro) => { 
    if(erro){
        console.log("Ocorreu um erro");
    }else{
        console.log("App rodando!");
    }
 })