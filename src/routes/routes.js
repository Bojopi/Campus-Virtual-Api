const express = require('express')
const router = express.Router()
const pool = require('../database')
const path = require('path')
const multer = require('multer')

const storage = multer.diskStorage({
    destination:'../../blogcampus/src/img',
    filename:(req,file,cb)=>{
        cb(null, file.originalname)
    }
})

const upload = multer({
    storage:storage,
    dest: 'img/'
})
//

//-------------ROUTES-------------------
router.get('/', function (req, res, next) {
    res.sendFile(path.resolve('index.html'))
});



//----------------API---------------------------
let json = {}

router.post('/api/a', upload.single('imagen'), function (req, res, next) {
    console.log(req.file)
    // console.log(req.body.titulo)
    // res.status(200)
});

router.get('/api/traerArticulos', async (req, res, next) => {
    let all = await pool.query(`select articulo.id, titulo, introduccion,contenido,fecha,img,personal.nombre || ' ' || personal.apellido as "Autor" from articulo,personal 
    where id_autor = personal.id order by articulo.id desc offset (0*10) rows fetch next 10 rows only`);
    json = all.rows
    // console.log(json)
    res.json(all.rows)
})
router.get('/api/traerArticulo/:id', async (req, res, next) => {
    let all = await pool.query(`select articulo.id, titulo, introduccion,contenido,fecha,img,personal.nombre || ' ' || personal.apellido as "Autor" 
                            from articulo join personal
                                on(articulo.id_autor = personal.id)
                            where articulo.id = ${req.params.id}`);
    json = all.rows
    // console.log(json)
    res.json(all.rows)
})
router.get('/api/traerComentarios/:id', async (req, res, next) => {
    let all = await pool.query(`select * from comentario where id_articulo= ${req.params.id}`);
    json = all.rows
    // console.log(json)
    res.json(all.rows)
})


router.post('/api/registrarArticulo', async (req, res, next) => {
    let body=req.body
    let all = await pool.query(`insert into articulo(titulo,introduccion,contenido,fecha,img,id_autor) values('${body.titulo}','${body.introduccion}','${body.contenido}','${body.fecha}','${body.img}',${body.id_autor})`);
    json = all.rows
    // console.log(json)
    res.json(all.rows)
})
router.post('/api/registrarComentario', async (req, res, next) => {
    let body=req.body
    let all = await pool.query(`insert into comentario(autor,foto_autor,fecha,hora,comentario,id_articulo)values('${body.autor}','${body.foto_autor}','${body.fecha}','${body.hora}','${body.comentario}',${body.id_articulo})`);
    json = all.rows
    // console.log(json)
    res.json(all.rows)
})
router.put('/api/actualizarPartido', async (req, res, next) => {
    let body=req.body
    let all = await pool.query(`update partido set goles_local=${body.goles_local}, goles_visitante=${body.goles_visitante} where id=${body.id}`);
    json = all.rows
    // console.log(json)
    res.json(all.rows)
})





module.exports = router