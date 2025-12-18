var express = require('express');

var router = express.Router();
var pool = require('./pool')
var table = 'admin';
const request = require('request');
var deliveryApi = require('./delivery');


var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd; 


router.get('/',(req,res)=>{
    res.render('admin_login',{msg : ''})
})


router.get('/logout',(req,res)=>{
    req.session.adminid = null;
    res.redirect('/admin')
})


const nodemailer = require('nodemailer');

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  host: 'smtpout.secureserver.net', // GoDaddy's SMTP server
  port: 465, // Secure port for SSL
  secure: true,
  auth: {
    user: 'info@fikaonline.in', // Your GoDaddy email address
    pass: 'Fika@1234', // Your GoDaddy email password
  },
});

router.get('/change-password', (req, res) => {
  const otp = Math.floor(Math.random() * 100000) + 1;

  console.log('otp send',otp)

  const mailOptions = {
    from: '"Fika Online" <info@fikaonline.in>',
    to: 'Amitali910@gmail.com',
    subject: 'Your OTP for Password Change – FIKA',
    html: `<p>Use the following OTP to change your FIKA account password:</p>
           <h2 style="color: #0061ff;">${otp}</h2>
           <p>This OTP is valid for a limited time. Do not share it with anyone.</p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending OTP email:', error);
      return res.render('change-password', { msg: 'Failed to send OTP email. Please try again.' });
    } else {
      console.log('OTP email sent:', info.response);
      req.session.otp = otp;
      res.render('change-password', { msg: '' });
    }
  });
});





router.post('/change-password',(req,res)=>{

    if(req.session.otp == req.body.otp){
 pool.query(`update admin set password = '${req.body.password}'`,(err,result)=>{
     if(err) throw err;
     else res.render('admin_login',{msg:''})
 })
    }
    else {
        res.render('change-password',{msg:'Invalid OTP'})
    }
       
    })

router.post('/login',(req,res)=>{
    pool.query(`select * from ${table} where email = '${req.body.email}' and password = '${req.body.password}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0]){
          req.session.adminid = result[0].id
          res.redirect('/admin/dashboard')
        }
        else {
            res.render('admin_login',{msg : 'Invalid Username & Password'})
        }
    })
})


router.get('/dashboard',(req,res)=>{
    if(req.session.adminid){
    var query = `select count(id) as total from category;`
    var query2 = `select count(id) as total from product;`
    var query3 =  `select count(id) as total from users;`
    var query4 = `select count(id) as total from booking where status != 'completed';`
    var query5 = `select count(id) as total from booking where status = 'completed';`
    var query6 = `SELECT COUNT(id) AS total FROM booking WHERE status IN ('replacement', 'replacement_accept');`;
    var query7 = `select sum(price) as total from booking;`
    var query8 = `select sum(price) as total from booking where date = '${today}';`
    var query9 = `select b.* , 
                (select p.name from product p where p.id = b.booking_id) as productname,
                (select u.email from users u where u.id = b.usernumber) as usermobilenumber
                
                from booking b where b.status != 'Completed' and status != 'Cancel' order by id desc;`
    var query10 = `select * from delivery_charges;`
    pool.query(query+query2+query3+query4+query5+query6+query7+query8+query9+query10,(err,result)=>{
if(err) throw err;
else res.render('dashboard',{result:result})
    })
     
    }
    else {
        res.render('admin_login',{msg : 'Please Login'})
    }
})




// Utility function to get today's date in MM/DD/YYYY format
function getFormattedDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
}

// Route to update order status
// router.get('/update-status', async (req, res) => {
//     try {
//         const { status, id } = req.query;
//         console.log(req.querya)
//         if (!status || !id) return res.status(400).json({ error: 'Missing status or order ID' });

//         const today = getFormattedDate();

//         if (status === 'Cancel') {
//             // Fetch Shiprocket order ID
//             pool.query(`SELECT * FROM shipping WHERE channel_order_id = ?`, [id], async (err, result) => {
//                 if (err) {
//                     console.error('Database error:', err);
//                     return res.status(500).json({ error: 'Database query failed' });
//                 }

//                 console.log('result',result)

//                 if (result.length === 0) return res.status(404).json({ error: 'Order not found in shipping' });

//                 const shiprocketId = result[0].order_id;
//                 const token = await deliveryApi.shippingAuthLogin();
//                 const shippingResponse = await deliveryApi.cancelOrders(token, [shiprocketId]);

//                 console.log('Shipping Order Response:', shippingResponse);

//                 // Update booking status
//                 pool.query(`UPDATE booking SET status = ? WHERE orderid = ?`, [status, id], (err) => {
//                     if (err) {
//                         console.error('Error updating booking status:', err);
//                         return res.status(500).json({ error: 'Failed to update booking status' });
//                     }

//                     // Fetch user details
//                     pool.query(`SELECT * FROM booking WHERE orderid = ?`, [id], (err, result) => {
//                         if (err) {
//                             console.error('Error fetching booking details:', err);
//                             return res.status(500).json({ error: 'Failed to fetch booking' });
//                         }

//                         if (result.length === 0) return res.status(404).json({ error: 'Booking not found' });

//                         const { usernumber, orderid } = result[0];

//                         // Insert alert
//                         pool.query(
//                             `INSERT INTO alert (usernumber, status, orderid, date) VALUES (?, ?, ?, ?)`,
//                             [usernumber, status, orderid, today],
//                             (err) => {
//                                 if (err) {
//                                     console.error('Error inserting alert:', err);
//                                     return res.status(500).json({ error: 'Failed to insert alert' });
//                                 }
//                                 res.json({ msg: 'success' });
//                             }
//                         );
//                     });
//                 });
//             });
//         } else {
//             // Update booking status for non-cancel cases
//             pool.query(`UPDATE booking SET status = ?  WHERE id = ?`, [status, id], (err) => {
//                 if (err) {
//                     console.error('Error updating booking status:', err);
//                     return res.status(500).json({ error: 'Failed to update booking status' });
//                 }

//                 // Fetch user details
//                 pool.query(`SELECT * FROM booking WHERE id = ?`, [id], (err, result) => {
//                     if (err) {
//                         console.error('Error fetching booking details:', err);
//                         return res.status(500).json({ error: 'Failed to fetch booking' });
//                     }

//                     if (result.length === 0) return res.status(404).json({ error: 'Booking not found' });

//                     const { usernumber, orderid } = result[0];

//                     // Insert alert
//                     pool.query(
//                         `INSERT INTO alert (usernumber, status, orderid, date) VALUES (?, ?, ?, ?)`,
//                         [usernumber, status, orderid, today],
//                         (err) => {
//                             if (err) {
//                                 console.error('Error inserting alert:', err);
//                                 return res.status(500).json({ error: 'Failed to insert alert' });
//                             }
//                             res.json({ msg: 'success' });
//                         }
//                     );
//                 });
//             });
//         }
//     } catch (error) {
//         console.error('Unexpected error:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });



router.get('/update-status', async (req, res) => {
    try {
        const { status, id, awb } = req.query;
        console.log(req.query);

        if (!status || !id) {
            return res.status(400).json({ error: 'Missing status or order ID' });
        }

        const today = getFormattedDate();

        if (status === 'Cancel') {
            // Fetch Shiprocket order ID
            pool.query(`SELECT * FROM shipping WHERE channel_order_id = ?`, [id], async (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database query failed' });
                }

                console.log('result', result);

                if (result.length === 0) {
                    return res.status(404).json({ error: 'Order not found in shipping' });
                }

                const shiprocketId = result[0].order_id;
                const token = await deliveryApi.shippingAuthLogin();
                const shippingResponse = await deliveryApi.cancelOrders(token, [shiprocketId]);

                console.log('Shipping Order Response:', shippingResponse);

                // Update booking status
                pool.query(`UPDATE booking SET status = ? WHERE orderid = ?`, [status, id], (err) => {
                    if (err) {
                        console.error('Error updating booking status:', err);
                        return res.status(500).json({ error: 'Failed to update booking status' });
                    }

                    // Fetch user details
                    pool.query(`SELECT * FROM booking WHERE orderid = ?`, [id], (err, result) => {
                        if (err) {
                            console.error('Error fetching booking details:', err);
                            return res.status(500).json({ error: 'Failed to fetch booking' });
                        }

                        if (result.length === 0) {
                            return res.status(404).json({ error: 'Booking not found' });
                        }

                        const { usernumber, orderid } = result[0];

                        // Insert alert
                        pool.query(
                            `INSERT INTO alert (usernumber, status, orderid, date) VALUES (?, ?, ?, ?)`,
                            [usernumber, status, orderid, today],
                            (err) => {
                                if (err) {
                                    console.error('Error inserting alert:', err);
                                    return res.status(500).json({ error: 'Failed to insert alert' });
                                }
                                res.json({ msg: 'success' });
                            }
                        );
                    });
                });
            });
        } else {
            let updateQuery = `UPDATE booking SET status = ? WHERE id = ?`;
            let queryParams = [status, id];

            if (status === 'Dispatched' && awb) {
                updateQuery = `UPDATE booking SET status = ?, awb = ? WHERE id = ?`;
                queryParams = [status, awb, id];
            }

            // Update booking status (and AWB if applicable)
            pool.query(updateQuery, queryParams, (err) => {
                if (err) {
                    console.error('Error updating booking status:', err);
                    return res.status(500).json({ error: 'Failed to update booking status' });
                }

                // Fetch user details
                pool.query(`SELECT * FROM booking WHERE id = ?`, [id], (err, result) => {
                    if (err) {
                        console.error('Error fetching booking details:', err);
                        return res.status(500).json({ error: 'Failed to fetch booking' });
                    }

                    if (result.length === 0) {
                        return res.status(404).json({ error: 'Booking not found' });
                    }

                    const { usernumber, orderid } = result[0];

                    // Insert alert
                    pool.query(
                        `INSERT INTO alert (usernumber, status, orderid, date) VALUES (?, ?, ?, ?)`,
                        [usernumber, status, orderid, today],
                        (err) => {
                            if (err) {
                                console.error('Error inserting alert:', err);
                                return res.status(500).json({ error: 'Failed to insert alert' });
                            }
                            res.json({ msg: 'success' });
                        }
                    );
                });
            });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});






router.post('/update/booking/status',(req,res)=>{
    pool.query(`update booking set ? where id = ?`, [req.body, req.body.id], (err, result) => {

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





router.post('/charges/update',(req,res)=>{
    pool.query(`update delivery_charges set charges = '${req.body.charges}' , set_charges = '${req.body.set_charges}'`,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
})


router.get('/support',(req,res)=>{
    if(req.session.adminid){
        pool.query(`select h.* , 
        (select u.firstname from users u where u.id = h.usernumber) as userfirstname,
        (select u.lastname from users u where u.id = h.usernumber) as userlasttname

        from helpdesk h where h.status = 'Online' order by id desc`,(err,result)=>{
            if(err) throw err;
            else res.render('support',{result:result});
        })
    }
    else {
        res.render('admin_login',{msg : 'Invalid Username & Password'})

    }
})




router.get('/support-closed',(req,res)=>{
    if(req.session.adminid){
        pool.query(`select h.* ,
        (select u.firstname from users u where u.id = h.usernumber) as userfirstname,
        (select u.lastname from users u where u.id = h.usernumber) as userlasttname

        from helpdesk h where h.status = 'Closed' order by id desc`,(err,result)=>{
            if(err) throw err;
            else res.render('support',{result:result});
        })
    }
    else {
        res.render('admin_login',{msg : 'Invalid Username & Password'})

    }
})




router.get('/closed-ticket',(req,res)=>{
    if(req.session.adminid){
        pool.query(`select h.* 
        (select u.firstname from users u where u.id = h.usernumber) as userfirstname,
        (select u.lastname from users u where u.id = h.usernumber) as userlasttname

        from helpdesk h where h.status = 'Closed' order by id desc`,(err,result)=>{
            if(err) throw err;
            else res.render('support',{result:result});
        })
    }
    else {
        res.render('admin_login',{msg : 'Invalid Username & Password'})

    }
})
module.exports = router;
