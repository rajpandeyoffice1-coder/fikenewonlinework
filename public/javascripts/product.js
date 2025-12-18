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
$.getJSON(`/purchase-product/all`, data => {
    console.log(data)
    services = data
    makeTable(data)
})

})




document.write('<script type="text/javascript" src="/javascripts/common.js" ></script>');

function makeTable(categories) {
    let table = ` 
    <div class="table-responsive">
        <div class="d-flex justify-content-between align-items-center p-3">
            <button type="button" id="back" class="btn btn-primary">Back</button>
            <input type="text" class="form-control w-25" id="myInput" onkeyup="myFunction()" placeholder="Search Here.." title="Type in a name">
            <button type="button" class="btn btn-primary" id="exportBtn1">Export Data</button>
        </div>

        <table id="myTable" class="table table-bordered table-striped mb-0">
            <thead class="thead-dark">
                <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th style="width: 200px;">Product Detail</th>
                    <th style="width: 200px;">Product Description</th>
                    <th>Image</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>`;

    $.each(categories, (i, item) => {
        table += `<tr>
            <td>${item.name}</td>
            <td>${item.type}</td>
            <td>${item.categoryname}</td>
            <td>
                <div style="max-height: 100px; overflow-y: auto;">${item.description}</div>
            </td>
            <td>
                <div style="max-height: 100px; overflow-y: auto;">${item.short_description}</div>
            </td>
            <td>
                <img src="/images/${item.image}" class="img-fluid img-radius" alt="Product Image" style="width:50px; height:50px;">
            </td>
            <td>
                <div class="dropdown">
                   <button class="btn btn-outline-primary btn-sm dropdown-toggle action-btn" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                        <i class="feather icon-settings"></i> Actions
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item edits" id="${item.id}" href="#!"><i class="feather icon-edit text-info"></i> Edit</a></li>
                        <li><a class="dropdown-item updateimage" id="${item.id}" href="#!"><i class="feather icon-image text-warning"></i> Main Image</a></li>
                        <li><a class="dropdown-item" href="/purchase-product/view-images?id=${item.id}"><i class="feather icon-eye text-secondary"></i> View Images</a></li>
                        <li><a class="dropdown-item deleted" id="${item.id}" href="#!"><i class="feather icon-trash-2 text-danger"></i> Delete</a></li>
                    </ul>
                </div>
            </td>
        </tr>`;
    });

    table += `</tbody>
        </table>
    </div>`;

    $('#result').html(table);
    $('#insertdiv').hide();
    $('#result').show();

    // Initialize Bootstrap dropdown (for dynamic content)
    $('.dropdown-toggle').dropdown();



    $(document).click(function (event) {
        if (!$(event.target).closest('.dropdown').length) {
            $('.dropdown-menu').removeClass('show');
        }
    });

    // Toggle dropdown manually on button click
    $(document).on('click', '.action-btn', function (event) {
        event.stopPropagation();
        let dropdownMenu = $(this).siblings('.dropdown-menu');
        $('.dropdown-menu').not(dropdownMenu).removeClass('show'); // Close other dropdowns
        dropdownMenu.toggleClass('show'); // Toggle current dropdown
    });

}






$('#result').on('click', '.deleted', function () {
    const id = $(this).attr('id')
    $.get(`/purchase-product/delete`, { id }, data => {
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
    const id = $(this).attr('id');
    const result = services.find(item => item.id == id);

    fillDropDown('pcategoryid', categories, 'Choose Category', result.categoryid);
    fillDropDown('psizeid', sizes, 'Choose Size', result.sizeid);
    $('#psubcategoryid').append($('<option>').val(result.subcategoryid).text(result.subcategoryname));
    $('#pbrandid').append($('<option>').val(result.pbrandid).text(result.brandname));

    edit();
    $('#pid').val(result.id);
    $('#pname').val(result.name);
    $('#psubcategoryid').val(result.subcategoryid);
    $('#pcategoryid').val(result.categoryid);
    $('#pbrandid').val(result.branid);
    $('#pshort_name').val(result.short_name);
    $('#psizeid').val(result.sizeid);
    $('#pdescription').val(result.description);
    $('#pfb_link').val(result.fb_link);
    $('#ptwitter_link').val(result.twitter_link);
    $('#ppintrest_link').val(result.pintrest_link);
    $('#pkeywords').val(result.keywords);
    $('#ptype').val(result.type);
    $('#pshort_description').val(result.short_description);

    // Set packaging dimensions
    $('#plength').val(result.length);
    $('#pbreadth').val(result.breadth);
    $('#pheight').val(result.height);
    $('#pweight').val(result.weight);

    // Set packaging unit values
    $('#plength_unit').val(result.length_unit);
    $('#pbreadth_unit').val(result.length_unit);
    $('#pheight_unit').val(result.length_unit);
    $('#pweight_unit').val(result.weight_unit);

    // Update description editors
    $('.peditor').html(`<p>${result.description}</p>`);
    $('.peditor1').html(`<p>${result.short_description}</p>`);

    // Update product image
    let pi1 = `<img src='/images/${result.image}' style='width:140px;height:140px'>`;
    $('#pi1').html(pi1);
});




$('#result').on('click', '.updateimage', function() {
    const id = $(this).attr('id')
    const result = services.find(item => item.id == id);
    $('#peid').val(result.id)
})


$('#update').click(function () {  //data insert in database

    let content = $(".peditor").html().trim();
    let content1 = $(".peditor1").html().trim();

    // alert(content)

    let updateobj = {
         id: $('#pid').val(),
         categoryid: $('#pcategoryid').val(),
         name: $('#pname').val(),
         description : content,
         keywords : $('#pkeywords').val(),
         pintrest_link : $('#ppintrest_link').val(),
         twitter_link : $('#ptwitter_link').val(),
         fb_link : $('#pfb_link').val(),
         length : $('#plength').val(),
         breadth : $('#pbreadth').val(),
         height : $('#pheight').val(),
         weight : $('#pweight').val(),
         length_unit : $('#plength_unit').val(),
         weight_unit: $('#pweight_unit').val(),
        
         type : $('#ptype').val(),
         short_description : content1,


      
    }

    $.post(`/purchase-product/update`, updateobj, function (data) {
        if(data.status==300 || data.status == '300') alert(data.description);
        else update()
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
     $.getJSON(`/purchase-product/all`, data => {
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
    
    
    