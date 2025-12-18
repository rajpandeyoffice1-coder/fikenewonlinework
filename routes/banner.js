var express = require('express');
var router = express.Router();
var upload = require('./multer');
var pool = require('./pool')
var table = 'banner';
const fs = require("fs");
const app = require('../app');
const { json } = require('express');



router.get('/',(req,res)=>{
    if(req.session.adminid){
        res.render('banner')
    }
    else {
        res.render('admin_login',{msg:'Please Login First'})
    }
  // res.render('category')
    
})








router.get('/management',(req,res)=>{
    if(req.session.adminid){
        pool.query(`select p.* ,
        (select c.name from category c where c.id = p.categoryid) as categoryname,
        (select s.name from subcategory s where s.id = p.categoryid) as subcategoryname

         from product p`,(err,result)=>{
            if(err) throw err;
            else res.render('banner_management',{result})
            //else res.json(result)
        })
        
    }
    else {
        res.render('admin_login',{msg:'Please Login First'})
    }
  // res.render('category')
    
})









router.get('/new-promotional-text',(req,res)=>{
    if(req.session.adminid){
    res.render('new-promotional-text')
    }
    else{
        res.render('admin_login',{msg:'Please Login First'})
    }
})



router.post('/promotional/text/insert',upload.single('image'),(req,res)=>{
    let body = req.body
    body['image'] = req.file.filename;
    pool.query(`insert into promotional_text set ?`,body,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
})




router.get('/promotional-text-management',(req,res)=>{
    if(req.session.adminid){
        pool.query(`select p.* ,
        (select c.name from category c where c.id = p.categoryid) as categoryname,
        (select s.name from subcategory s where s.id = p.categoryid) as subcategoryname

         from product p`,(err,result)=>{
            if(err) throw err;
            else res.render('promotional-text-management',{result})
        })
        
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


router.post('/insert',upload.single('image'),(req,res)=>{
	let body = req.body
    body['image'] = req.file.filename;

    if(req.body.type == 'About Video'){
        pool.query(`select * from ${table} where type = 'About Video'`,(err,result)=>{
            if(err) throw err;
            else if(result[0]){
                res.json({
                    status:300,
                    type : 'success',
                    description:'Video Already Uploaded..You can edit the video'
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
                            description:'Successfully Inserted'
                        })
                        
                    }
                })
            }
        })
    }
    else {
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
                console.log(result)

                res.json({
                    status:200,
                    type : 'success',
                    description:'Successfully Inserted'
                })
                
            }
        })
    }



})



router.get('/all',(req,res)=>{
	pool.query(`select * from ${table} `,(err,result)=>{
		if(err) throw err;
        else res.json(result)
	})
})




router.get('/all/promotional/text',(req,res)=>{
	pool.query(`select * from promotional_text `,(err,result)=>{
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

            res.redirect('/banner')
        }
    })


})


router.post('/management/insert',(req,res)=>{
    let body = req.body;
    console.log(req.body)

    let c = JSON.parse(req.body.b)

    console.log('c',c)
    for(i=0;i<c.length;i++){
        let d = c[i]
        pool.query(`select * from banner_manage where bannerid = '${req.body.bannerid}' and productid = '${d}'`,(err,result)=>{
            if(err) throw err;
            else if(result[0]) {
                           
            }
            else{
                pool.query(`insert into banner_manage(bannerid , productid) values('${req.body.bannerid}' , '${d}')`,(err,result)=>{
                    if(err) throw err;
                    else {

                    }
                })
            }
        })
    }
    res.json({
        msg : 'success'
    })
})






router.post('/promotional/management/insert',(req,res)=>{
    let body = req.body;
    console.log(req.body)

    let c = JSON.parse(req.body.b)

    console.log('c',c)
    for(i=0;i<c.length;i++){
        let d = c[i]
        pool.query(`select * from promotional_text_management where bannerid = '${req.body.bannerid}' and productid = '${d}'`,(err,result)=>{
            if(err) throw err;
            else if(result[0]) {
                           
            }
            else{
                pool.query(`insert into promotional_text_management(bannerid , productid) values('${req.body.bannerid}' , '${d}')`,(err,result)=>{
                    if(err) throw err;
                    else {

                    }
                })
            }
        })
    }
    res.json({
        msg : 'success'
    })
})





router.get('/details',(req,res)=>{
    var query = `select t.* ,   
      (select p.name from product p where p.id = t.productid) as productname,
      (select p.price from product p where p.id = t.productid) as productprice,
      (select p.quantity from product p where p.id = t.productid) as productquantity,
      (select p.discount from product p where p.id = t.productid) as productdiscount,
      (select p.image from product p where p.id = t.productid) as productimage,
      (select p.categoryid from product p where p.id = t.productid) as productcategoryid,
      (select p.subcategoryid from product p where p.id = t.productid) as productsubcategoryid,
      (select p.net_amount from product p where p.id = t.productid) as productnetamount 
      from banner_manage t where t.bannerid = '${req.query.id}' `
      pool.query(query,(err,result)=>{
        if(err) throw err;
       else res.render('banner_details',{result})
      })
  })


  router.get('/details/delete',(req,res)=>{
      console.log(req.query.id)
      pool.query(`delete from banner_manage where id = '${req.query.id}'`,(err,result)=>{
          if(err) throw err;
          else res.json({
              msg : 'success'
          })
      })
  })



  router.get('/promotional/details',(req,res)=>{
    var query = `select t.* ,   
      (select p.name from product p where p.id = t.productid) as productname,
      (select p.price from product p where p.id = t.productid) as productprice,
      (select p.quantity from product p where p.id = t.productid) as productquantity,
      (select p.discount from product p where p.id = t.productid) as productdiscount,
      (select p.image from product p where p.id = t.productid) as productimage,
      (select p.categoryid from product p where p.id = t.productid) as productcategoryid,
      (select p.subcategoryid from product p where p.id = t.productid) as productsubcategoryid,
      (select p.net_amount from product p where p.id = t.productid) as productnetamount 
      from promotional_text_management t where t.bannerid = '${req.query.id}' `
      pool.query(query,(err,result)=>{
        if(err) throw err;
       else res.render('banner_details1',{result})
      })
  })



  router.get('/details1/delete',(req,res)=>{
    console.log(req.query.id)
    pool.query(`delete from promotional_text_management where id = '${req.query.id}'`,(err,result)=>{
        if(err) throw err;
        else res.json({
            msg : 'success'
        })
    })
})



module.exports = router;