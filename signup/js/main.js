// Initialize Firebase
var config = {
    apiKey: "AIzaSyBqO_6r_PHnmvw-j_82wBENvy94GOGAkSI",
    authDomain: "tattoo-decision.firebaseapp.com",
    databaseURL: "https://tattoo-decision.firebaseio.com",
    storageBucket: "tattoo-decision.appspot.com",
};

firebase.initializeApp(config);

var fbProvider = new firebase.auth.FacebookAuthProvider();
var fbState = false;
var users = firebase.database().ref("users");
var items = firebase.database().ref("items");
var currentUser = {
    displayName: "",
    uid: "",
    photoURL: ""
};
var currentDesigner = {
    name: ""
}
var portfolioReady = false;

var imgRoot = firebase.storage().ref();

firebase.auth().onAuthStateChanged(function(user){

    if(user){

        fbState = true;
        currentUser.displayName = user.displayName;
        currentUser.uid = user.uid;
        currentUser.photoURL = user.photoURL;

    }

})

$('#signin').click(function () {

	if(!fbState){
	    firebase.auth().signInWithPopup(fbProvider).then(function(result){

	        currentUser.displayName = result.user.displayName;
	        currentUser.uid = result.user.uid;
	        currentUser.photoURL = result.user.photoURL;

	        var link = "users/" + currentUser.uid;
	        var userData = firebase.database().ref(link);
	        console.log(link);
	        userData.set({
	            displayName: currentUser.displayName,
	            uid: currentUser.uid,
	            photoURL: currentUser.photoURL
	        });

	        loginStatus(true);

	    }).catch(function(error){
	        var errorCode = error.code;
	        var errorMessa = error.message;
	        console.log(errorCode,errorMessa);
	    });
	}else{
		loginStatus(true);
	}

});

$("#signout").click(function () {

    firebase.auth().signOut().then(function(){

        currentUser.displayName = "";
        currentUser.uid = "";
        currentUser.photoURL = "";
        loginStatus(false);
        portfolioReady = false;
        fbState = false;

    },function(error){

        console.log(error.code);

    });

});

// designer sign up

$("#designer-picBox").click(function(){
    $("#designer-picData").trigger("click");
});

$("#designer-picData").change(function(){
    var thumbF = new FileReader();
    var imgF= $("#designer-picData")[0].files[0];
    thumbF.readAsDataURL(imgF);
    thumbF.onloadend = (function (imge) {return function (e) {
      $("#designer-picBox").css("background-image", "url("+ e.target.result +")");
    }})(imgF);
});

$("#submitData").click(function () {

    var dataArr = $("#designer-info").serializeArray();
    var picFile = $("#designer-picData")[0].files[0];

    if (dataArr[0].value != null && dataArr[1].value != "default" && dataArr[2].value != null && picFile ) {

        imgRoot.child("profile/" + currentUser.uid + "/profilePic.jpg").put(picFile);
        firebase.database().ref("designers/" + currentUser.uid).set({
            userUID: currentUser.uid,
            userName: dataArr[0].value, 
            userLocation: dataArr[1].value, 
            userPhone: dataArr[2].value,
            userDesc: dataArr[3].value
        });
        firebase.database().ref("regions/" + dataArr[1].value).set({
        	name: dataArr[1].value
        });
    }
});

// designer upload works

$("#item-picBox").click(function(){
    $("#item-picData").trigger("click");
    $('#upload-notify').empty();
});

$("#item-picData").change(function(){
    var thumbF = new FileReader();
    var imgF= $("#item-picData")[0].files[0];
    thumbF.readAsDataURL(imgF);
    thumbF.onloadend = (function (imge) {return function (e) {
      $("#item-picBox").css("background-image", "url("+ e.target.result +")");
    }})(imgF);
});

$('#upload-button').click(function(){
    $('#upload-notify').empty();
});

$("#submitItem").click(function () {

    $('#upload-notify').empty();

    var styleVal = $('#stylelist option:selected').val();
    console.log(styleVal);
    var picFile = $("#item-picData")[0].files[0];

    if (styleVal != "default" && picFile ) {

        var newItem = items.push();
        var newID = newItem.key;

        imgRoot.child("items/" + currentUser.uid + "/" + newID + "/itemPic.jpg").put(picFile);

        firebase.database().ref("items/" + newID).set({
            userUID: currentUser.uid,
            userName: currentDesigner.name,
            itemID: newID,
            itemStyle: styleVal
        });
        firebase.database().ref("portfolio/" + currentUser.uid + "/" + newID).set({
            userUID: currentUser.uid,
            userName: currentDesigner.name,
            itemID: newID,
            itemStyle: styleVal
        });
        firebase.database().ref("style_catalog/" + styleVal + "/" + newID).set({
            userUID: currentUser.uid,
            userName: currentDesigner.name,
            itemID: newID,
            itemStyle: styleVal
        });

        $("#item-info")[0].reset();
        $("#item-picBox").css("background-image", "none");

        $('#upload-notify').append('<div class="alert alert-success"><strong>Success!</strong>Uploaded Successfully!<button type="button" class="btn btn-success" id="go-to-manage">Manage Your Works</button></div>');
        $('#go-to-manage').click(function(){
        	$('#upload-modal').modal('hide');
			$('#section-profile').hide();
			$('#section-portfolio').show();
        });

        cueLoadingScreen();
        setTimeout(getPortfolio, 3000);
    }else if(styleVal == "default"){
        $('#upload-notify').append('<div class="alert alert-warning"><strong>Warning!</strong>Please select a style.</div>');
    }else{
        $('#upload-notify').append('<div class="alert alert-warning"><strong>Warning!</strong>Please select a picture.</div>');
    }
});

//designer view area

$('#manage-button').click(function(){
	$('#section-profile').hide();
	$('#section-portfolio').show();
});

$('#back-to-profile').click(function(){
	$('#section-portfolio').hide();
	$('#section-profile').show();
});

function cueLoadingScreen(){
    $('#designer-view').hide();
    $('#designer-view-loading').show();
}

function getPortfolio(){

    portfolioReady = true;

    $('#designer-view').empty();

    var itemData = firebase.database().ref("portfolio/" + currentUser.uid);
    itemData.once("value",function(input){
        input.forEach(function(childIn){
            var entry = childIn.val();
            console.log(childIn.val());
            imgRoot.child("items/"+ entry.userUID + "/" + entry.itemID + "/itemPic.jpg").getDownloadURL().then(function(picUrl){

                $('#designer-view').append('<div class="designer-view-block" id="' + entry.itemID + '"></div>');

                $('#' + entry.itemID).append('<h4>' + entry.itemStyle + '</h4>')
                $('#' + entry.itemID).append('<div class="row grid-button-row" goal="' + entry.itemID + '"></div>');
                $('.grid-button-row[goal="' + entry.itemID + '"]').append('<div class="col-md-4"><button type="button" class="btn btn-danger delete-entry" goal="' + entry.itemID + '"><span class="glyphicon glyphicon-trash"></span></button></div>');
                
				$('.delete-entry[goal="' + entry.itemID +'"]').click(function(){

                	showDeletePrompt($(this).attr('goal'));

                });

                $('.grid-button-row[goal="' + entry.itemID + '"]').append('<div class="col-md-4"><button type="button" class="btn btn-primary edit-entry" goal="' + entry.itemID + '"><span class="glyphicon glyphicon-tags"></span></button></div>');
                
				$('.edit-entry[goal="' + entry.itemID +'"]').click(function(){

                	showEditPrompt($(this).attr('goal'),entry.itemStyle);

                });


                $('.grid-button-row[goal="' + entry.itemID + '"]').append('<div class="col-md-4"><button type="button" class="btn btn-success view-entry" goal="' + entry.itemID + '"><span class="glyphicon glyphicon-zoom-in"></span></button></div>');
                
				$('.view-entry[goal="' + entry.itemID +'"]').click(function(){

                	showViewPrompt(picUrl);

                });


                $('#' + entry.itemID).css('background-image','url(' + picUrl + ')');
            })
        });
    });

    $('#designer-view').show();
    $('#designer-view-loading').hide();
}

function showDeletePrompt(itemID){

	$('#prompt-body').empty();

	$('#prompt-body').append('<button type="button" class="btn btn-default" id="prompt-no">Cancel</button>');
	$('#prompt-body').append('<button type="button" class="btn btn-danger" id="prompt-yes">Delete<span class="glyphicon glyphicon-trash"></span></button>');

	$('#prompt-yes').click(function(){
		$('#prompt-modal').modal('hide');
        firebase.database().ref("items/" + itemID).once("value", function(input){
            var entry = input.val();
            firebase.database().ref("items/" + entry.itemID).remove();
            firebase.database().ref("portfolio/" + currentUser.uid + "/" + entry.itemID).remove();
            firebase.database().ref("style_catalog/" + entry.itemStyle + "/" + entry.itemID).remove();
            firebase.storage().ref("items/" + currentUser.uid + "/" + entry.itemID + "/itemPic.jpg").delete();

            cueLoadingScreen();
            setTimeout(getPortfolio, 1500);
        });
	});

	$('#prompt-no').click(function(){
		$('#prompt-modal').modal('hide');
	})

	$('#prompt-modal').modal('show');
}

function showEditPrompt(itemID, originalStyle){

	$('#edit-buttons').empty();
	$('#edit-buttons').append('<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>');
	$('#edit-buttons').append('<button type="button" class="btn btn-success" id="edit-save">Save</button>');
	$('#edit-stylelist').val(originalStyle);
	$('#edit-save').click(function(){


		var styleVal = $('#edit-stylelist option:selected').val();

		$('#edit-footer').empty();

		if (styleVal != "default") {

	        firebase.database().ref("items/" + itemID).set({
	            userUID: currentUser.uid,
	            userName: currentDesigner.name,
	            itemID: itemID,
	            itemStyle: styleVal
	        });
	        firebase.database().ref("portfolio/" + currentUser.uid + "/" + itemID).set({
	            userUID: currentUser.uid,
	            userName: currentDesigner.name,
	            itemID: itemID,
	            itemStyle: styleVal
	        });
	        firebase.database().ref("style_catalog/" + originalStyle + "/" + itemID).remove();
	        firebase.database().ref("style_catalog/" + styleVal + "/" + itemID).set({
	            userUID: currentUser.uid,
	            userName: currentDesigner.name,
	            itemID: itemID,
	            itemStyle: styleVal
	        });

	        $("#edit-stylelist option:eq(0)").attr('selected','selected');

	        cueLoadingScreen();
	        setTimeout(getPortfolio, 1500);
	        $('#edit-modal').modal('hide');
	    }else{
	        $('#edit-footer').append('<div class="alert alert-warning"><strong>Warning!</strong>Please select a style.</div>');
	    }
	});

	$('#edit-modal').modal('show');

}

function showViewPrompt(input){

	console.log(input);
	$('#view-prompt-img').css('background-image','url(' + input + ')');
	$('#view-modal').modal('show');

}

// designer edit info

$('#edit-button').click(function(){
	firebase.database().ref("designers/" + currentUser.uid).once("value",function(dInfo){
		var data = dInfo.val();
		$('#edit-user-name').val(dInfo.val().userName);
		$('#edit-location-list').val(dInfo.val().userLocation);
		$('#edit-user-phone').val(dInfo.val().userPhone);
		$('#edit-user-desc').val(dInfo.val().userDesc);
		imgRoot.child("profile/" + currentUser.uid + "/profilePic.jpg").getDownloadURL().then(function(picUrl){
			$("#edit-designer-picBox").css("background-image", "url("+ picUrl +")");
		});

	});
});

$("#edit-designer-picBox").click(function(){
    $("#edit-designer-picData").trigger("click");
});

$("#edit-designer-picData").change(function(){
    var thumbF = new FileReader();
    var imgF= $("#edit-designer-picData")[0].files[0];
    thumbF.readAsDataURL(imgF);
    thumbF.onloadend = (function (imge) {return function (e) {
      $("#edit-designer-picBox").css("background-image", "url("+ e.target.result +")");
    }})(imgF);
});

$("#edit-submitData").click(function () {

    var dataArr = $("#edit-designer-info").serializeArray();
    var picFile = $("#edit-designer-picData")[0].files[0];

    if (dataArr[0].value != null && dataArr[1].value != "default" && dataArr[2].value != null) {
    	if(picFile){
        	imgRoot.child("profile/" + currentUser.uid + "/profilePic.jpg").put(picFile);
        }
        firebase.database().ref("designers/" + currentUser.uid).set({
            userUID: currentUser.uid,
            userName: dataArr[0].value, 
            userLocation: dataArr[1].value, 
            userPhone: dataArr[2].value,
            userDesc: dataArr[3].value
        });
        firebase.database().ref("regions/" + dataArr[1].value).set({
        	name: dataArr[1].value
        });
        $('#profile-edit-modal').modal('hide');
    }
});

// util

function loginStatus(isLoggedIn) {

  if (isLoggedIn){

    var link = "designers/" + currentUser.uid;
    var userData = firebase.database().ref(link);
    userData.on("value",function(input){
        var val = input.val();
        if(val != null){
            currentDesigner.name = val.userName;
            setProfile(val.userName);
            if(!portfolioReady) getPortfolio();
            $("#section-data-form").css("display","none");
            $("#section-signin").css("display","none");
            $("#section-profile").css("display","block");
        }else{
            $("#section-data-form").css("display","block");
            $("#section-signin").css("display","none");
            $("#section-profile").css("display","none");
        }
    });

  }else{

    $("#section-data-form").css("display","none");
    $("#section-signin").css("display","block");
    $("#section-profile").css("display","none");

  }
}

function setProfile(name){
    $("#profile-name").empty();
    $("#profile-name").append("<h1>Hi, " + name + "</h1>");
}