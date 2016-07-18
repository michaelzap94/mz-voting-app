$(document).ready(function () {
//-----------------------------------------------------
    var pollOptionInc = 2;

$("#moreOptions").on("click",function (event) {
        pollOptionInc++;

        var str = '<input class="optionalOption list-group-item form-control" type="text" name="option['+pollOptionInc+']" placeholder="Option '+pollOptionInc+'">';
        $("#optionList").append(str);
        $("#remLastOption").prop('disabled', false);


});

$("#remLastOption").on("click",function (event) {
        
        if(parseInt(pollOptionInc)>2){
       
        --pollOptionInc;
        $("#optionList input:last").remove();
        if(parseInt(pollOptionInc)===2){
                        $("#remLastOption").prop('disabled', true);

        }
}
       

});

//------------------------------------------------------
 
    $('#pollForm').validate({
        rules: {
            title: {
                minlength: 3,
                maxlength: 20,
                required: true
            }, description: {
                minlength: 3,
                maxlength: 50,
                required: true,
            },
            "option[]": {
               required: true,
                minlength: 2


            }
            
        },
        highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function(element) {
            $(element).closest('.form-group').removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {

            if(element.parent('.input-group').length) {
             
                error.insertAfter(element.parent());

            } else {
                error.insertAfter(element);
            }
        }


    });


    $('#forms').validate({
        rules: {
            name: {
                minlength: 3,
                maxlength: 15,
                required: true
            },surname: {
                minlength: 3,
                maxlength: 15,
                required: true
            }, username: {

                required: true,
                email: true
            },
            password: {
                minlength: 4,
                maxlength: 18,
                required: true,

            },
    password_again: {
      equalTo: "#password"
    }
        },
        highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function(element) {
            $(element).closest('.form-group').removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {
            if(element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        }


    });
    
//RESET REGISTER FORM
    
    $("#resetRegisterForm").click(function () {
        event.preventDefault(); //  IMPORTANT. THIS IS HOW YOU GET THE EVENT OF A CLICK.
        $("#forms")[0].reset();
        var validator = $( "#forms" ).validate();

        for (var i = 0, elements = validator.elements(); elements[i]; i++) {
            validator.settings.unhighlight.call(validator, elements[i], validator.settings.errorClass, validator.settings.validClass);
        }
        validator.resetForm();
    });

//---------------------------------


});