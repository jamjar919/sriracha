var socket = io();
var oldName = "";
var imgcount = 0;
var images = [];

socket.on('sentimg', function(img_url) {
    // we'll need to send the image url to the post form.
});

socket.on('img_uploaded', function(img_url) {
    // we'll need to send the image url to the post form.
    console.log(img_url);
    images.push(img_url);
	var targetDiv = document.getElementById(img_url.id);
	targetDiv.className += " img_upload_done";
	var line = '<input type="hidden" name="image_url" value="'+img_url.url+'">';
	$( "#pictureupload" ).append( line );
        $( "#input_images" ).hide();
    $("#secret-image-input").val(img_url.url);
});

$(function() {
    var k = document.getElementById("input_images");
    $(k).change(function() {
        console.log(files)
        var files = $("#input_images")[0].files;
        for (var i = 0; i < files.length; i++) {
            console.log(files[i].name);
        }
        uploadImages($("#input_images")[0].files)
    });
});

function incrementImageCount(count){
	// disables the submit button if the images haven't uploaded successfully
}

function checkUploadedImages(){
	if (imgcount != 0){
		$('form#submitter').submit(function(){
	    $(this).find(':input[type=submit]').prop('disabled', true);
	});
	} else {
		$('form#submitter').submit(function(){
		    $(this).find(':input[type=submit]').prop('disabled', false);
		});
	}
}

var backgroundInterval = setInterval(function(){
    $(".img_uploading").toggleClass("pulsebackground");
 },500)

function uploadImages(files) {
    for (var count = 0; count < files.length; count++) {
        var file = files[count];

        // check if image
        var imageType = /^image\//;
        if (!imageType.test(file.type)) {
            continue;
        }

        // make new img element
        var img = document.createElement("img");
        img.setAttribute("id", "img_" + count.toString())
        img.classList.add("img_preview");
        img.classList.add("img_uploading");
        img.file = file;

        // show image preview
        var preview = document.getElementById("upload_img_container");
        preview.appendChild(img);

      	// convert into b64
        var reader = new FileReader();
        reader.readAsDataURL(file);

        // send image to socket after its b64 conversion
        reader.onload = (function(aImg, count) {
            return function(e) {
                aImg.src = e.target.result;

                var tosend = {
                    'src': e.target.result,
                    'id': "img_" + count.toString()
                }
                    // send src to socket so server can upload files
                socket.emit('imageupload', tosend);
            };
        })(img, count);
    }
}

