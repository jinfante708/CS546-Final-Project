$(document).ready(function () {
    
  
    const form = $("#createNewList");
    const input = $("#listName");
    const error = $("#error");


    function validString(str) {

        str = str.trim();
        // Is input given? Is input not a number? (All form input is of type string)
        if (!str || !isNaN(str)) {
          return false;
        }
    
        return true;
    }
  
    form.submit((event) => {
        event.preventDefault();
        // if(validString(input.val())){
        if(input.val().trim().length > 0){
            error.html("");
            // form.trigger("reset");
            // input.focus();
            
            const newList = {
                listName: input.val()
            }

            submit(newList);
        }
        else{
            error.html("list name should not be empty.")
            input.focus();
            input.value= "";
        }
      
    });



    function submit(list){


        let requestConfig = {
            url: "/tasklists",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(list),
            
            success: function (data) {
                
                window.location.href = "/tasklists";
                error.html(data);
            },
     
            error: function (data) {

                let er = data.responseJSON.error;


      

                error.html(er);
            },
        }
        $.ajax(requestConfig);



    }
  });