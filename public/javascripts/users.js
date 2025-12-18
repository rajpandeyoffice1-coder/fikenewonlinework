let categories = []

let table = 'customers'

let name = $('#name123').val()

// alert(name)

// alert(name)

  
$.getJSON(`/${table}/${name}`, data => {
    categories = data
    makeTable(data)
 
})

document.write('<script type="text/javascript" src="/javascripts/common.js" ></script>');

function makeTable(categories){
    let table = ` <div class="table-responsive">
    <button type="button" class="btn btn-primary float-right" id="exportBtn1" style="float: right;margin-top:25px;margin-right:20px">Export Data</button>

    <input type="text"  class="form-control" id="myInput" onkeyup="myFunction()" placeholder="Search Here.." title="Type in a name" style='margin-bottom:20px;margin-left:20px;margin-right:20px;margin-top:20px'>
              
<table id="myTable" class="table table-bordered table-striped mb-0">
<thead>
<tr>

<th>Name</th>
<th>Email</th>
<th>Password</th>
<th>Actions</th>
</tr>
</thead>
<tbody>`

$.each(categories,(i,item)=>{
table+=`<tr>

<td>${item.firstname}  ${item.lastname}</td>
<td>${item.email}</td>
<td>${item.password}</td>

<td><a href='/customers/wishlist/?number=${item.id}'>Wishlist</a></td>
<td><a href='/customers/cart/?number=${item.id}'>cart</a></td>




<td><a href='/customers/orders/?number=${item.id}'>Orders</a></td>`




table+=`<td>

</td>
</tr>`
})
table+=`</tbody>
</table>
</div>

    
  <!-- End Row -->`
      $('#result').html(table)
      $('#insertdiv').hide()
      $('#result').show()
}




$('#result').on('change', '.action', function() {
let a = $('#action').val()
window.location.href = `/customers/${a}`

})


$('#result').on('click', '.block', function() {
    let id = $(this).attr('id')
    let status = 'block'
    $.post('/customers/update',{id,status},data=>{
        window.location.href = `/customers`

    })
    
    })

    

    $('#result').on('click', '.unblock', function() {
        let id = $(this).attr('id')
   let status = ''
        $.post('/customers/update',{id,status},data=>{
            window.location.href = `/customers`
    
        })
        
        })
        


$('#result').on('click', '.deleted', function() {
    const id = $(this).attr('id')
     $.get(`${table}/delete`,  { id }, data => {
        refresh()
    })
})



$('#result').on('click', '.edits', function() {
    const id = $(this).attr('id')
    const result = categories.find(item => item.id == id);
  
    $('#editdiv').show()
    $('#result').hide()
    $('#insertdiv').hide() 
    $('#pid').val(result.id)
     $('#pname').val(result.name)
   
 })



 $('#result').on('click', '.updateimage', function() {
    const id = $(this).attr('id')
    const result = categories.find(item => item.id == id);
    $('#peid').val(result.id)
})



 
$('#update').click(function(){  //data insert in database
    let updateobj = {
        id: $('#pid').val(),
        name: $('#pname').val(),
       
        }

    $.post(`${table}/update`, updateobj , function(data) {
       update()
    })
})






function refresh() 
{
    $.getJSON(`${table}/all`, data => makeTable(data))
}
function update()
{
    $('#result').show()
    $('#editdiv').hide()
    $('#insertdiv').show() 
    refresh()
    refresh()
}

//================================Page Functionality=============================//
$('#editdiv').hide()
$('#updateimagediv').hide()

$('#result').on('click', '#back', function() {
    $('#result').hide()
    $('#insertdiv').show()
})

$('#back1').click(function(){
    $('#result').show()
    $('#insertdiv').hide()
    $('#editdiv').hide()
    $('#updateimagediv').hide()

})

$('#back2').click(function(){
    $('#result').show()
    $('#insertdiv').hide()
    $('#editdiv').hide()
    $('#updateimagediv').hide()
})

$('#result').on('click', '.updateimage', function() {
    $('#updateimagediv').show()
    $('#result').hide()
    $('#insertdiv').hide()
    $('#editdiv').hide()
})




$(document).ready(function () {
    $('#result').on('click', '#exportBtn1', function() {
    
            TableToExcel.convert(document.getElementById("myTable"), {
                name: "Users.xlsx",
                sheet: {
                name: "Sheet1"
                }
              });
            });
      });
    

