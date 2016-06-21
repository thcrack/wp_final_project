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
itemData.once("value",function(input){
    input.forEach(function(childIn){
        var entry = childIn.val();
        console.log(childIn.val());
        imgRoot.child("items/"+ entry.userUID + "/" + entry.itemID + "/itemPic.jpg").getDownloadURL().then(function(picUrl){

            $('#designer-view').append('<div class="designer-view-block" id="' + entry.itemID + '"></div>');

            $('#' + entry.itemID).append('<h4>' + entry.itemStyle + '</h4>');
            $('#' + entry.itemID).css('background-image','url(' + picUrl + ')');
        })
    });
});