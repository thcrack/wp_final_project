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

		applyParallax("50%",0.7);
		
	});

	function applyParallax(hor, ratio){
		$('#content-pic-1').parallax(hor, ratio);
		$('#content-pic-2').parallax(hor, ratio);
		$('#content-pic-3').parallax(hor, ratio);
	}

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