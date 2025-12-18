let categories = []
let subcategories = []

let services = []
let brands = []
let sizes = []
start()





$.getJSON(`/category/all`, data => {
    categories = data
    fillDropDown('categoryid', data, 'Choose Category', 0)
})


$.getJSON(`/size/all`, data => {
    sizes = data
    fillDropDown('sizeid', data, 'Choose Size', 0)
})




$.getJSON(`/subcategory/all`, data => {
    subcategories = data
    fillDropDown('subcategoryid', [], 'Choose Subcategory', 0)
})


$.getJSON(`/brand/all`, data => {
    brands = data
    fillDropDown('brandid', [], 'Choose Brand', 0)
})

$('#categoryid').change(() => {
    const filteredData = subcategories.filter(item => item.categoryid == $('#categoryid').val())
    fillDropDown('subcategoryid', filteredData, 'Choose Subcategory', 0)
})


$('#categoryid').change(() => {
    const filteredData = brands.filter(item => item.categoryid == $('#categoryid').val())
    fillDropDown('brandid', filteredData, 'Choose Brand', 0)
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

$('#show').click(function(){
$.getJSON(`/api/all-website-customize`, data => {
    console.log(data)
    services = data
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
<th>Type</th>


<th>Option</th>

</tr>
</thead>
<tbody>`

$.each(categories,(i,item)=>{
table+=`<tr>

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




$('#result').on('click', '.deleted', function () {
    const id = $(this).attr('id')
    $.get(`/get-website/delete`, { id }, data => {
        refresh()
    })
})

let selectedSubcategory = 0


$('#pcategoryid').change(() => {
    const filteredData = subcategories.filter(item => item.categoryid == $('#pcategoryid').val())
    fillDropDown('psubcategoryid', filteredData, 'Choose Sub-Category', 0)
})






$('#pcategoryid').change(() => {
    const filteredData = brands.filter(item => item.categoryid == $('#pcategoryid').val())
    fillDropDown('pbrandid', filteredData, 'Choose Brand', 0)
})



$('#result').on('click', '.edits', function () {
    


  
    const id = $(this).attr('id')
    const result = services.find(item => item.id == id);

  



    edit()
    $('#pid').val(result.id)
    $('#pname').val(result.name)
    $('#ptype').val(result.type)
  
// $('.peditor').val(result.description);
console.log('dhdg',result.content)
// $container.html($container.text());
//  $('#pextra').val(result.extra);
 //$('#peid').val(result.id)

 let table = `<p>${result.content}</p>
       `
       $('.peditor').html(table)


    // $container.html($container.text());
  //  $('#pextra').val(result.extra);
     //$('#peid').val(result.id)
    
})



$('#result').on('click', '.updateimage', function() {
    const id = $(this).attr('id')
    const result = services.find(item => item.id == id);
    $('#peid').val(result.id)
})


$('#update').click(function () {  //data insert in database
    let content = $(".peditor").html().trim();
// alert('hi')
    let updateobj = {
        id: $('#pid').val(),
       name: $('#pname').val(),
        content:content
       
    }

    $.post(`/api/update-website`, updateobj, function (data) {
      update()
    })
})



function start()
{
$('#editdiv').hide()
$('#back').hide()
$('#insertdiv').show()
$('#updateimagediv').hide()
$('#result').hide()

}
function insert()
{
     $('#insertdiv').show(1000)
    $('#back').show()
    $('#refresh').hide()
    $('#result').hide()
    $('#editdiv').hide()
}
function back()
{
    $('#refresh').show()
    $('#editdiv').hide()
    $('#back').hide()
    $('#insertdiv').hide()
    $('#result').show(1000)
}
function insertdata()
{
    $('#editdiv').hide()
    $('#back').hide()
    $('#insertdiv').hide()
    $('#refresh').show()
    $('#result').show()
    refresh()
}
function edit()
{
    $('#back').show()
    $('#refresh').hide()
    $('#editdiv').show()
    $('#result').hide()
}
function update()
{
    $('#result').show()
    $('#editdiv').hide()
    $('#insertdiv').hide()
    refresh()
}

$('#new').mouseenter(function () {
    insert()
 })
 
 $('#back').mouseenter(function () {
     back()
 })
 
 function refresh() {
     $.getJSON(`/api/all-website-customize`, data => {
         makeTable(data)
     })
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
                name: "Products.xlsx",
                sheet: {
                name: "Sheet1"
                }
              });
            });
      });
    