$(document).bind("mobileinit", function(){
  $.extend(  $.mobile , {
    loadingMessage : "Yarrr",
	loadingMessageTextVisible : true,
	ajaxEnabled : false,
	defaultPageTransition : "none",
	hashListeningEnabled : false,
	buttonMarkup : {hoverDelay : 500},
  });
});