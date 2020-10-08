const express = require('express')
const router = express.Router()
const pool = require('../database')
const path = require('path')
const multer = require('multer')

let nuevoNombre = '';

const storage = multer.diskStorage({
    destination:'img/',
    filename:(req,file,cb)=>{
        cb(null, nuevoNombre + '.jpg');
    }
})

function checkFileType(file, cb) {
        //extenciones permitidas
        const filetypes = /jpeg|jpg|png|gif/
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
        //check mime type
        const mimetype = filetypes.test(file.mimetype)
    
        if (mimetype && extname) {
            return cb(null, true)
        } else {
            cb('Error: Images Only!')
        }
}
const upload = multer({
    storage:storage,
    dest: 'img/',
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb)
    }
})
//

//-------------ROUTES-------------------
router.get('/', function (req, res, next) {
    res.sendFile(path.resolve('index.html'))
});


//Set Storage Engine
// const storage = multer.diskStorage({
//     destination: path.join(__dirname, '../photos'),
//     filename: function (req, file, cb) {
//         const user = req.body
//         // console.log(user.email)
//         cb(null, user.email + '.jpg') //nombre de las fotos
//     }
// })

// const uploadPhoto = multer({
//     storage: storage,
//     limits: {
//         fileSize: 5000000 //bytes = 5mb
//     },
//     fileFilter: function (req, file, cb) {
//         checkFileType(file, cb)
//     }
// }).single('myPhoto')

// function checkFileType(file, cb) {
//     //extenciones permitidas
//     const filetypes = /jpeg|jpg|png|gif/
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
//     //check mime type
//     const mimetype = filetypes.test(file.mimetype)

//     if (mimetype && extname) {
//         return cb(null, true)
//     } else {
//         cb('Error: Images Only!')
//     }
// }
//----------------------------------------------



//----------------API---------------------------
let json = {}

router.post('/api/a', upload.single('imagen'), function (req, res, next) {
    console.log(req.file)
    // console.log(req.body.titulo)
    res.json(req.file)
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
router.get('/api/traerRecursos', async (req, res, next) => {
    let all = await pool.query(`select * from recurso`);
    json = all.rows
    // console.log(json)
    res.json(all.rows)
})
router.get('/api/traerRecurso/:id', async (req, res, next) => {
    let all = await pool.query(`select * from recurso where id = ${req.params.id}`);
    json = all.rows
    // console.log(json)
    res.json(all.rows)
})


router.post('/api/registrarArticulo', async (req, res, next) => {
    let body=req.body
    let all = await pool.query(`insert into articulo(titulo,introduccion,contenido,fecha,img,id_autor) values('${body.titulo}','${body.introduccion}','${body.contenido}','${body.fecha}','${body.img}',${body.id_autor})`);
    json = all.rows
    nuevoNombre=body.img;
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