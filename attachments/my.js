(function($) {


  /*
   * Page: page-which-grade
   */

  $("#page-which-grade").live("pageshow", function(e, d) {

    setTitle('What grade are you in?');
    var db = getDB();
    var grades
    $.getJSON('/' + db + '/_design/library/_view/grades?group=true', function(data) {
      
      var html = 
      	'<div data-role="content" style="padding: 15px">' +
	        '<ul data-role="listview" data-divider-theme="b" data-inset="true">'
      ;

      $.each(data.rows, function (index, grade) {
        html += 
              '<li data-theme="a">' +
                  '<a href="#page-which-subject&grade=' + grade.key + '" data-transition="slide">Grade ' +
                      grade.key +
                  '</a>' + 
              '</li>'
        ;
      })

      html +=
          '</ul>' +
        '</div>'
      ;

      // Print the results to the screen
      $("#page-which-grade .content").html(html)

      // Render the results using jQM render 
      $("#page-which-grade").trigger("create");

    })
  })




  /* 
   * Page: page-which-subject
   */

  $("#page-which-subject").live("pagebeforeshow", function(e, d) {

    // clear the content region
    $("#page-which-subject .content").html("Loading...")

    setTitle('Which subject would you like to see?');
    var db = getDB();
    var grade = $.url().fparam('grade')

    $.getJSON('/' + db + '/_design/library/_view/grade_subjects?group=true&startkey=[' + grade + ',"a"]&endkey=[' + grade + ',"z"]', function(data) {
      var response = data
      var subjects = Array()
      $.each(response.rows, function(id, data) {
        subjects[id] = {grade: data.key[0], name: data.key[1], document_count: data.value}
      })

      // Render the subject list
      var html = 
        '<div data-role="content" style="padding: 15px">' +
          '<ul data-role="listview" data-divider-theme="b" data-inset="true">'
      ;

      $.each(subjects, function (index, subject) {
        html += 
              '<li data-theme="a">' +
                  '<a href="#page-which-resource&grade=' + grade + '&subject=' + subject.name + '" data-transition="slide">' +
                      subject.name +
                  '</a>' + 
              '</li>'
        ;
      })

      html +=
          '</ul>' +
        '</div>'
      ;

      // Print the results to the screen
      $("#page-which-subject .content").html(html)

      // Render the results using jQM render 
      $("#page-which-subject").trigger("create");
    });
  })




  /*
   * Page: page-which-resource
   */

  $("#page-which-resource").live("pagebeforeshow", function(e, d) {

    // clear the content region
    $("#page-which-resource .content").html("Loading...")

    setTitle('Which lesson does your teacher want you to open?');
    var db = getDB();
    var grade = $.url().fparam('grade')
    var subject = $.url().fparam('subject')

    $.getJSON('/' + db + '/_design/library/_view/grade_subject_resources?key=[' + grade + ',"' + subject + '"]', function(data) {
      var response = data
      var subjects = []

      var resources = []
      $.each(response.rows, function(id, data) {
        resources[id] = {grade: data.key[0], subject: data.key[1], title: data.value, id: data.id, id_safe: encodeURIComponent(data.id)}
      })

      $("#page-which-resource .content").html('<div class="resource-list" data-role="collapsible-set" data-theme="a" data-content-theme="e"></div>')

      $.each(resources, function (index, resource) {
        $.getJSON('/' + db + '/' + resource.id_safe, function(resource_data) {
 
          // Default book image
          var book_image = '/' + db + "/_design/library/images/book.png"

          var item = '<div data-role="collapsible" data-collapsed="true">' +
                        '<h3>' + 
                            resource_data.title + //' - Rating' +
                        '</h3>' +
                        '<div class="ui-grid-a">'+
                            '<div class="ui-block-a">' +
                                '<div>' + 
                                    '<p>' +
                                      resource_data.description +
                                    '</p>' + 
                                '</div>' +
                            '</div>' +
                            '<div class="ui-block-b">'
          ;
          $.each(resource_data._attachments, function (key, value) {
            item +=             '<a rel="external" data-role="button" data-transition="fade" data-theme="b" href="/' + db + '/' + encodeURIComponent(resource_data._id) + '/' + encodeURIComponent(key) + '" ' +
                                'data-icon="arrow-d" data-iconpos="right">' +
                                    'download ' + key +
                                '</a>' 
            ;
          })
                                
          item +=               '<div style=" text-align:center">' +
                                    '<img style="width: 167px; height: 183px" src="' + book_image + '">' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<a data-role="button" data-transition="fade" data-theme="a" href="#page-feedback' + '&id=' + encodeURIComponent(resource_data._id) + '">' +
                            'comments and ratings' +
                        '</a>' +
                    '</div>'
          ;

          // Print the results to the screen
          $("#page-which-resource .content .resource-list").append(item)

          // Render the results using jQM render 
          $("#page-which-resource").trigger("create");
        })
      })


    });
  })

  


  /*
   * Page: page-feedback
   */

  $("#page-feedback").live("pagebeforeshow", function(e, d) {
    var resourceId = $.url().fparam("id")
    var resourceId_safe = encodeURIComponent(resourceId)
    console.log(resourceId)
    var db = getDB()
    // Add id to the submit your own button
    $("a.submit-your-own-comment").attr("href", "#page-submit-feedback&id=" + resourceId_safe + "")

    // Add Average
    /*
    // Add rating totals
    $.getJSON("/" + db + '/_design/library/_view/feedback_rating_totals?group=true&startkey=["' + resourceId + '",' + 1 + ']&endkey=["' + resourceId + '",' + '5]', function(data) {
        var ratingCount = []
        var i = 1
        while(i <= 5) {
          ratingCount[i] = data.rows[resourceId, i] 
          i++
        }
        var html = "<div class='rating-count'>" + "Rating 5: " + ratingCount[5] + "total" + "</div>" +
        "<div class='rating-count'>" + "Rating 4: " + ratingCount[4] + "total" + "</div>" +
        "<div class='rating-count'>" + "Rating 3: " + ratingCount[3] + "total" + "</div>" +
        "<div class='rating-count'>" + "Rating 2: " + ratingCount[2] + "total" + "</div>" +
        "<div class='rating-count'>" + "Rating 1: " + ratingCount[1] + "total" + "</div>" ;
        $(".resource-rating-totals").html(html)
    })
    /*
    $.couch.db(db).view('library/feedback_rating_totals', {
      group : true,
      startkey : [resourceId, 1],
      endkey : [resourceId, 5],
      success : function(data) {
        var ratingCount = []
        var i = 1
        while(i <= 5) {
          ratingCount[i] = data.rows[resourceId, i] 
          i++
        }
        var html = "<div class='rating-count'>" + "Rating 5: " + ratingCount[5] + "total" + "</div>" +
        "<div class='rating-count'>" + "Rating 4: " + ratingCount[4] + "total" + "</div>" +
        "<div class='rating-count'>" + "Rating 3: " + ratingCount[3] + "total" + "</div>" +
        "<div class='rating-count'>" + "Rating 2: " + ratingCount[2] + "total" + "</div>" +
        "<div class='rating-count'>" + "Rating 1: " + ratingCount[1] + "total" + "</div>" ;
        $(".resource-rating-totals").html(html)
      } 

    })
    */


    // Add the list of comments
    
    $.couch.db(db).view('library/feedback_by_resource', {
      key: resourceId,
      success: function(resource_feedback_data) {
        console.log(resource_feedback_data)
        $.each(resource_feedback_data.rows, function(key, row) {
          $.couch.db(db).openDoc(row.value, {
            success: function(doc) {
              var d = new Date(doc.timestamp)
              var html = '<div data-role="collapsible" data-collapsed="false">' +
                    '<h3>' +
                      doc.rating + " - " + d.getMonth() + "/" + d.getDate() + "/" + d.getFullYear() + " - " + doc.user + " - " + doc.group +
                    '</h3>' +
                    '<div>' +
                        doc.comment
                    '</div>' +
                '</div>'
                ;
              $(".list-feedback-of-resource").append(html)
              // Render the list
              $("#page-feedback").trigger("create");
            }
          })
        })
      }
    })
  })




  /*
   * Page: page-submit-feedback
   */

  $("#page-submit-feedback").live("pagebeforeshow", function(e, d) {
    
    // Set the resource id
    $("input#textinput4").attr("value", decodeURIComponent($.url().fparam('id')))
    $("input#textinput4").textinput('disable')

    $("#form-comment-and-rate").submit(function(){
      var currentTime = new Date()
      var feedback = {
        type: "feedback",
        resource: $("input:eq(0)").val(),
        user: $("input:eq(1)").val(),
        group: $("input:eq(2)").val(),
        rating: $("form input[type=radio]:checked").val(),
        comment: $("textarea:eq(0)").val(),
        anonymous: $("select:eq(0)").val(),
        timestamp: currentTime.getTime(),
        _id: "type-feedback--time-" + currentTime.getTime() + "--uuid-" + $.couch.newUUID()
      } 
      console.log(feedback)
      if(feedback.anonymous == "off" && feedback.user == "") {
        alert("Woops! It looks like you forgot to add your name.  Enter your name and submit again.")
        return false
      }

      // @todo: somehow this is being submitted one more time every time it is submitted.
      $.couch.db(getDB()).saveDoc(feedback, {
        success: function(data) {
          console.log(data);
          //window.location = "#page-feedback&id=" + $.url().fparam('id')
          $.mobile.changePage("#page-feedback&id=" + encodeURIComponent($.url().fparam("id")))
        },
        error: function(status) {
          console.log(status);
        }
      });
      return false

    })
  })




  /*
   * Helper functions
   */


  function setTitle(text) {
    $('#title, title').text(text);
  }

  function getDB() {
  	return document.URL.split("/")[3]
  }

  function removeQuotes(text) {
    return text.substring(1, text.length - 1)
  }


  /*
   * The code below was provided by Codiqa.  
   * @todo Is this code useful?
   */

  $.widget('mobile.tabbar', $.mobile.navbar, {
    _create: function() {
      // Set the theme before we call the prototype, which will 
      // ensure buttonMarkup() correctly grabs the inheritied theme.
      // We default to the "a" swatch if none is found
      var theme = this.element.jqmData('theme') || "a";
      this.element.addClass('ui-footer ui-footer-fixed ui-bar-' + theme);

      // Make sure the page has padding added to it to account for the fixed bar
      this.element.closest('[data-role="page"]').addClass('ui-page-footer-fixed');


      // Call the NavBar _create prototype
      $.mobile.navbar.prototype._create.call(this);
    },

    // Set the active URL for the Tab Bar, and highlight that button on the bar
    setActive: function(url) {
      // Sometimes the active state isn't properly cleared, so we reset it ourselves
      this.element.find('a').removeClass('ui-btn-active ui-state-persist');
      this.element.find('a[href="' + url + '"]').addClass('ui-btn-active ui-state-persist');
    }
  });

  $(document).bind('pagecreate create', function(e) {
    return $(e.target).find(":jqmData(role='tabbar')").tabbar();
  });
  
  $(":jqmData(role='page')").live('pageshow', function(e) {
    // Grab the id of the page that's showing, and select it on the Tab Bar on the page
    var tabBar, id = $(e.target).attr('id');

    tabBar = $.mobile.activePage.find(':jqmData(role="tabbar")');
    if(tabBar.length) {
      tabBar.tabbar('setActive', '#' + id);
    }
  });

var attachEvents = function() {
	var hoverDelay = $.mobile.buttonMarkup.hoverDelay, hov, foc;

	$( document ).bind( {
		"vmousedown vmousecancel vmouseup vmouseover vmouseout focus blur scrollstart": function( event ) {
			var theme,
				$btn = $( closestEnabledButton( event.target ) ),
				evt = event.type;
		
			if ( $btn.length ) {
				theme = $btn.attr( "data-" + $.mobile.ns + "theme" );
		
				if ( evt === "vmousedown" ) {
					if ( $.support.touch ) {
						hov = setTimeout(function() {
							$btn.removeClass( "ui-btn-up-" + theme ).addClass( "ui-btn-down-" + theme );
						}, hoverDelay );
					} else {
						$btn.removeClass( "ui-btn-up-" + theme ).addClass( "ui-btn-down-" + theme );
					}
				} else if ( evt === "vmousecancel" || evt === "vmouseup" ) {
					$btn.removeClass( "ui-btn-down-" + theme ).addClass( "ui-btn-up-" + theme );
				} else if ( evt === "vmouseover" || evt === "focus" ) {
					if ( $.support.touch ) {
						foc = setTimeout(function() {
							$btn.removeClass( "ui-btn-up-" + theme ).addClass( "ui-btn-hover-" + theme );
						}, hoverDelay );
					} else {
						$btn.removeClass( "ui-btn-up-" + theme ).addClass( "ui-btn-hover-" + theme );
					}
				} else if ( evt === "vmouseout" || evt === "blur" || evt === "scrollstart" ) {
					$btn.removeClass( "ui-btn-hover-" + theme  + " ui-btn-down-" + theme ).addClass( "ui-btn-up-" + theme );
					if ( hov ) {
						clearTimeout( hov );
					}
					if ( foc ) {
						clearTimeout( foc );
					}
				}
			}
		},
		"focusin focus": function( event ){
			$( closestEnabledButton( event.target ) ).addClass( $.mobile.focusClass );
		},
		"focusout blur": function( event ){
			$( closestEnabledButton( event.target ) ).removeClass( $.mobile.focusClass );
		}
	});

	attachEvents = null;
};

$.fn.buttonMarkup = function( options ) {
	var $workingSet = this;

	// Enforce options to be of type string
	options = ( options && ( $.type( options ) == "object" ) )? options : {};
	for ( var i = 0; i < $workingSet.length; i++ ) {
		var el = $workingSet.eq( i ),
			e = el[ 0 ],
			o = $.extend( {}, $.fn.buttonMarkup.defaults, {
				icon:       options.icon       !== undefined ? options.icon       : el.jqmData( "icon" ),
				iconpos:    options.iconpos    !== undefined ? options.iconpos    : el.jqmData( "iconpos" ),
				theme:      options.theme      !== undefined ? options.theme      : el.jqmData( "theme" ) || $.mobile.getInheritedTheme( el, "c" ),
				inline:     options.inline     !== undefined ? options.inline     : el.jqmData( "inline" ),
				shadow:     options.shadow     !== undefined ? options.shadow     : el.jqmData( "shadow" ),
				corners:    options.corners    !== undefined ? options.corners    : el.jqmData( "corners" ),
				iconshadow: options.iconshadow !== undefined ? options.iconshadow : el.jqmData( "iconshadow" ),
				iconsize:   options.iconsize   !== undefined ? options.iconsize   : el.jqmData( "iconsize" ),
				mini:       options.mini       !== undefined ? options.mini       : el.jqmData( "mini" )
			}, options ),

			// Classes Defined
			innerClass = "ui-btn-inner",
			textClass = "ui-btn-text",
			buttonClass, iconClass,
			// Button inner markup
			buttonInner,
			buttonText,
			buttonIcon,
			buttonElements;

		$.each(o, function(key, value) {
			e.setAttribute( "data-" + $.mobile.ns + key, value );
			el.jqmData(key, value);
		});

		// Check if this element is already enhanced
		buttonElements = $.data(((e.tagName === "INPUT" || e.tagName === "BUTTON") ? e.parentNode : e), "buttonElements");

		if (buttonElements) {
			e = buttonElements.outer;
			el = $(e);
			buttonInner = buttonElements.inner;
			buttonText = buttonElements.text;
			// We will recreate this icon below
			$(buttonElements.icon).remove();
			buttonElements.icon = null;
		}
		else {
			buttonInner = document.createElement( o.wrapperEls );
			buttonText = document.createElement( o.wrapperEls );
		}
		buttonIcon = o.icon ? document.createElement( "span" ) : null;

		if ( attachEvents && !buttonElements) {
			attachEvents();
		}
		
		// if not, try to find closest theme container	
		if ( !o.theme ) {
			o.theme = $.mobile.getInheritedTheme( el, "c" );	
		}		

		buttonClass = "ui-btn ui-btn-up-" + o.theme;
		buttonClass += o.inline ? " ui-btn-inline" : "";
		buttonClass += o.shadow ? " ui-shadow" : "";
		buttonClass += o.corners ? " ui-btn-corner-all" : "";

		if ( o.mini !== undefined ) {
			// Used to control styling in headers/footers, where buttons default to `mini` style.
			buttonClass += o.mini ? " ui-mini" : " ui-fullsize";
		}
		
		if ( o.inline !== undefined ) {			
			// Used to control styling in headers/footers, where buttons default to `mini` style.
			buttonClass += o.inline === false ? " ui-btn-block" : " ui-btn-inline";
		}
		
		
		if ( o.icon ) {
			o.icon = "ui-icon-" + o.icon;
			o.iconpos = o.iconpos || "left";

			iconClass = "ui-icon " + o.icon;

			if ( o.iconshadow ) {
				iconClass += " ui-icon-shadow";
			}

			if ( o.iconsize ) {
				iconClass += " ui-iconsize-" + o.iconsize;
			}
		}

		if ( o.iconpos ) {
			buttonClass += " ui-btn-icon-" + o.iconpos;

			if ( o.iconpos == "notext" && !el.attr( "title" ) ) {
				el.attr( "title", el.getEncodedText() );
			}
		}
    
		innerClass += o.corners ? " ui-btn-corner-all" : "";

		if ( o.iconpos && o.iconpos === "notext" && !el.attr( "title" ) ) {
			el.attr( "title", el.getEncodedText() );
		}

		if ( buttonElements ) {
			el.removeClass( buttonElements.bcls || "" );
		}
		el.removeClass( "ui-link" ).addClass( buttonClass );

		buttonInner.className = innerClass;

		buttonText.className = textClass;
		if ( !buttonElements ) {
			buttonInner.appendChild( buttonText );
		}
		if ( buttonIcon ) {
			buttonIcon.className = iconClass;
			if ( !(buttonElements && buttonElements.icon) ) {
				buttonIcon.appendChild( document.createTextNode("\u00a0") );
				buttonInner.appendChild( buttonIcon );
			}
		}

		while ( e.firstChild && !buttonElements) {
			buttonText.appendChild( e.firstChild );
		}

		if ( !buttonElements ) {
			e.appendChild( buttonInner );
		}

		// Assign a structure containing the elements of this button to the elements of this button. This
		// will allow us to recognize this as an already-enhanced button in future calls to buttonMarkup().
		buttonElements = {
			bcls  : buttonClass,
			outer : e,
			inner : buttonInner,
			text  : buttonText,
			icon  : buttonIcon
		};

		$.data(e,           'buttonElements', buttonElements);
		$.data(buttonInner, 'buttonElements', buttonElements);
		$.data(buttonText,  'buttonElements', buttonElements);
		if (buttonIcon) {
			$.data(buttonIcon, 'buttonElements', buttonElements);
		}
	}

	return this;
};

$.fn.buttonMarkup.defaults = {
	corners: true,
	shadow: true,
	iconshadow: true,
	iconsize: 18,
	wrapperEls: "span"
};

function closestEnabledButton( element ) {
    var cname;

    while ( element ) {
		// Note that we check for typeof className below because the element we
		// handed could be in an SVG DOM where className on SVG elements is defined to
		// be of a different type (SVGAnimatedString). We only operate on HTML DOM
		// elements, so we look for plain "string".
        cname = ( typeof element.className === 'string' ) && (element.className + ' ');
        if ( cname && cname.indexOf("ui-btn ") > -1 && cname.indexOf("ui-disabled ") < 0 ) {
            break;
        }

        element = element.parentNode;
    }

    return element;
}

	
})(jQuery);

function deleteAllFeedback() {
  $.couch.db("library").view("library/feedback_all", {
    success: function(result) {
      $.each(result.rows, function(key, value) {
        $.couch.db("library").openDoc(value.key, {
          success: function(doc) {
            $.couch.db("library").removeDoc(doc)
          }
        })
      })
    }
  })
}
