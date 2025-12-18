var express = require('express');
var router = express.Router();
var upload = require('./multer');
var pool = require('./pool')
var table = 'category';
const fs = require("fs");
const fetch = require("node-fetch");


var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;



router.post('/index-category',(req,res)=>{
    var query = `select * from category order by id desc;`
    var query1 = `select sum(quantity) as counter from cart where usernumber ='${req.body.number}' and status is null;`
      var query2 = `select sum(c.price) as amount from cart c where 1 <= (select p.quantity from product p where p.id = c.booking_id ) and  c.usernumber = '${req.body.number}' and c.status is null;`
      var query3 = `select * from banner where type = 'Front Banner';`
      var query4 = `select  s.*,
                    (select su.name from subcategory su where su.id = s.subcategoryid) as subcategoryname, 
                    (select c.quantity from cart c where c.booking_id = s.id and c.usernumber = '${req.body.number}' and c.status is null  ) as userquantity,
                    (select si.name from size si where si.id = s.sizeid) as sizename
                     from product s order by id desc limit 5;`
      var query5 = `select * from banner where type = 'Bottom Banner';`
	pool.query(query+query1+query2+query3+query4+query5,(err,result)=>{
		if(err) throw err;
        else res.json(result)
	});
});






  router.get('/get-top-banner',(req,res)=>{
    pool.query(`select * from banner where type = 'Front Banner'`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })



router.get('/get-bottom-banner',(req,res)=>{
  pool.query(`select * from banner where type = 'Bottom Banner'`,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})



router.get('/get-products',(req,res)=>{
  var query2=` SELECT bannerid ,productid , (select t.name from promotional_text t where t.id = bannerid) as textname ,
  (select p.name from product p where p.id = productid) as productname,
  (select p.price from product p where p.id = productid) as productprice,
  (select p.quantity from product p where p.id = productid) as productquantity,
  (select p.discount from product p where p.id = productid) as productdiscount,
  (select p.image from product p where p.id = productid) as productimage,
  (select p.categoryid from product p where p.id = productid) as productcategoryid,
  (select p.subcategoryid from product p where p.id = productid) as productsubcategoryid,
  (select p.net_amount from product p where p.id = productid) as productnetamount,
  (select c.quantity from cart c where c.booking_id = productid and c.usernumber = '${req.query.number}'  ) as userquantity

  
    FROM
     (SELECT *,
                   ROW_NUMBER() OVER (PARTITION BY bannerid ORDER BY id DESC) as country_rank
       FROM promotional_text_management p) ranked
    WHERE country_rank <= 4 order by bannerid desc;`
  var query3 = `select * from promotional_text order by id desc;`
  pool.query(query2+query3,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})









router.post('/services1',(req,res)=>{
  var query = `select  s.*,
  (select su.name from subcategory su where su.id = s.subcategoryid) as subcategoryname, 
  (select c.quantity from cart c where c.booking_id = s.id and c.usernumber = '${req.body.number}' and c.status is null  ) as userquantity,
  (select si.name from size si where si.id = s.sizeid) as sizename
   from product s order by id desc limit 5;`
var query1 = `select sum(quantity) as counter from cart where usernumber ='${req.body.number}' and status is null;`
  var query2 = `select sum(c.price) as amount from cart c where 1 <= (select p.quantity from product p where p.id = c.booking_id ) and  c.usernumber = '${req.body.number}' and c.status is null;;`
  
pool.query(query+query1+query2,(err,result)=>{
    if(err) throw err;
    else res.json(result)
})
})



router.get('/',(req,res)=>{
    res.send('hi')
})


router.get('/allcategory',(req,res)=>{
	pool.query(`select * from category `,(err,result)=>{
		if(err) throw err;
        else res.json(result)
	})
})



router.post('/subcategory',(req,res)=>{
      var query = `select s.* , (select c.name from category c where c.id = s.categoryid) as categoryname from subcategory s where s.categoryid = '${req.body.categoryid}';`
        var query1 = `select sum(quantity) as counter from cart where usernumber ='${req.body.number}' and status is null;`
      var query2 = `select sum(c.price) as amount from cart c where 1 <= (select p.quantity from product p where p.id = c.booking_id ) and  c.usernumber = '${req.body.number}' and c.status is null;;`
      pool.query(query+query1+query2,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
})



router.post('/services',(req,res)=>{
      var query = `select  s.*,
                    (select su.name from subcategory su where su.id = s.subcategoryid) as subcategoryname, 
                    (select c.quantity from cart c where c.booking_id = s.id and c.usernumber = '${req.body.number}' and c.status is null  ) as userquantity,
                    (select si.name from size si where si.id = s.sizeid) as sizename
                     from product s where s.subcategoryid = '${req.body.subcategoryid}';`
   var query1 = `select sum(quantity) as counter from cart where usernumber ='${req.body.number}' and status is null;`
      var query2 = `select sum(c.price) as amount from cart c where 1 <= (select p.quantity from product p where p.id = c.booking_id ) and  c.usernumber = '${req.body.number}' and c.status is null;;`
      
    pool.query(query+query1+query2,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
})















// Cart Api


// router.post('/cart',(req,res)=>{
//     let body = req.body;
//     pool.query(`select * from product where id = '${req.body.booking_id}'`,(err,result)=>{
//         if(err) throw err;
//         else {

//         }
//     })
// })


router.post("/cart", (req, res) => {
  let body = req.body;
  console.log(req.body);
        pool.query(
          `select * from product where id = "${req.body.booking_id}" `,
          (err, result) => {
            if (err) throw err;
            else {
              body["categoryid"] = result[0].categoryid;
              body["subcategoryid"] = result[0].subcategoryid;
              body["price"] = result[0].price;
              body["oneprice"] = result[0].price;
              body["quantity"] = "1";
              body["price"] = req.body.price;
              var qua = "1";
              pool.query(
                `select * from cart where usernumber = '${req.body.usernumber}'`,
                (err, result) => {
                  if (err) throw err;
                  else if (result[0]) {
                    if (req.body.categoryid == result[0].categoryid) {
                      if (req.body.booking_id == result[0].booking_id) {
                        pool.query(
                          `update cart set quantity = quantity+${qua} , price = price+${req.body.price} where booking_id = '${req.body.booking_id}' and usernumber = '${req.body.usernumber}'`,
                          (err, result) => {
                            if (err) throw err;
                            else {
                              res.json({
                                msg: "updated sucessfully",
                              });
                            }
                          }
                        );
                      } else {
                        pool.query(
                          `insert into cart set ?`,
                          body,
                          (err, result) => {
                            if (err) throw err;
                            else {
                              res.json({
                                msg: "updated sucessfully",
                              });
                            }
                          }
                        );
                      }
                    } else {
                    pool.query(
                      `insert into cart set ?`,
                      body,
                      (err, result) => {
                        if (err) throw err;
                        else {
                          res.json({
                            msg: "updated sucessfully",
                          });
                        }
                      }
                    );
                    }
                  } else {
                    pool.query(
                      `insert into cart set ?`,
                      body,
                      (err, result) => {
                        if (err) throw err;
                        else {
                          res.json({
                            msg: "updated sucessfully",
                          });
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      });

router.post("/cart/replace", (req, res) => {
  let body = req.body;
  console.log(req.body);
  pool.query(
    `select * from product where id = "${req.body.booking_id}" `,
    (err, result) => {
      if (err) throw err;
      else {
        body["categoryid"] = result[0].categoryid;
        body["subcategoryid"] = result[0].subcategoryid;
        body["price"] = result[0].price;
        body["oneprice"] = result[0].price;
        body["quantity"] = "1";
        body["price"] = req.body.price;

        pool.query(
          `delete from cart where usernumber = '${req.body.usernumber}'`,
          (err, result) => {
            if (err) throw err;
            else {
              pool.query(`insert into cart set ?`, body, (err, result) => {
                if (err) throw err;
                else {
                  res.json({
                    msg: "updated sucessfully",
                  });
                }
              });
            }
          }
        );
      }
    }
  );
});


router.post("/cart/all", (req, res) => {
    pool.query(
      `select * from cart where usernumber = '${req.body.usernumber}'`,
      (err, result) => {
        if (err) throw err;
        else res.json(result);
      }
    );
 
});

router.post("/mycart", (req, res) => {
 
    var query = `select c.*,(select s.name from product s where s.id = c.booking_id) as servicename
    ,(select s.image from product s where s.id = c.booking_id) as productlogo,
    (select s.quantity from product s where s.id = c.booking_id) as productquantity,
      (select si.name from size si where si.id = c.booking_id) as sizename
    from cart c where c.usernumber = '${req.body.usernumber}' and c.status is null;`
    var query1 = `select count(id) as counter from cart where usernumber = '${req.body.usernumber}' and status is null;`
    var query2 = `select sum(c.price) as total_ammount from cart c where c.quantity <= (select p.quantity from product p where p.id = c.booking_id ) and  c.usernumber = '${req.body.usernumber}' and c.status is null;`
    var query3 = `select c.*,(select s.name from product s where s.id = c.booking_id) as servicename
    ,(select s.image from product s where s.id = c.booking_id) as productlogo,
    (select s.quantity from product s where s.id = c.booking_id) as productquantity,
      (select si.name from size si where si.id = c.booking_id) as sizename
    from cart c where c.quantity <= (select p.quantity from product p where p.id = c.booking_id ) and c.usernumber = '${req.body.usernumber}' and c.status is null;`
    var query4 = `select count(id) as counter from cart c where c.quantity <= (select p.quantity from product p where p.id = c.booking_id ) and c.usernumber = '${req.body.usernumber}' and c.status is null`
    pool.query(query+query1+query2+query3+query4, (err, result) => {
      if (err) throw err;
      else if (result[0][0]) {
        req.body.mobilecounter = result[1][0].counter;
        console.log("MobileCounter", req.body.mobilecounter);
        res.json(result);
      } else
        res.json({
          msg: "empty cart",
        });
    });

});


router.post("/cartupdate", (req, res) => {
  if (process.env.encryptedkey == req.body.key) {
    pool.query(
      `select id,price,oneprice,quantity from cart where id = "${req.body.id}"`,
      (err, result) => {
        if (err) throw err;
        else {
          console.log(result[0]);
          pool.query(
            `update cart set price = price + oneprice , quantity = quantity+1  where id = "${req.body.id}"`,
            (err, result) => {
              err
                ? console.log(err)
                : res.json({
                    msg: "updated successfully",
                  });
            }
          );
        }
      }
    );
  } else {
    res.json({
      type: "error",
      description: "404 Not Found",
    });
  }
});

// ===============================
// PINCODE → CITY / STATE API
// ===============================
router.get("/map/:pincode", async (req, res) => {
  const { pincode } = req.params;

  // validation
  if (!/^\d{6}$/.test(pincode)) {
    return res.status(400).json({
      success: false,
      message: "Invalid pincode"
    });
  }

  try {
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`
    );
    const data = await response.json();

    if (
      !data[0] ||
      data[0].Status !== "Success" ||
      !data[0].PostOffice
    ) {
      return res.status(404).json({
        success: false,
        message: "Pincode not found"
      });
    }

    const postOffice = data[0].PostOffice[0];

    return res.json({
      success: true,
      pincode: pincode,
      city: postOffice.District,
      state: postOffice.State,
      country: postOffice.Country
    });

  } catch (err) {
    console.error("Pincode API error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


router.post("/cartdelete", (req, res) => {
  if (process.env.encryptedkey == req.body.key) {
    pool.query(
      `select id,price,quantity from cart where id = "${req.body.id}"`,
      (err, result) => {
        if (err) throw err;
        else if (result[0].quantity > 1) {
          console.log(result[0]);
          pool.query(
            `update cart set price = price - (price/quantity) , quantity = quantity-1  where id = "${req.body.id}"`,
            (err, result) => {
              err
                ? console.log(err)
                : res.json({
                    msg: "deleted successfully",
                  });
            }
          );
        } else {
          pool.query(
            `delete from cart where id = "${req.body.id}"`,
            (err, result) => {
              err
                ? console.log(err)
                : res.json({
                    msg: "deleted successfully",
                  });
            }
          );
        }
      }
    );
  } else {
    res.json({
      type: "error",
      description: "404 Not Found",
    });
  }
});



router.post('/signup',(req,res)=>{
    let body = req .body
    body['date'] = today
    pool.query(`select * from pincode where name = '${req.body.pincode}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0]){
             pool.query(`select * from users where number  = '${req.body.number}'`,(err,result)=>{
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else if(result[0]) {
          res.json({
              status : 100,
              type:'failed',
              description : 'already registered'
          })
        }
        else{
         pool.query(`insert into users set ?`,body,(err,result)=>{
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
                    description:'successfully registered'
                })
             }
         })
        }
    })
        }
        else {
            res.json({
                msg : 'area not covered'
            })
        }
    })
   
})





router.post('/check',(req,res)=>{
  pool.query(`select * from pincode where name = '${req.body.pincode}'`,(err,result)=>{
    if(err) throw err;
    else if(result[0]){
     res.json({
        msg : 'success'
    })
    }
    else {
      res.json({
        msg : 'area not covered'
    })
    }
  })
})



router.post('/running-orders',(req,res)=>{
	pool.query(`select * from booking where number = '${req.body.number}' and status!='completed' order by id desc `,(err,result)=>{
		if(err) throw err;
        else res.json(result)
	})
})




router.post('/orders/history',(req,res)=>{
	pool.query(`select * from booking where number = '${req.body.number}' and status = 'completed' order by id desc `,(err,result)=>{
		if(err) throw err;
        else res.json(result)
	})
})



router.post('/orders/cancel',(req,res)=>{
	pool.query(`select * from cancel_booking where number = '${req.body.number}' order by id desc `,(err,result)=>{
		if(err) throw err;
        else res.json(result)
	})
})




router.post('/cancel-order',(req,res)=>{
    let body = req.body
                pool.query(`insert into cancel_booking set ?`,body,(err,result)=>{
        if(err) throw err;
        else {
            pool.query(`delete from booking where id = '${req.body.orderid}'`,(err,result)=>{
                if(err) throw err;
                else {
                    res.json({
                        msg : 'success'
                    })
                }
            })
        }
    })
})




router.post('/orders',(req,res)=>{
    let body = req.body;
    body['date'] = today
    body['status'] = 'pending'
    pool.query(`insert into booking set ?`,body,(err,result)=>{
        if(err) throw err;
        else {
          let insertId = result.insertId

          pool.query(`select * from cart c where c.quantity <= (select p.quantity from product p where p.id = c.booking_id ) and c.usernumber = '${req.body.number}' and c.status is null`,(err,result)=>{
            if(err) throw err;
            else {
          //    res.json(result)
              for(i=0;i<result.length;i++){
                let booking_id = result[i].booking_id
                pool.query(`update product set quantity = quantity - '${result[i].quantity}' where id = '${result[i].booking_id}'`,(err,result)=>{
                  if(err) throw err;
                  else {
                    pool.query(`update cart set status = 'booked' , orderid = '${insertId}' where usernumber = '${req.body.number}' and booking_id ='${booking_id}' and status is null`,(err,result)=>{
                      if(err) throw err;
                      else {
                           res.json({
                  msg :'success'
              })
                      }
                  })
                  }
                })
              }
            
            
            }
          })
           
           
        }
       
    })
})



router.get('/time',(req,res)=>{

  var today = new Date();
  var newdate = new Date();
  newdate.setDate(today.getDate() + 5);
  
  
  
  
  var dd = today.getDate();
  
  var futuretime = today.getHours() + 2 + ":" + today.getMinutes();
  
  
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  var a = newdate.getDate()
  var b = newdate.getMonth() + 1;
  if (dd < 10) {
    dd = '0' + dd;
  
  }
  
  if (a < 10) {
    a = '0' + a;
  }
  
  
  if (mm < 10) {
    mm = '0' + mm;
  }
  
  
  if (b < 10) {
    b = '0' + b;
  }
  today = yyyy + '-' + mm + '-' + dd;
  
  var my = newdate.toLocaleDateString()
  var my1 = newdate.getFullYear() + '-' + b + '-' + a
  /*onsole.log(today)
  //console.log(newdate)
  console.log(my1)*/

    pool.query(`select * from time where date>= CURDATE() and status = 'Available'`,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
})







router.post("/cart-handler", (req, res) => {
        let body = req.body
        console.log(req.body)
        if (req.body.quantity == "0" || req.body.quantity == 0) {
        pool.query(`delete from cart where booking_id = '${req.body.booking_id}' and  usernumber = '${req.body.usernumber}' and status is null`,(err,result)=>{
            if (err) throw err;
            else {
              res.json({
                msg: "updated sucessfully",
              });
            }
        })
        }
        else {
            pool.query(`select oneprice from cart where booking_id = '${req.body.booking_id}' and  categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}' and status is null`,(err,result)=>{
                if (err) throw err;
                else if (result[0]) {
                   // res.json(result[0])
                    pool.query(`update cart set quantity = ${req.body.quantity} , price = ${result[0].oneprice}*${req.body.quantity}  where booking_id = '${req.body.booking_id}' and categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}'`,(err,result)=>{
                        if (err) throw err;
                        else {
                            res.json({
                              msg: "updated sucessfully",
                            });
                          }

                    })
                }
                else {
                  body["price"] = (req.body.price)*(req.body.quantity)
                     pool.query(`insert into cart set ?`, body, (err, result) => {
                     if (err) throw err;
                     else {
                       res.json({
                         msg: "updated sucessfully",
                       });
                     }
                   });

                }

            })
        }

})




router.post('/get-single-product-details',(req,res)=>{
    pool.query(`select p.*, 
    (select c.quantity from cart c where c.booking_id = '${req.body.id}' and c.usernumber = '${req.body.number}' ) as userquantity,
    (select w.id from wishlist w where w.booking_id ='${req.body.id}' and w.usernumber = '${req.body.number}') as iswishlist
    from product p where p.id = '${req.body.id}'`,(err,result)=>{
        if(err) throw err;
        else res.json(result);
    })
})



router.post('/get-single-cancel-booking-details',(req,res)=>{
    
     var query = `select * from cancel_booking where id = '${req.body.id}';`
   var query1 = `select c.*,(select s.name from product s where s.id = c.booking_id) as servicename
    ,(select s.image from product s where s.id = c.booking_id) as productlogo,
      (select si.name from size si where si.id = c.booking_id) as sizename
    from cart c where c.usernumber = '${req.body.usernumber}' and orderid = '${req.body.orderid}';`
    var query2 = `select count(id) as counter from cart where usernumber = '${req.body.usernumber}' and orderid = '${req.body.orderid}';`
    var query3 = `select sum(price) as total_ammount from cart where usernumber = '${req.body.usernumber}'  and orderid = '${req.body.orderid}';`
    pool.query(query+query1+query2+query3,(err,result)=>{
        if(err) throw err;
        else res.json(result);
    })
   
    // pool.query(`select * from cancel_booking where id = '${req.body.id}'`,(err,result)=>{
    //     if(err) throw err;
    //     else res.json(result);
    // })
})



router.post('/get-single-booking-details',(req,res)=>{
    var query = `select * from booking where id = '${req.body.id}';`
   var query1 = `select c.*,(select s.name from product s where s.id = c.booking_id) as servicename
    ,(select s.image from product s where s.id = c.booking_id) as productlogo,
      (select si.name from size si where si.id = c.booking_id) as sizename
    from cart c where c.usernumber = '${req.body.usernumber}' and c.orderid = '${req.body.id}';`
    var query2 = `select count(id) as counter from cart where usernumber = '${req.body.usernumber}' and orderid = '${req.body.id}';`
    var query3 = `select sum(price) as total_ammount from cart where usernumber = '${req.body.usernumber}'  and orderid = '${req.body.id}';`
    pool.query(query+query1+query2+query3,(err,result)=>{
        if(err) throw err;
        else res.json(result);
    })
})



// router.post('/reorder',(req,res)=>{
//     let data  = []
    
    
//     if(req.body.status=='fromcancel'){
//          pool.query(`select categoryid , subcategoryid , booking_id , number  , amount  , name , address , pincode , quantity , orderid as id from cancel_booking where id = '${req.body.id}'`,(err,result)=>{
//         if(err) throw err;
//         else {
           
//               data  = result[0]
//            //    res.json(data)
//             data['status'] = 'pending'
//             data['time'] = req.body.time
//             data['order_date'] = today
//             data['date'] = req.body.date
            
//               pool.query(`insert into booking set ?`,data,(err,result)=>{
//         if(err) throw err;
//         else res.json({
//             msg :'success'
//         })
//     })
        
                
//         }
//     })
//     }
//     else {
//          pool.query(`select categoryid , subcategoryid , booking_id , number  , amount , status , name , address , pincode , quantity   from booking where id = '${req.body.id}'`,(err,result)=>{
//         if(err) throw err;
//         else {
           
//               data  = result[0]
//            //    res.json(data)
//             data['status'] = 'pending'
//             data['time'] = req.body.time
//             data['order_date'] = today
//             data['date'] = req.body.date
//               pool.query(`insert into booking set ?`,data,(err,result)=>{
//         if(err) throw err;
//         else res.json({
//             msg :'success'
//         })
//     })
        
                
//         }
//     })
//     }
    
   
// })























router.post('/reorder',(req,res)=>{
  let data  = []
    pool.query(`select usernumber , booking_id , categoryid , subcategoryid , price , quantity , oneprice from cart where orderid = '${req.body.id}'`,(err,result)=>{
          if(err) throw err;
          else {
            console.log('result nikla ',result[0])
              
               for(i=0;i<result.length;i++){

              pool.query(`insert into cart set ?`,result[i],(err,result)=>{
                if(err) throw err;
                console.log('result aaya ',result)
              })
            }
            res.json({msg:'success'})
           }
        })

})



// api create krni h booking data ki

// router.post("/get-booking-specification", (req, res) => {
//   pool.query(
//     `select booking_id from booking where id = '${req.body.id}'`,
//     (err, result) => {
//       if (err) throw err;
//       else {
//         let count = result[0].booking_id.split(",").length;
//         var array = result[0].booking_id.split(",");
//         res.json({
//           count: count,
//           result: array,
//         });
//         // console.log(result[0].booking_id)
//         //  console.log("Count : ",result[0].booking_id.split(",").length);
//         // var array = result[0].booking_id.split(',');
//         // console.log('array',array[0])
//       }
//     }
//   );
// });






router.post('/remove-all-data',(req,res)=>{
    pool.query(`delete from cart where usernumber = '${req.body.number}'`,(err,result)=>{
        if(err) throw err;
        else {
            res.json({
                msg : 'success'
            })
        }
    })
})






router.post('/remove-all-data-by-id',(req,res)=>{
    pool.query(`delete from cart where usernumber = '${req.body.number}' and id ='${req.body.id}'`,(err,result)=>{
        if(err) throw err;
        else {
            res.json({
                msg : 'success'
            })
        }
    })
})







// wish list api


router.post('/save-wishlist',(req,res)=>{
  let body = req.body;
  console.log('body h',req.body)

pool.query(`select * from wishlist where usernumber = '${req.body.usernumber}' and booking_id = '${req.body.booking_id}'`,(err,result)=>{
  if(err) throw err;
  else if(result[0]) {
    pool.query(`delete from wishlist where usernumber = '${req.body.usernumber}' and booking_id = '${req.body.booking_id}'`,(err,result)=>{
      if(err) throw err;
      else  res.json({
        msg : 'success'
    })
    })
  }
  else {
    pool.query(`insert into wishlist set ?`,body,(err,result)=>{
      if(err) throw err;
      else res.json({
          msg : 'success'
      })
  })
  }
})

 
})



router.post('/mywishlist',(req,res)=>{
  pool.query(`select t.*,
  (select p.name from product p where p.id = t.booking_id) as productname,
  (select p.price from product p where p.id = t.booking_id) as productprice,
  (select p.quantity from product p where p.id = t.booking_id) as productquantity,
  (select p.discount from product p where p.id = t.booking_id) as productdiscount,
  (select p.image from product p where p.id = t.booking_id) as productimage,
  (select p.categoryid from product p where p.id = t.booking_id) as productcategoryid,
  (select p.subcategoryid from product p where p.id = t.booking_id) as productsubcategoryid,
  (select p.net_amount from product p where p.id = t.booking_id) as productnetamount ,
  (select c.quantity from cart c where c.booking_id = t.booking_id and c.usernumber = '${req.body.usernumber}'  ) as userquantity
  from wishlist t where usernumber = '${req.body.usernumber}'`,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})










router.get('/search',(req,res)=>{
   var query = `select p.*,
   (select c.quantity from cart c where c.booking_id = p.id and c.usernumber = '${req.query.number}'  ) as userquantity
   from product p where p.keywords Like '%${req.query.search}%';`
    pool.query(query,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
})







router.get('/get-address',(req,res)=>{
  pool.query(`select * from address where usernumber = '${req.query.usernumber}'`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
  })
})



router.post('/save-address',(req,res)=>{
  let body = req.body;
  console.log('body h',req.body)
  pool.query(`insert into address set ?`,body,(err,result)=>{
      if(err) throw err;
      else res.json({
          msg : 'success'
      })
  })
})




router.get('/delete-address',(req,res)=>{
  pool.query(`delete from address where id = '${req.query.id}'`,(err,result)=>{
    if(err) throw err;
    else res.json({msg:'success'})
  })
})



router.get('/get-single-address',(req,res)=>{
  pool.query(`select * from address where id = '${req.query.id}'`,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})




router.post('/update-address', (req, res) => {
  console.log('data',req.body)
  pool.query(`update address set ? where id = ?`, [req.body, req.body.id], (err, result) => {
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




router.get('/get-single-profile',(req,res)=>{
  pool.query(`select * from users where number = '${req.query.usernumber}'`,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})




router.post('/update-profile', (req, res) => {
  console.log(req.body)
  pool.query(`update users set ? where number = ?`, [req.body, req.body.number], (err, result) => {
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




router.get('/get-notification',(req,res)=>{
  pool.query(`select * from offer  where type = 'notification' order by id desc`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
  })
})




router.get('/get-alert',(req,res)=>{
  pool.query(`select * from offer  where type = 'alert' order by id desc limit 1`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
  })
})







router.post("/payment-initiate", (req, res) => {
  const url = `https://rzp_live_wdTkjI7Ba4b5qN:rxR0Prlwb9Gz7HctbrpukFOe@api.razorpay.com/v1/orders/`;
  const data = {
    amount: req.body.amount * 100, // amount in the smallest currency unit
    //amount:100,
    currency: "INR",
    payment_capture: true,
  };
  console.log("data", data);
  const options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };
  fetch(url, options)
    .then((res) => res.json())
    .then((resu) => res.send(resu));
});

router.get("/demo", (req, res) => {
  res.render("dem");
});

router.get("/demo1", (req, res) => {
  console.log('demo1 data',req.query);
  res.send(req.query);
});

router.post("/razorpay-response", (req, res) => {
  let body = req.body;
  console.log("response recieve", body);

  if (body.razorpay_signature) {
    res.redirect("/api/success_razorpay");
  } else {
    res.redirect("/api/failed_payment");
  }
});

router.get("/success_razorpay", (req, res) => {
  res.json({
    msg: "success",
  });
});

router.get("/failed_payment", (req, res) => {
  res.json({
    msg: "failed",
  });
});

router.post("/failed_payment", (req, res) => {
  res.json({
    msg: "failed",
  });
});








router.post('/deposit-cash',(req,res)=>{
  let body = req.body
  let extra = 0;
  let bonus = 0;
  console.log(req.body)
 
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  
  today = mm + '/' + dd + '/' + yyyy;



  body['date'] = today
  console.log('response',req.body)

pool.query(`select * from deposit_cash where number = '${req.body.number}'`,(err,result)=>{
  if(err) throw err;
 
  else{

      pool.query(`insert into deposit_cash set ?`,req.body , (err,result)=>{
          if(err) throw err;
          else {
              pool.query(`update users set deposit_cash = deposit_cash+${req.body.amount} where number = '${req.body.number}'`,(err,result)=>{
                   if(err) throw err;
                   else {
                       pool.query(`insert into transcations (name , number , date , amount , color , sign) values('Deposit Cash','${req.body.number}','${req.body.date}', '${req.body.amount}','green','+')`,(err,result)=>{
                           if(err) throw err;
                           else {
                            res.json({
                                msg :'success'
                            })
                        }
                       })
  
                   }
              })
          }
      })
      
      
      
     

  }
})

  
      })





      router.post('/transcations',(req,res)=>{
        pool.query(`select * from transcations where number='${req.body.number}' order by id desc limit 30`,(err,result)=>{
            if(err) throw err;
            else {
                res.json({
                    result
                })
            }
        })
    })



    router.post('/transcations-by-date',(req,res)=>{
      pool.query(`select * from transcations where number='${req.body.number}' and date between '${req.body.from_date}' and '${req.body.to_date}' order by date desc `,(err,result)=>{
          if(err) throw err;
          else {
              res.json({
                  result
              })
          }
      })
  })



  router.post('/total-amount',(req,res)=>{
    console.log(req.body)
    var query = `select sum(price) as total_amount from cart where usernumber = '${req.body.number}';`
    var query1 = `select sum(quantity) as counter from cart where usernumber = '${req.body.number}';`
    pool.query(query+query1,(err,result)=>{
          if(err) throw err;
          else res.json(result)
    })
  })




  router.post('/single-booking-details',(req,res)=>{
    pool.query(`select * from booking where id = '${req.body.booking_id}'`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })



  router.post('/single-order-details',(req,res)=>{
    var query = `select b.* , 
    (select p.name from product p where p.id = b.booking_id) as productname,
    (select p.image from product p where p.id = b.booking_id) as productimage,
    (select s.name from size s where s.id = (select p.sizeid from product p where p.id = b.booking_id ) ) as productsize
    from booking b where b.orderid = '${req.body.orderid}';`
    var query1 = `select sum(price) as totalprice from booking where orderid = '${req.body.orderid}';`
    pool.query(query+query1,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })




  router.get('/general-faq',(req,res)=>{
    pool.query(`select * from faq where type = 'General Question'`,(err,result)=>{
       if(err) throw err;
       else res.json(result)
    })
  })



  
  router.get('/wallet-faq',(req,res)=>{
    pool.query(`select * from faq where type = 'Wallet Question'`,(err,result)=>{
       if(err) throw err;
       else res.json(result)
    })
  })





  router.get('/new-subcategory',(req,res)=>{
    pool.query(`select * from subcategory where categoryid = '${req.query.categoryid}'`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })

  












router.post('/update-booking-status',(req,res)=>{
    pool.query(`update booking set ? where orderid = ?`, [req.body, req.body.orderid],(err,result)=>{
        if(err) throw err;
        else res.json({
          msg : 'success'
        })
    })
})






router.get('/view-all-product',(req,res)=>{
  console.log('que',req.query)
  var query = `select t.* ,   
    (select p.name from product p where p.id = t.productid) as productname,
    (select p.price from product p where p.id = t.productid) as productprice,
    (select p.quantity from product p where p.id = t.productid) as productquantity,
    (select p.discount from product p where p.id = t.productid) as productdiscount,
    (select p.image from product p where p.id = t.productid) as productimage,
    (select p.categoryid from product p where p.id = t.productid) as productcategoryid,
    (select p.subcategoryid from product p where p.id = t.productid) as productsubcategoryid,
    (select p.net_amount from product p where p.id = t.productid) as productnetamount ,
  (select c.quantity from cart c where c.booking_id = t.productid and c.usernumber = '${req.query.number}'  ) as userquantity

    from banner_manage t where t.bannerid = '${req.query.id}' `
    pool.query(query,(err,result)=>{
      if(err) throw err;
     else res.json(result)
    })
})




router.get('/view-all-text-product',(req,res)=>{
  console.log('que',req.query)
  var query = `select t.* ,   
    (select p.name from product p where p.id = t.productid) as productname,
    (select p.price from product p where p.id = t.productid) as productprice,
    (select p.quantity from product p where p.id = t.productid) as productquantity,
    (select p.discount from product p where p.id = t.productid) as productdiscount,
    (select p.image from product p where p.id = t.productid) as productimage,
    (select p.categoryid from product p where p.id = t.productid) as productcategoryid,
    (select p.subcategoryid from product p where p.id = t.productid) as productsubcategoryid,
    (select p.net_amount from product p where p.id = t.productid) as productnetamount ,
  (select c.quantity from cart c where c.booking_id = t.productid and c.usernumber = '${req.query.number}'  ) as userquantity

    from promotional_text_management t where t.bannerid = '${req.query.id}' `
    pool.query(query,(err,result)=>{
      if(err) throw err;
     else res.json(result)
    })
})




router.get('/show-all-promotional-text',(req,res)=>{
  pool.query(`select * from promotional_text order by id desc`,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})





router.get('/promotional/text/delete', (req, res) => {
  let body = req.body
  pool.query(`delete from promotional_text where id = ${req.query.id}`, (err, result) => {
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


router.post('/promotional/text/update', (req, res) => {
  pool.query(`update promotional_text set ? where id = ?`, [req.body, req.body.id], (err, result) => {
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







router.post('/promotional/text/update_image',upload.single('image'), (req, res) => {
  let body = req.body;
  body['image'] = req.file.filename


pool.query(`update promotional_text set ? where id = ?`, [req.body, req.body.id], (err, result) => {
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

          res.redirect('/banner/new-promotional-text')
      }
  })




 
})




router.get('/get-faq',(req,res)=>{
  pool.query(`select * from faq order by id desc`,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})


router.get('/get-faq/delete',(req,res)=>{
  pool.query(`delete from faq where id = '${req.query.id}'`,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})




router.post('/update-faq', (req, res) => {
  pool.query(`update faq set ? where id = ?`, [req.body, req.body.id], (err, result) => {
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





router.get('/all-website-customize',(req,res)=>{
  pool.query(`select * from website_customize`,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})








router.get('/get-faq/website',(req,res)=>{
  pool.query(`delete from website_customize where id = '${req.query.id}'`,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})




router.post('/update-website', (req, res) => {
  pool.query(`update website_customize set ? where id = ?`, [req.body, req.body.id], (err, result) => {
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






router.post('/order-now',(req,res)=>{
  let body = req.body;
// console.log('body',req.body)
  let cartData = req.body

  console.log('CardData',cartData)



    console.log('CardData',cartData)

       body['status'] = 'pending'
        
    
      var today = new Date();
    var dd = today.getDate();
    
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    if(dd<10) 
    {
      dd='0'+dd;
    } 
    
    if(mm<10) 
    {
      mm='0'+mm;
    } 
    today = yyyy+'-'+mm+'-'+dd;
    
    
    body['date'] = today
    
    
    
      var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var result = '';
      for ( var i = 0; i < 12; i++ ) {
          result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
      }
     orderid = result;
    
    
      
     console.log(req.body)
    
    
     pool.query(`select * from cart where usernumber = '${req.body.usernumber}'`,(err,result)=>{
         if(err) throw err;
         else {
    
         let data = result
    
         for(i=0;i<result.length;i++){
          data[i].name = req.body.name
          data[i].date = today
          data[i].orderid = orderid
          data[i].status = 'pending'
          data[i].number = req.body.usernumber
          data[i].usernumber = req.body.usernumber
          data[i].payment_mode = 'cash'
          data[i].address = req.body.address
          data[i].id = null
          data[i].pincode = req.body.pincode
          data[i].order_date = today
          data[i].time = req.body.time
          data[i].razropay_order_id = req.body.txnid
    
    
         }
    
    
       
    
    for(i=0;i<data.length;i++) {
      console.log('quantity1',data[i].quantity)
    
    let quantity = data[i].quantity;
    let booking_id = data[i].booking_id;
    
     pool.query(`insert into booking set ?`,data[i],(err,result)=>{
             if(err) throw err;
             else {
        
    
    pool.query(`update product set quantity = quantity - ${quantity} where id = '${booking_id}'`,(err,result)=>{
     if(err) throw err;
     else {
    
     }
    
    })
    
             }
        })
    }
    
    
      
    
    
    pool.query(`delete from cart where usernumber = '${req.body.usernumber}'`,(err,result)=>{
      if(err) throw err;
      else {
        res.json({
          msg : 'success'
        })
      }
    })
    
    
         }
     })


  

 
})








router.post('/pay_by_wallet',(req,res)=>{
  let body = req.body;
// console.log('body',req.body)
  let cartData = req.body

  console.log('CardData',cartData)



    console.log('CardData',cartData)

       body['status'] = 'pending'
        
    
      var today = new Date();
    var dd = today.getDate();
    
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    if(dd<10) 
    {
      dd='0'+dd;
    } 
    
    if(mm<10) 
    {
      mm='0'+mm;
    } 
    today = yyyy+'-'+mm+'-'+dd;
    
    
    body['date'] = today
    
    
    
      var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var result = '';
      for ( var i = 0; i < 12; i++ ) {
          result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
      }
     orderid = result;
    
    
      
     console.log(req.body)
    


     pool.query(`select * from users where number = '${req.body.usernumber}'`,(err,result)=>{
       if(err) throw err;
       else if((+result[0].deposit_cash) >= (+req.body.price)) {
        pool.query(`select * from cart where usernumber = '${req.body.usernumber}'`,(err,result)=>{
          if(err) throw err;
          else {
     
          let data = result
     
          for(i=0;i<result.length;i++){
           data[i].name = req.body.name
           data[i].date = today
           data[i].orderid = orderid
           data[i].status = 'pending'
           data[i].number = req.body.usernumber
           data[i].usernumber = req.body.usernumber
           data[i].payment_mode = 'cash'
           data[i].address = req.body.address
           data[i].id = null
           data[i].pincode = req.body.pincode
           data[i].order_date = today
           data[i].time = req.body.time
           data[i].razropay_order_id = req.body.txnid
     
     
          }
     
     
        
     
     for(i=0;i<data.length;i++) {
       console.log('quantity1',data[i].quantity)
     
     let quantity = data[i].quantity;
     let booking_id = data[i].booking_id;
     
      pool.query(`insert into booking set ?`,data[i],(err,result)=>{
              if(err) throw err;
              else {
         
     
     pool.query(`update product set quantity = quantity - ${quantity} where id = '${booking_id}'`,(err,result)=>{
      if(err) throw err;
      else {
     
      }
     
     })
     
              }
         })
     }
     
     
       
     
     
     pool.query(`delete from cart where usernumber = '${req.body.usernumber}'`,(err,result)=>{
       if(err) throw err;
       else {
         res.json({
           msg : 'success'
         })
       }
     })
     
     
          }
      }) 
       }
       else {

res.json({
  msg : 'Low Balance'
})

       }
     })

    
 


  

 
})












router.post('/login-check',(req,res)=>{
  pool.query(`select * from users where number = '${req.body.number}'`,(err,result)=>{
    if(err) throw err;
    else if(result[0]){
      res.json({
        msg : 'success'
      })
    }
    else{
      res.json({
        msg : 'fail'
      })
    }
  })
})





router.get('/pincode',(req,res)=>{
  pool.query(`select * from pincode order by area`,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})



router.post('/wallet',(req,res)=>{
  pool.query(`select * from users where number = '${req.body.number}'`,(err,result)=>{
    if(err) throw err;
    else res.json(result)
  })
})




router.get('/charges',(req,res)=>{
  pool.query(`select * from delivery_charges`,(err,result)=>{
    if(err) throw err;
    else res.json(result);
  })
})





module.exports = router;




// remaining api

// coupon  , refer & earn , 