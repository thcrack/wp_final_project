// Initialize Firebase
var config = {
    apiKey: "AIzaSyBqO_6r_PHnmvw-j_82wBENvy94GOGAkSI",
    authDomain: "tattoo-decision.firebaseapp.com",
    databaseURL: "https://tattoo-decision.firebaseio.com",
    storageBucket: "tattoo-decision.appspot.com",
};

firebase.initializeApp(config);

var fbProvider = new firebase.auth.FacebookAuthProvider();
var users = firebase.database().ref("users");
var items = firebase.database().ref("items");

var imgRoot = firebase.storage().ref();

$('#designer-view').hide();

setTimeout(function(){
    $('#designer-view').show();
    $('#designer-view-loading').hide();
},2000);

var itemData = firebase.database().ref("items");
var userData = firebase.database().ref("designers");

itemData.once("value",function(input){
    console.log("once");
    input.forEach(function(childIn){
        var entry = childIn.val();
        imgRoot.child("items/"+ entry.userUID + "/" + entry.itemID + "/itemPic.jpg").getDownloadURL().then(function(picUrl){

            $('#designer-view').append('<div class="designer-view-block" id="' + entry.itemID + '"></div>');

            $('#' + entry.itemID).click(function(){
                $('#work-view-modal').empty();
                $('#work-view-modal').append('<div class="modal-dialog" id="work-dialog"></div>');
                $('#work-dialog').append('<div class="modal-content" id="work-content"></div>');
                $('#work-content').append('<div class="modal-body" id="work-body"></div>');

                $('#work-body').append('<div id="work-pic"></div>');
                $('#work-body').append('<div id="work-designer"></div>');

                $('#work-pic').css('background-image','url(' + picUrl + ')');

                firebase.database().ref("designers/" + entry.userUID).once("value",function(userIn){

                    var author = userIn.val();

                    imgRoot.child("profile/"+ entry.userUID + "/profilePic.jpg").getDownloadURL().then(function(inUrl){

                        $('#work-designer').append('<div id="work-designer-pic">');
                        $('#work-designer-pic').css('background-image','url(' + inUrl + ')');

                        $('#work-designer').append('<div id="work-designer-name">' + author.userName + '</div>');
                        $('#work-designer').append('<div id="work-designer-location">' + author.userLocation + '</div>');
                        $('#work-designer').append('<div id="work-designer-phone">' + author.userPhone + '</div>');
                        $('#work-designer').append('<div id="work-designer-desc">' + author.userDesc + '</div>');

                    });

                });

                $('#work-view-modal').modal('show');
            });

            $('#' + entry.itemID).append('<h4>' + entry.itemStyle + '</h4>');
            $('#' + entry.itemID).css('background-image','url(' + picUrl + ')');
        })
    });
});