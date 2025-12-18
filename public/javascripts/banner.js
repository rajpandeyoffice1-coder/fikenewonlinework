let categories = []

let table = 'banner'

$('#show').click(function(){
  
$.getJSON(`/${table}/all`, data => {
    categories = data
    makeTable(data)
    
  
})

})



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
    

      
document.write('<script type="text/javascript" src="/javascripts/common.js" ></script>');


function makeTable(categories){
      let table = ` <div class="table-responsive">

      <button type="button" id="back" class="btn btn-primary" style="margin:20px">BacK</button>
    <button type="button" class="btn btn-primary float-right" id="exportBtn1" style="float: right;margin-top:25px;margin-right:20px">Export Data</button>
    <input type="text"  class="form-control" id="myInput" onkeyup="myFunction()" placeholder="Search Here.." title="Type in a name" style='margin-bottom:20px;margin-left:20px;margin-right:20px;'>

    <table id="myTable" class="table table-bordered table-striped mb-0">
<thead>
<tr>
<th>Type</th>

<th>Image</th>
<th>Link</th>
<th>Tagline</th>
<th>Options</th>
</tr>
</thead>
<tbody>`

$.each(categories,(i,item)=>{
table+=`<tr>
<td>${item.type}</td>

<td>
<img src="/images/${item.image}" class="img-fluid img-radius wid-40" alt="" style="width:50px;height:50px">
</td>
<td>${item.link}</td>
<td>${item.tagline}</td>


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
    $('#plink').val(result.link)
    $('#ptagline').val(result.tagline)



     $('#ptype').val(result.type)
   
 })



 $('#result').on('click', '.updateimage', function() {
    const id = $(this).attr('id')
    
    const result = categories.find(item => item.id == id);
    $('#peid').val(result.id)
})



 
$('#update').click(function(){  //data insert in database
    let updateobj = {
        id: $('#pid').val(),
        name :$('#pname').val(),
        type: $('#ptype').val(),
        link: $('#plink').val(),
        tagline: $('#ptagline').val(),


       
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
                name: "Banners.xlsx",
                sheet: {
                name: "Sheet1"
                }
              });
            });
      });
    