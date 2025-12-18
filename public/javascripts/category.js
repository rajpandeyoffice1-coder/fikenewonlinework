$(function () {
$('#result').on('click', 'th', function() {

  
        var index = $(this).index(),
            rows = [],
            thClass = $(this).hasClass('asc') ? 'desc' : 'asc';
  
        $('#myTable th').removeClass('asc desc');
        $(this).addClass(thClass);
  
        $('#myTable tbody tr').each(function (index, row) {
          rows.push($(row).detach());
        });
  
        rows.sort(function (a, b) {
          var aValue = $(a).find('td').eq(index).text(),
              bValue = $(b).find('td').eq(index).text();
  
          return aValue > bValue
               ? 1
               : aValue < bValue
               ? -1
               : 0;
        });
  
        if ($(this).hasClass('desc')) {
          rows.reverse();
        }
  
        $.each(rows, function (index, row) {
          $('#myTable tbody').append(row);
        });
      });
  });




let categories = []

let table = 'category'

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
    <button type="button" class="btn btn-primary float-right" id="exportBtn1" style="float: right;margin-top:25px;margin-right:20px">Export Data</button>

    <input type="text"  class="form-control" id="myInput" onkeyup="myFunction()" placeholder="Search Here.." title="Type in a name" style='margin-bottom:20px;margin-left:20px;margin-right:20px;'>
              
       <table id="myTable" class="table table-bordered table-striped mb-0">
<thead>
<tr>

<th>Name</th>
<th>Description</th>
<th>Image</th>

<th>Options</th>
</tr>
</thead>
<tbody>`

$.each(categories,(i,item)=>{
table+=`<tr>
<td>${item.name}</td>
<td style='background-color:white;width:450px'>${item.description}</td>


<td>
<img src="/images/${item.image}" class="img-fluid img-radius wid-40" alt="" style="width:50px;height:50px">
</td>

<td>
<a href="#!" class="btn btn-info btn-sm edits" id="${item.id}"><i class="feather icon-edit"></i>&nbsp;Edit </a>
<a href="#!" class="btn btn-info btn-sm updateimage"  id="${item.id}"><i class="feather icon-edit"></i>&nbsp;Edit Image </a>
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
  
    $('#editdiv').show()
    $('#result').hide()
    $('#insertdiv').hide() 
    $('#pid').val(result.id)
     $('#pname').val(result.name)

     let table = `<p>${result.description}</p>
     `
     $('.peditor').html(table)
   
 })



 $('#result').on('click', '.updateimage', function() {
    const id = $(this).attr('id')
    const result = categories.find(item => item.id == id);
    $('#peid').val(result.id)
})



 
$('#update').click(function(){  //data insert in database

    let content = $(".peditor").html().trim();

    let updateobj = {
        id: $('#pid').val(),
        name: $('#pname').val(),
        description : content

       
        }

    $.post(`${table}/update`, updateobj , function(data) {
        if(data.status==300 || data.status == '300') alert(data.description);
        else update()
    //    
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
            name: "Categories.xlsx",
            sheet: {
            name: "Sheet1"
            }
          });
        });
  });


