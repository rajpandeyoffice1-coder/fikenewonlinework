let categories = []

let table = 'delivery'

$('#show').click(function(){
  
$.getJSON(`${table}/all`, data => {
    categories = data
    makeTable(data)
    
  
})

})


document.write('<script type="text/javascript" src="/javascripts/common.js" ></script>');

function makeTable(categories){
    let table = ` <div class="table-responsive">

    <button type="button" id="back" class="btn btn-primary" style="margin:20px">BacK</button>
    <input type="text"  class="form-control" id="myInput" onkeyup="myFunction()" placeholder="Search Here.." title="Type in a name" style='margin-bottom:20px;margin-left:20px;margin-right:20px;'>
              
<table id="myTable" class="table table-bordered table-striped mb-0">
<thead>
<tr>
<th>Name</th>
<th>Trackid</th>

<th>Number</th>
<th>Options</th>
</tr>
</thead>
<tbody>`

$.each(categories,(i,item)=>{
table+=`<tr>
<td><a href='/delivery/details?number=${item.number}'>${item.name}</a></td>
<td>${item.trackid}</td>

<td>${item.number}</td>
<td>
<a href="#!" class="btn btn-info btn-sm details" id="${item.id}"><i class="feather icon-edit"></i>&nbsp;View Details </a>

<a href="#!" class="btn btn-info btn-sm edits" id="${item.id}"><i class="feather icon-edit"></i>&nbsp;Edit </a>
<a href="#!" class="btn btn-danger btn-sm deleted" id="${item.id}"><i class="feather icon-trash-2"></i>&nbsp;Delete </a>
</td>`
if(item.status=='Block'){

table+= `<td><a href="#!" class="btn btn-danger btn-sm unblock" id="${item.id}"><i class="feather icon-trash-2"></i>&nbsp;Unblock </a></td>`
}
else {
    table+= `<td><a href="#!" class="btn btn-warning btn-sm block" id="${item.id}"><i class="feather icon-trash-2"></i>&nbsp;Block </a></td>`

}



table+=`
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


$('#result').on('click', '.deleted', function() {
    const id = $(this).attr('id')
     $.get(`${table}/delete`,  { id }, data => {
        refresh()
    })
})



$('#result').on('click', '.block', function() {
    const id = $(this).attr('id')
    const status = 'Block'
   
          $.post(`${table}/update`, {id,status} , function(data) {
           update()
        })
 
})



$('#result').on('click', '.unblock', function() {
    const id = $(this).attr('id')
    const status = ''
   
    $.post(`${table}/update`, {id,status} , function(data) {
     update()
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
     $('#pnumber').val(result.number)
     $('#ptrackid').val(result.trackid)
   
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
        number:$('#pnumber').val(),
        trackid:$('#ptrackid').val()
       
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


