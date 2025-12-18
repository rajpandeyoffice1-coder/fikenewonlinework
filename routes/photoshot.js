var express = require('express');
var router = express.Router();
var upload = require('./multer');
var pool = require('./pool')
var table = 'photoshot';


router.get('/',(req,res)=>{
    if(req.session.adminid){
    res.render('photoshot')
    }
    else{
        res.render('admin_login',{msg:'Please Login First'})
    }
})


router.post('/insert',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'image1', maxCount: 1 } , { name: 'image2', maxCount: 1 } , { name: 'image3', maxCount: 1 }]) ,(req,res)=>{
	let body = req.body
    if(req.files.image){
        body['image'] = req.files.image[0].filename
      
      }
      
        
      if(req.files.image1){
          body['image1'] = req.files.image1[0].filename
        }

        if(req.files.image2){
            body['image2'] = req.files.image2[0].filename
          }


          if(req.files.image3){
            body['image3'] = req.files.image3[0].filename
          }
      
        
    

      

console.log('body hai',req.body)



pool.query(`select * from ${table} where name = '${req.body.name}'`,(err,result)=>{
    if(err) throw err;
    else if(result[0]){
   res.json({
       status : 300,
       type:'exists',
       description:'Photoshot Already Exists'
   })
    }
    else{
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
    pool.query(`select * from ${table} where name='${req.body.name}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0]){
            if(result[0].id != req.body.id){
                res.json({
                    status : 300,
                    type:'exists',
                    description:'Photoshot Already Exists'
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



router.post('/update_image',upload.fields([{ name: 'image', maxCount: 1 }, { name: 'image1', maxCount: 1 },{ name: 'image2', maxCount: 1 },{ name: 'image3', maxCount: 1 }]), (req, res) => {
    let body = req.body



    
 console.log('files data',req.files)

if(req.files.image){
    body['image'] = req.files.image[0].filename
  
  }
  
    
  if(req.files.image1){
      body['image1'] = req.files.image1[0].filename
    }
  
    
  if(req.files.image2){
      body['image2'] = req.files.image2[0].filename
    }


    if(req.files.image3){
        body['image3'] = req.files.image3[0].filename
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
            res.redirect('/photoshot')
        }
    })
})



module.exports = router;