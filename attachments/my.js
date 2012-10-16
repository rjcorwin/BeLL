(function($) {

  /* 
   * Page: page-login
   */

  $("#page-login").live("pagebeforeshow", function(e, d) {
    $("#login").bind("submit", function(){
      var currentTime = new Date()
      var form = {
        username: $("input:eq(0)").val(),
        password: $("input:eq(1)").val(),
      } 
      $.couch.login({
        name: form.username ,
        password: form.password,
        success: function(data) {
            alert("You have logged in successfully")
            $.mobile.changePage("#page-student-dashboard");
        },
        error: function(status) {
            alert("Woops! Your username and password combination was not found. Try again.")
        }
      });
      return false

    })
  })

  /* 
   * Page: page-student-dashboard
   */

  $("#page-student-dashboard").live("pagebeforeshow", function(e, d) {

    // clear the content region
    $("#page-student-dashboard .div-my-subjects").html("<div class='loading'>Loading...<img src='images/ajax-loader.png'></div> ")

    var db = getDB();

    $.getJSON('/' + db + '/_design/library/_view/subjects_all', function(data) {
      var response = data
      var subjects = {}
      $.each(response.rows, function(id, data) {
        subjects[data.key] = data
      })

      // Render the subject list
      var html = 
      '<ul class="my-subjects" data-role="listview" data-divider-theme="b" data-inset="true">' +
        '<li data-role="list-divider" role="heading">' +
           'My Subjects' +  
        '</li>' 
      ;

      $.each(subjects, function(key, value) {
        html += 
              '<li data-theme="c">' +
                  '<a href="#page-which-level' + '&subject=' + key + '" >' +
                      key +
                  '</a>' + 
              '</li>'
        ;
      })

      html += '</ul>'

      // Print the results to the screen
      $("#page-student-dashboard .div-my-subjects").html(html)

      // Render the results using jQM render 
      $("#page-student-dashboard").trigger("create");
    });
  })


  /* 
   * Page: page-which-level
   */

  $("#page-which-level").live("pagebeforeshow", function(e, d) {

    // clear the content region
    $("#page-which-level .ui-content").html("<div class='loading'>Loading...<img src='images/ajax-loader.png'></div> ")

    $("#page-which-level a.back-button").attr("href", "#page-student-dashboard")

    var db = getDB();
    var subject = $.url().fparam('subject')

    $.getJSON('/' + db + '/_design/library/_view/subject_levels?group=true&startkey=["' + subject + '",1]&endkey=["' + subject + '",99]', function(data) {
      var response = data
      var levels = []
      $.each(response.rows, function(id, data) {
        levels.push(data.key[1]) 
      })

      // Render the subject list
      var html = 
        '<div data-role="content" style="padding: 15px">' +
          '<ul data-role="listview" data-divider-theme="b" data-inset="true">'
      ;

      $.each(levels, function (key, level) {
        html += 
              '<li data-theme="b">' +
                  '<a href="#page-which-resource&subject=' + subject + '&level=' + level + '" >' +
                      level +
                  '</a>' + 
              '</li>'
        ;
      })

      html +=
          '</ul>' +
        '</div>'
      ;

      // Print the results to the screen
      $("#page-which-level .ui-content").html(html)

      // Render the results using jQM render 
      $("#page-which-level").trigger("create");
    });
  })



  /*
   * Page: page-which-grade
   */

  $("#page-which-grade").live("pageshow", function(e, d) {

    var db = getDB();
    var grades
    $.getJSON('/' + db + '/_design/library/_view/grades?group=true', function(data) {
      
      var html = 
      	'<div data-role="content" style="padding: 15px">' +
	        '<ul data-role="listview" data-divider-theme="b" data-inset="true">'
      ;

      $.each(data.rows, function (index, grade) {
        html += 
              '<li data-theme="b">' +
                  '<a href="#page-which-subject&grade=' + grade.key + '" >Grade ' +
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
      $("#page-which-grade .ui-content").html(html)

      // Render the results using jQM render 
      $("#page-which-grade").trigger("create");

    })
  })




  /* 
   * Page: page-which-subject
   */

  $("#page-which-subject").live("pagebeforeshow", function(e, d) {

    // clear the content region
    $("#page-which-subject .ui-content").html("<div class='loading'>Loading...<img src='images/ajax-loader.png'></div> ")

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
              '<li data-theme="b">' +
                  '<a href="#page-which-resource&grade=' + grade + '&subject=' + subject.name + '" >' +
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
      $("#page-which-subject .ui-content").html(html)

      // Render the results using jQM render 
      $("#page-which-subject").trigger("create");
    });
  })




  /*
   * Page: page-which-resource
   */

  $("#page-which-resource").live("pagebeforeshow", function(e, d) {

    // clear the content region
    $("#page-which-resource .ui-content").html("<div class='loading'>Loading...<img src='images/ajax-loader.png'></div> ")

    var db = getDB();
    var grade = $.url().fparam('grade')
    var subject = $.url().fparam('subject')
    var level = $.url().fparam('level')


    if (level) {
      $("#page-which-resource a.back-button").attr("href", "#page-which-level&subject=" + subject)
      var url = '/' + db + '/_design/library/_view/subject_level_resources?key=["' + subject + '",' + level + ']'
    }
    else if (grade) {
      $("#page-which-resource a.back-button").attr("href", "#page-which-subject&grade=" + grade + "&subject=" + subject)
      var url = '/' + db + '/_design/library/_view/grade_subject_resources?key=[' + grade + ',"' + subject + '"]'
    }
    
    $.getJSON(url, function(data) {
      var response = data
      var subjects = []

      var resources = []
      $.each(response.rows, function(id, data) {
        resources[id] = {grade: data.key[0], subject: data.key[1], title: data.value, id: data.id, id_safe: encodeURIComponent(data.id)}
      })

      $("#page-which-resource .ui-content").html('<div class="resource-list" data-role="collapsible-set" data-theme="b" data-content-theme="e"></div>')

      $.each(resources, function (index, resource) {
        $.getJSON('/' + db + '/' + resource.id_safe, function(resource_data) {
          if(resource_data._attachments.hasOwnProperty("picture.png")) {
            var book_image = '/' + db + "/" + resource_data._id + "/picture.png"
          }
          else {
            // Default book image
            var book_image = '/' + db + "/_design/library/images/book.png"
          }

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

          //
          // Add our links to the resource
          //
          if (resource_data.resource_url) {
            item +=             '<a data-role="button" data-theme="b" href="/' + db + '/' + resource_data.resource_url + '" ' +
                                  'data-icon="arrow-d" data-iconpos="right">' +
                                      'begin' +
                                '</a>' 
            ;
          }          
          else if (resource_data._attachments) {
            $.each(resource_data._attachments, function (key, value) {
              item +=             '<a rel="external" data-role="button" data-theme="b" href="/' + db + '/' + encodeURIComponent(resource_data._id) + '/' + encodeURIComponent(key) + '" ' +
                                  'data-icon="arrow-d" data-iconpos="right">' +
                                      'download ' + key +
                                  '</a>' 
              ;
            })
          }


          item +=               '<div style=" text-align:center">' +
                                    '<img style="width: 167px; height: 183px" src="' + book_image + '">' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<a data-role="button" data-theme="b" href="#page-feedback' + '&id=' + encodeURIComponent(resource_data._id) + '">' +
                            'feedback' +
                        '</a>' +
                    '</div>'
          ;

          // Print the results to the screen
          $("#page-which-resource .ui-content .resource-list").append(item)

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

    // clear the previously generated list 
    $("#page-feedback .list-feedback-of-resource").html("<div class='loading'>Loading...<img src='images/ajax-loader.png'></div> ")

    var resourceId = $.url().fparam("id")
    var resourceId_safe = encodeURIComponent(resourceId)
    console.log(resourceId)
    var db = getDB()
    
    // Back button
    $.getJSON('/' + db + '/' + resourceId_safe, function(resource_data) {
      $("#page-feedback a.back-button").attr("href", "#page-which-resource&level=" + resource_data.level + "&subject=" + resource_data.subject)
    })

    // This page is a rare case where users pull a u-turn after submitting feedback.  
    // This causes the browser's back functionality to go back to the form when we want to 
    // go back to the resources page with the correct parameters.
    // @todo

    // Add id to the "submit your own" button
    $("a.submit-your-own-comment").attr("href", "#page-submit-feedback&id=" + resourceId_safe + "")

    // Add the list of comments
    
    $.couch.db(db).view('library/feedback_by_resource', {
      key: resourceId,
      success: function(resource_feedback_data) {
        // Clear the Loading text
        $("#page-feedback .list-feedback-of-resource").html("")
        if(resource_feedback_data.rows) {
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
                $("#page-feedback").trigger("create");
         
              }
            })
          })
        }
        else {
          var html = "No feedback for this resource."
          $(".list-feedback-of-resource").append(html)
          $("#page-feedback").trigger("create");
        }


        // Render the list
      }
    })
  })


//pagebeforecreate
$("#page-submit-feedback").live("pagebeforecreate", function(e, d) {
    $("#form-comment-and-rate").bind("submit", function(){
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
   * Page: page-submit-feedback
   */

  $("#page-submit-feedback").live("pagebeforeshow", function(e, d) {

    // Back button
    $("#page-submit-feedback .back-button").attr('href', '#page-feedback' + '&id=' + $.url().fparam('id') )

    // It's ok for form values to persist but not the actual comment value
    $("textarea:eq(0)").val("")

    // Set the resource id
    $("input#textinput4").attr("value", decodeURIComponent($.url().fparam('id')))
    $("input#textinput4").textinput('disable')

    
  })




  /*
   * Helper functions
   */


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
