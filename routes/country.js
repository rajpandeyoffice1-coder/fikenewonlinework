var express = require('express');
var router = express.Router();
var upload = require('./multer');
var pool = require('./pool')
var table = 'country';
const fs = require("fs");



router.get('/',(req,res)=>{
    if(req.session.adminid){
        res.render('country')
    }
    else {
        res.render('admin_login',{msg:'Please Login First'})
    }
  // res.render('category')
    
})


router.post('/storeEditId',(req,res)=>{
    req.session.editStoreId = req.body.id
    res.send('success')
})


router.post('/insert',(req,res)=>{
	let body = req.body
    
    pool.query(`select * from ${table} where name = '${req.body.name}' and from_weight = '${req.body.from_weight}' and to_weight = '${req.body.to_weight}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0]){
       res.json({
           status : 300,
           type:'exists',
           description:'Country Already Exists'
       })
        }
        else{
            pool.query(`insert into ${table} set ?`,body,(err,result)=>{
                if(err) {
            console.log(err)

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
        }
    })
})



router.get('/all',(req,res)=>{
	pool.query(`select * from ${table} `,(err,result)=>{
		if(err) throw err;
        else res.json(result)
	})
})



router.get('/delete', (req, res) => {
    let body = req.body
    pool.query(`delete from ${table} where id = ${req.query.id}`, (err, result) => {
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
    console.log(req.body)
    pool.query(`select * from ${table} where name='${req.body.name}' and from_weight = '${req.body.from_weight}' and to_weight = '${req.body.to_weight}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0]){
            if(result[0].id != req.body.id){
                res.json({
                    status : 300,
                    type:'exists',
                    description:'Category Already Exists'
                })
            }
            else {
                pool.query(`update ${table} set ? where id = ?`, [req.body, req.body.id], (err, result) => {
                    if(err) throw err;
                    else {
                        res.json({
                            status:200,
                            type : 'success',
                            description:'successfully update'
                        })
                    }
                })
            }
           
        }
        else {
            pool.query(`update ${table} set ? where id = ?`, [req.body, req.body.id], (err, result) => {
                if(err) throw err;
                else {
                    res.json({
                        status:200,
                        type : 'success',
                        description:'successfully update'
                    })
                }
            })
        }
    })
 
})





router.post('/update_image',upload.single('image'), (req, res) => {
    let body = req.body;
    body['image'] = req.file.filename


    pool.query(`select image from ${table} where id = '${req.body.id}'`,(err,result)=>{
        if(err) throw err;
        else {
            fs.unlinkSync(`public/images/${result[0].image}`); 


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

            res.redirect('/category')
        }
    })


        }
    })

  
   
})



module.exports = router;