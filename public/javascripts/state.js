let categories = []

let table = 'state'

$('#show').click(function(){
  
$.getJSON(`${table}/all`, data => {
    categories = data
    makeTable(data)
    
  
})

})



$.getJSON(`country/all`, data => {
    countries = data
    fillDropDown('countryid', data, 'Choose Country', 0)
  
})



function fillDropDown(id, data, label, selectedid = 0) {
    $(`#${id}`).empty()
    $(`#${id}`).append($('<option>').val("null").text(label))

    $.each(data, (i, item) => {
        if (item.id == selectedid) {
            $(`#${id}`).append($('<option selected>').val(item.id).text(item.name))
        } else {
            $(`#${id}`).append($('<option>').val(item.id).text(item.name))
        }
    })
}


document.write('<script type="text/javascript" src="/javascripts/common.js" ></script>');

function makeTable(categories){
    let table = ` <div class="table-responsive">

    <button type="button" id="back" class="btn btn-primary" style="margin:20px">BacK</button>
    <button type="button" class="btn btn-primary float-right" id="exportBtn1" style="float: right;margin-top:25px;margin-right:20px">Export Data</button>
  
    <input type="text"  class="form-control" id="myInput" onkeyup="myFunction()" placeholder="Search Here.." title="Type in a name" style='margin-bottom:20px;margin-left:20px;margin-right:20px;'>
              
<table id="myTable" class="table table-bordered table-striped mb-0">
<thead>
<tr>
<th>Country</th>
<th>State</th>

<th>Options</th>
</tr>
</thead>
<tbody>`

$.each(categories,(i,item)=>{
table+=`<tr>

<td>${item.countryname}</td>
<td>${item.name}</td>



<td>
<a href="#!" class="btn btn-info btn-sm edits" id="${item.id}"><i class="feather icon-edit"></i>&nbsp;Edit </a>
<a href="#!" class="btn btn-danger btn-sm deleted" id="${item.id}"><i class="feather icon-trash-2"></i>&nbsp;Delete </a>
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


$('#result').on('click', '.deleted', function() {
    const id = $(this).attr('id')
     $.get(`${table}/delete`,  { id }, data => {
        refresh()
    })
})



$('#result').on('click', '.edits', function() {
    const id = $(this).attr('id')
    const result = categories.find(item => item.id == id);
    fillDropDown('pcountryid', countries, 'Choose Country', result.countryid);
  
    $('#editdiv').show()
    $('#result').hide()
    $('#insertdiv').hide() 
    $('#pid').val(result.id)
    $('#pname').val(result.name)
     $('#pquantity_type').val(result.quantity_type)
     $('#pcountryid').val(result.countryid)

  
   
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
        countryid:$('#pcountryid').val(),
     
        }

        $.post(`${table}/update`, updateobj , function(data) {
            if(data.status==300 || data.status == '300') alert(data.description);
            else update()
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
                name: "States.xlsx",
                sheet: {
                name: "Sheet1"
                }
              });
            });
      });
    