var express = require('express');
var router = express.Router();
var upload = require('./multer');
var pool = require('./pool')

var table = 'testimonials';


router.get('/',(req,res)=>{
    res.render('testimonials')
})


router.post('/insert',(req,res)=>{
	let body = req.body
	// console.log(req.body)'
    pool.query(`select * from ${table} where name='${req.body.name}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0]){
            res.json({
                status : 300,
                type:'exists',
                description:'Category Already Exists'
            })
        }
        else {
            pool.query(`insert into ${table} set ?`,body,(err,result)=>{
                if(err) throw err;
                else res.json({
                    status:200,
                    type : 'success',
                    description:'successfully update'
                })
            })
        }
    })

})


router.get('/show',(req,res)=>{
	pool.query(`select * from ${table}`,(err,result)=>{
		err ? console.log(err) : res.json(result)
	})
})



router.get('/delete', (req, res) => {
    const { id } = req.query
    pool.query(`delete from ${table} where id = ${id}`, (err, result) => {
        if(err) throw err;
        else res.json(result);
    })
})

router.post('/update', (req, res) => {
    console.log(req.body)
    pool.query(`select * from ${table} where name='${req.body.name}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0]){
            if(result[0].id != req.body.id){
                res.json({
                    status : 300,
                    type:'exists',
                    description:'Testimonials Already Exists'
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



module.exports = router;