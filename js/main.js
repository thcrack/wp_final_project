(function($) {

	$(document).ready(function(){

	    // hide .navbar first
	    $(".navbar").hide();

	    // fade in .navbar
	    $(function () {
	        $(window).scroll(function () {

	                 // set distance user needs to scroll before we start fadeIn
	            if ($(this).scrollTop() > 700) {
	                $('.navbar').fadeIn();
	            } else {
	                $('.navbar').fadeOut();
	            }
	        });
	    });
		
		//.parallax(xPosition, speedFactor, outerHeight) options:
		//xPosition - Horizontal position of the element
		//inertia - speed to move relative to vertical scroll. Example: 0.1 is one tenth the speed of scrolling, 2 is twice the speed of scrolling
		//outerHeight (true/false) - Whether or not jQuery should use it's outerHeight option to determine when a section is in the viewport
		$('#content-pic-1').parallax("50%", 0.3);
		$('#content-pic-2').parallax("50%", 0.3);
		$('#content-pic-3').parallax("50%", 0.3);
	});

		// handle links with @href started with '#' only
	$(document).on('click', 'a[href^="#"]', function(e) {
	    // target element id
	    var id = $(this).attr('href');

	    // target element
	    var $id = $(id);
	    if ($id.length === 0) {
	        return;
	    }

	    // prevent standard hash navigation (avoid blinking in IE)
	    e.preventDefault();

	    // top position relative to the document
	    var pos = $(id).offset().top;

	    // animated top scrolling
	    $('body, html').animate({scrollTop: pos});
	});

}(jQuery));