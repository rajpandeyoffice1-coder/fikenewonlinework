var express = require('express');
var router = express.Router();
var upload = require('./multer');
var pool = require('./pool')
var table = 'blog';


router.get('/',(req,res)=>{
    if(req.session.adminid){
    res.render('blog')
    }
    else{
        res.render('admin_login',{msg:'Please Login First'})
    }
})


router.post('/insert',upload.single('image') ,(req,res)=>{
	let body = req.body
    // console.log(req.file)
    if(req.file.filename){
        body['image'] = req.file.filename
      
      }
      
     
        
    

      

console.log('body hai',req.body)



        pool.query(`insert into ${table} set ?`,body,(err,result)=>{
            if(err) {
                console.log('eroor',err)
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
	pool.query(`select s.* 
    from ${table} s `,(err,result)=>{
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
    console.log(req.body)
  
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
        
})



router.post('/update_image',upload.single('image'), (req, res) => {
    let body = req.body
    
 console.log('files data',req.files)

 if(req.file.filename){
    body['image'] = req.file.filename
  
  }
  

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
            res.redirect('/blog')
        }
    })
})



module.exports = router;