
function myFunction() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[0];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }



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










      
  $(function () {
    $('#myTable').click(function(){

   
    
      
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