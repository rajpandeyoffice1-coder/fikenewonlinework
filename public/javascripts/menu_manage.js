let categories = []
let subcategories = []


let table = '/purchase-product/menu'

$('#show').click(function(){
  
$.getJSON(`${table}/all`, data => {
    subcategories = data
    makeTable(data)
    
  
})

})


$.getJSON(`/purchase-product/all`, data => {
    categories = data
    fillDropDown('productid', data, 'Choose Product', 0)
})


$.getJSON(`/size/all`, data => {
    sizes = data
    fillDropDown1('sizeid', data, 'Choose Color', 0)
})




$.getJSON(`/admin/pannel/services/all`, data => {
    menus = data
    fillDropDown('categoryid', data, 'Choose Category', 0)
  
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



function fillDropDown1(id, data, label, selectedid = 0) {
    $(`#${id}`).empty()
    $(`#${id}`).append($('<option>').val("null").text(label))

    $.each(data, (i, item) => {
        if (item.id == selectedid) {
            $(`#${id}`).append($('<option selected>').val(item.name).text(item.name))
        } else {
            $(`#${id}`).append($('<option>').val(item.name).text(item.name))
        }
    })
}



function makeTable(categories){
      let table = ` <div class="table-responsive">

      <button type="button" id="back" class="btn btn-primary" style="margin:20px">BacK</button>
<table id="report-table" class="table table-bordered table-striped mb-0">
<thead>
<tr>
<th>Product Name</th>
<th>Quantity</th>
<th>Price</th>
<th>Discount</th>
<th>Net Amount </th>
<th>Weight</th>

<th>Options</th>
</tr>
</thead>
<tbody>`

$.each(categories,(i,item)=>{
table+=`<tr>

<td>${item.productname}</td>

<td>${item.quantity}</td>
<td>${item.price}</td>
<td>${item.discount}</td>

<td>${item.net_amount}</td>
<td>${item.weight} (in gm)</td>


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
    const result = subcategories.find(item => item.id == id);
    fillDropDown('pproductid', categories, 'Choose Product', result.productname)
    fillDropDown1('psizeid', sizes, 'Choose Color', result.sizeid)

    // fillDropDown('psizeid', sizes, 'Choose Color', result.sizename)
    // fillDropDown('psizeid', sizes, 'Choose Color', result.sizeid)

     $('#psizeid').append($('<option>').val(result.sizeid).text(result.sizeid))


    $('#editdiv').show()
    $('#result').hide()
    $('#insertdiv').hide() 
    $('#pid').val(result.id)
     $('#pprice').val(result.price)
     $('#pquantity').val(result.quantity)
     $('#pproductid').val(result.productid)
     $('#psizeid').val(result.sizeid)



     $('#pdiscount').val(result.discount)
     $('#pweight').val(result.weight)

   
 })



 $('#result').on('click', '.updateimage', function() {
    const id = $(this).attr('id')
    

    const result = subcategories.find(item => item.id == id);
    $('#peid').val(result.id)
})



 
$('#update').click(function(){  //data insert in database
    let updateobj = {
        id: $('#pid').val(),
        quantity: $('#pquantity').val(),
        price:$('#pprice').val(),
        productid:$('#pproductid').val(),
        sizeid:$('#psizeid').val(),
        weight:$('#pweight').val(),
        discount:$('#pdiscount').val(),

    
       
        }

    $.post(`${table}/update`, updateobj , function(data) {
       update()
    })
})



$('#submit').click(function(){  //data insert in database

    if( $('#productid').val() == [] || $('#productid').val() == "") alert('Select Product');
    else if( $('#sizeid').val() == [] || $('#sizeid').val() == "") alert('Select Size');
    if( $('#quantity').val() == [] || $('#quantity').val() == "") alert('Enter Quantity');
    if( $('#weight').val() == [] || $('#weight').val() == "") alert('Enter Weight');
    if( $('#price').val() == [] || $('#price').val() == "") alert('Enter Price');




    let updateobj = {


        productid: $('#productid').val(),
        sizeid: $('#sizeid').val(),
        price:$('#price').val(),
        quantity:$('#quantity').val(),
        weight:$('#weight').val(),
        discount:$('#discount').val(),
        

       
        }

    $.post(`${table}/insert`, updateobj , function(data) {
        if(data.status==300 || data.status == '300') alert(data.description);
        else {
            alert(data.description);
            window.location.reload();
        }
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


