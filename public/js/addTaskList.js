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
            error.html("this is not a valid list name.")
            input.focus();
            input.value= "";
        }
      
    });



    function submit(list){

        console.log(list);

        
        

        let requestConfig = {
            url: "/tasklists",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(list),
            
            success: function (data) {
                
                window.location.href = "/tasklists";
                error.html(data);
            },
            // complete: function (data) {
            //     // $("#error").addClass("d-none");

            //     let er = data.responseJSON.error
            //     error.html(er);
            // },
            error: function (data) {

                let er = data.responseJSON.error;

                console.log(er);
                // $("#error").html(data.responseJSON.error);
                // $("#error").removeClass("d-none");

                error.html(er);
            },
        }
        $.ajax(requestConfig);


        // $.ajax(requestConfig).then(function (response){
            
        //     window.location.href = "/tasklists";
            
        // })
    }
  });
  


// (function ($) {
//     let hasErrors = false;

//     $(document).on("submit", "createNewList", function (event) {
//         event.preventDefault();

//         // hasErrors = false;

//         $("#error").addClass("d-none");

//         // const firstName = $("#firstName");
//         // const lastName = $("#lastName");
//         // const email = $("#email");
//         // const dateOfBirth = $("#dateOfBirth");
//         // const password = $("#password");


//         const input = $("#listName");

//         // const user = {
//         //     firstName: firstName.val().trim(),
//         //     lastName: lastName.val().trim(),
//         //     email: email.val().trim(),
//         //     dateOfBirth: dateOfBirth.val().trim(),
//         //     password: password.val(),
//         // };

//         alert(`the input length is ${input.val().trim().length}`)
//         if(input.val().trim().length == 0){
//             $("#error").html("you need to provide a list name");
//             $("#error").removeClass("d-none");

//             return;
//         }
//         else{
//             const newList = {
//                 listName: input.val().trim(),
//             }
    
//             submitForm(newList);
//         }
        
//     });

//     function submitForm(list) {
//         $.ajax({
//             url: "/tasklists",
//             method: "POST",
//             contentType: "application/json",
//             data: JSON.stringify(list),
//             beforeSend: function () {
//                 $("#error").removeClass("d-none");
//             },
//             success: function () {
//                 window.location.href = "/tasklists";
//             },
//             complete: function () {
//                 $("#error").addClass("d-none");
//             },
//             error: function (data) {
//                 $("#error").html(data.responseJSON.error);
//                 $("#error").removeClass("d-none");
//             },
//         });
//     }

    
// })(jQuery);
