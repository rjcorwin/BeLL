$(document).bind("mobileinit", function(){
  $.extend(  $.mobile , {
    loadingMessage : "Loading...",
	loadingMessageTextVisible : true,
	ajaxEnabled : false,
	defaultPageTransition : "none",
	hashListeningEnabled : true,
	buttonMarkup : {hoverDelay : 500},
  });
});