var express = require('express');
var router = express.Router();
const request = require('request');
var pool = require('./pool')
var table = 'booking'




 router.post('/login',(req,res)=>{
     pool.query(`select * from delievery where number = '${req.body.number}' and trackid = '${req.body.password}'`,(err,result)=>{
         if(err) throw err;
         else if(result[0]){
             res.json({
                 msg : 'success'
             })
         }
         else {
             res.json({
                 msg : 'failed'
             })
         }
     })
 })


router.post('/all-orders',(req,res)=>{
  pool.query(`select * from ${table} where partner_number = '${req.body.number}' and status = 'pending' order by id desc;`,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})



router.post('/ongoing-orders',(req,res)=>{
  pool.query(`select * from ${table} where partner_number = '${req.body.number}' and status != 'completed' and status!= 'cancel;'`,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})


router.post('/completed-orders',(req,res)=>{
  pool.query(`select * from ${table} where partner_number = '${req.body.number}' and status = 'completed'`,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})



router.post('/dispatch',(req,res)=>{
  pool.query(`update ${table} set ? where id = ?`, [req.body, req.body.id], (err, result) => {
    if(err) throw err;
    else {
      request(`http://mysmsshop.in/V2/http-api.php?apikey=gCuJ0RSBDLC3xKj6&senderid=SAFEDI&number=${req.body.number}&message=Hello ${req.body.name} , your order is ${req.body.status} successfuly. &format=json`, { json: true }, (err, result) => {
        if (err) { return console.log(err); }
        else {
          res.json({
            status:200,
            msg : 'success',
            description:'successfully added'
        })
        }
       
  })
    }
  })
})






router.post('/dispatch1',(req,res)=>{
  pool.query(`update ${table} set ? where id = ?`, [req.body, req.body.id], (err, result) => {
    if(err) throw err;
    else {
      request(`http://mysmsshop.in/V2/http-api.php?apikey=gCuJ0RSBDLC3xKj6&senderid=SAFEDI&number=${req.body.number}&message=Hello ${req.body.name} , your order is ${req.body.status} successfuly. Our Delivery Boy Name ${req.body.delivery_name} and his number ${req.body.delivery_number} &format=json`, { json: true }, (err, result) => {
        if (err) { return console.log(err); }
        else {
          res.json({
            status:200,
            msg : 'success',
            description:'successfully added'
        })
        }
       
  })
    }
  })
})








router.post('/check',(req,res)=>{
  pool.query(`select * from vendors where number = '${req.body.number}'`,(err,result)=>{
    if(err) throw err;
    else if(result[0]){
         res.json({
           msg : 'success'
         })
    }
    else {
      res.json({
        msg : 'user not found'
      })
    }
  })
})





router.post('/booking',(req,res)=>{
    pool.query(`select * from booking where assigned_number='${req.body.number}' and date between '${req.body.from_date}' and '${req.body.to_date}' order by date desc `,(err,result)=>{
        if(err) throw err;
        else {
            res.json({
                result
            })
        }
    })
})



router.post('/total-booking',(req,res)=>{
    pool.query(`select count(id) as counter from booking where assigned_number='${req.body.number}' order by id desc `,(err,result)=>{
        if(err) throw err;
        else {
            res.json(result)
        }
    })
})





router.post('/update-booking-status',(req,res)=>{
    pool.query(`update booking set status = 'NOt Delivered' , reason = '${req.body.reason}' where id = '${req.body.id}'`,(err,result)=>{
        if(err) throw err;
        else res.json({
            msg : 'success'
        })
    })
})







module.exports = router;
