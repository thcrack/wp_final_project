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

var currentPage = 1;
var ITEMS_PER_PAGE = 16;

var itemData = firebase.database().ref("items");
var userData = firebase.database().ref("designers");

var itemCacheArray = new Array();
var dataCount = 0;
var pageCount = 0;

getData(itemData);
buildFilter();

$('#view-all-works').click(function(){
	getData(itemData);
	currentPage = 1;
});

function buildFilter(){

	//regions

	firebase.database().ref("regions").orderByKey().once("value",function(regionList){
		regionList.forEach(function(sRegion){
			createFilterRegionDOM(sRegion);
		});
	});

	//styles

	createFilterStyleDOM();

	//designers

	firebase.database().ref("designers").orderByChild('userName').once("value",function(designerList){
		designerList.forEach(function(sDesigner){
			createFilterDesignerDOM(sDesigner);
		});
	});

}

function createFilterRegionDOM(r){

	var rName = r.val().name;
	$('#filter-region-list').append('<li><a href="#designer-view-loading" value="' + rName + '">' + rName + '</a></li>');
	$('#filter-region-list a[value="' + rName + '"]').click(function(){
		currentPage = 1;
		firebase.database().ref("designers").orderByChild('userLocation').startAt(rName).endAt(rName).once("value",function(rdList){
			toggleLoading(true);
			itemCacheArray = new Array();
			rIndex = 0;
			dataCount = 0;
			rdList.forEach(function(input){
				loadPortfolio(input);
			});
			setTimeout(function(){
	        	pageCount = Math.ceil(dataCount/ITEMS_PER_PAGE);
	        	getNewPage(1);
	        	currentPage = 1;
	        },500);
		});
	});
};

function loadPortfolio(input){
	var dID = input.val().userUID;
	firebase.database().ref("portfolio/" + dID).once("value", function(wInput){
		dataCount += wInput.numChildren();
	    wInput.forEach(function(childIn){
	    	console.log(childIn.val());
	        itemCacheArray.push(childIn.val());
	    });
	});
}

function createFilterStyleDOM(){

	$('#filter-style-list a').click(function(){
		getData(firebase.database().ref("style_catalog/" + $(this).attr('value')));
		currentPage = 1;
	})

};

function createFilterDesignerDOM(r){

	var rName = r.val().userName;
	$('#filter-designer-list').append('<li><a href="#designer-view-loading" value="' + rName + '">' + rName + '</a></li>');
	$('#filter-designer-list a[value="' + rName + '"]').click(function(){
		getData(firebase.database().ref("portfolio/" + r.val().userUID));
		currentPage = 1;
	})

};

function buildPagination(){
	$('#designer-view-paging').empty();
	$('#designer-view-paging').append('<ul class="pagination pagination-lg" id="paging-bar"></ul>');
	for(var i = 0; i < pageCount; i++){
		var page = i + 1;
		if(parseInt(currentPage) == page){
			$('#paging-bar').append('<li class="active"><a>' + parseInt(page) + '</a></li>');
		}else{
			$('#paging-bar').append('<li><a href="#designer-view-loading" page="' + parseInt(page) + '">' + parseInt(page) + '</a></li>');
		}
		$('#paging-bar a[page="' + parseInt(page) + '"]').click(function(){
			currentPage = parseInt($(this).attr('page'));
			getNewPage(currentPage);
			console.log("fired");
		});
	}
}

function getData(data){
	toggleLoading(true);
	data.once("value",function(input){
		var index = 0;
		itemCacheArray = new Array();
		dataCount = input.numChildren();
		pageCount = Math.ceil(dataCount/ITEMS_PER_PAGE);
	    input.forEach(function(childIn){
	        itemCacheArray.push(childIn.val());
	        index ++;
	        if(index==dataCount){
	        	getNewPage(1);
	        	currentPage = 1;
	        }
	    });
	});
}

function toggleLoading(boo){
	if(boo){
		$('#designer-view-paging').hide();
		$('#designer-view').hide();
		$('#designer-view-loading').show();
	}else{
		$('#designer-view').show();
	    $('#designer-view-paging').show();
	    $('#designer-view-loading').hide();
	}
}

function getNewPage(pageNum){

	toggleLoading(true);

	setTimeout(function(){
	    
		toggleLoading(false);

	},1000);

	loadDataFromArray(pageNum);

}

function loadDataFromArray(page){

	$('#designer-view').empty();
	console.log(itemCacheArray);

	itemCacheArray = shuffle(itemCacheArray);

	for(i = ITEMS_PER_PAGE*(page-1); i < ITEMS_PER_PAGE*page; i++){
		if(i >= itemCacheArray.length) break;
		var sItem = itemCacheArray[i];
	    createDOM(sItem);
	}

	buildPagination();
}

function createDOM(entry){
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
}

//util

function shuffle(array) {
  var m = array.length, t, i;

  while (m) {

    i = Math.floor(Math.random() * m--);

    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}