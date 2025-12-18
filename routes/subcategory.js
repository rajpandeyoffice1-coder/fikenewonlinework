var express = require('express');
var router = express.Router();
var upload = require('./multer');
var pool = require('./pool')
var table = 'subcategory';


router.get('/',(req,res)=>{
    if(req.session.adminid){
    res.render('subcategory')
    }
    else{
        res.render('admin_login',{msg:'Please Login First'})
    }
})


router.post('/insert',upload.single('image'),(req,res)=>{
	let body = req.body
    body['image'] = req.file.filename;
	pool.query(`insert into ${table} set ?`,body,(err,result)=>{
		if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
		else {
            res.json({
                status:200,
                type : 'success',
                description:'successfully added'
            })
        }
	})
})



router.get('/all',(req,res)=>{
	pool.query(`select s.* , 
    (select c.name from category c where c.id = s.categoryid) as categoryname
     from ${table} s order by name  `,(err,result)=>{
		if(err) throw err;
        else res.json(result)
	})
})



router.get('/delete', (req, res) => {
    const { id } = req.query
    pool.query(`delete from ${table} where id = ${id}`, (err, result) => {
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else {
            res.json({
                status:200,
                type : 'success',
                description:'successfully delete'
            })
        }
    })
})


router.post('/update', (req, res) => {
    pool.query(`update ${table} set ? where id = ?`, [req.body, req.body.id], (err, result) => {
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else {
            res.json({
                status:200,
                type : 'success',
                description:'successfully update'
            })
        }
    })
})



router.post('/update_image',upload.single('image'), (req, res) => {
    let body = req.body;

    body['image'] = req.file.filename

    pool.query(`update ${table} set ? where id = ?`, [req.body, req.body.id], (err, result) => {
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else {
            // res.json({
            //     status:200,
            //     type : 'success',
            //     description:'successfully update'
            // })
            res.redirect('/subcategory')
        }
    })
})



module.exports = router;