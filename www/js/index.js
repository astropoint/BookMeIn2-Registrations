$(document).ready(function(){
			//This will need to be removed when it's uploaded to phone...
			document.addEventListener('deviceready', onDeviceReady,false);
			//onDeviceReady();
			checkInternet();
			checkMobile();
			
			//check the status of the internet every 10 seconds
			setInterval(function(){
				checkInternet();
				
				
				refreshcount++;
			}, 10000);
			
			setTimeout(checkIfLoggedIn, 20);
			/*
			cordova.getAppVersion.getVersionNumber(function (version) {
				$('.versionnumber').html('v'+version);
			});
			* */
});

var refreshcount = 0;
var agendasort = 'desc';
var loggedIn = false;

var spinner = '<svg class="svg-inline--fa fa-spinner fa-w-16 fa-spin" aria-hidden="true" data-prefix="fas" data-icon="spinner" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"></path></svg>';

var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var destinationType;
function onDeviceReady(){
	
		pictureSource=navigator.camera.PictureSourceType;
		destinationType=navigator.camera.DestinationType;
}

var siteURL = "https://reg.bookmein2.com";
var apiURL = siteURL+"/api/checkinapi.php";
var isInternet = true;
var curconference = -1;
var curapikey = "";
var maxUploadSize = 8;
var apikey = "";

function checkInternet(){
	var data = "action=checkconnection"; 
	var success = false;
	
	$.ajax({
			url: apiURL,
			data: data,
			dataType: "json",
			type: 'post', 
			error: function(){
					// will fire when timeout is reached
					isInternet = false;
			},
			success: function(response){
				if(response.success){
					isInternet = true;
				}else{
					isInternet = false;
				}
			},
			timeout: 3000 // sets timeout to 3 seconds
	});
}

function checkIfLoggedIn(requirelogin){
	loggedIn = localStorage.getItem('loggedIn');
	
	if(requirelogin && loggedIn!='1'){
		window.location.href='#attendeeLogin';
	}else if(!requirelogin && loggedIn=='1'){
		
		$('.conference_name').html(localStorage.getItem('conference_name'));
		$('#apphelptext').html(localStorage.getItem('apphelptext'));
		
		apikey = localStorage.getItem('apikey');
		
		window.location.href='#attendeeHome';
		
	}
}

function checkMobile(){
	data = "action=checkmobile"
	$.ajax({
		url: apiURL,
		data: data,
		dataType: "json",
		type: 'post'
	}).done(function(response){
		if(response.success){
			localStorage.setItem('mobile', response.data.mobile);
			if(!response.data.mobile){
				$('#scanbutton').css('height', '160px');
			}
		}
	});
}

$(document).on('change keyup', '#attendeesurname', function(e){
	e.preventDefault();
	var nametocheck = $(this).val();
	if(nametocheck.length>=3){
		$('#surnameselect').show();
		$('#surnameselect').html(spinner);
		$('#scanresponsetext').empty();
		$.ajax({
			type: "POST",
			data: {
				"action": "getnamematches",
				"apikey": apikey,
				"name": nametocheck
			},
			url: apiURL,
			dataType: 'json',
			success: function(response) {
				if(!response.success){
					$('#scanresponsetext').html(response.message);
				}else{
					$('#attendeesurnameselect').empty();
					var html = "";         
					var numfound = parseInt(response.data.total);
					
					$.each(response.data.results, function(key, attendee) {
						html += "<option value='"+attendee.reference+"'>"+attendee.full_name+"</option>";
					});
					var response = numfound+" attendee";
					if(numfound!=1){
						response += "s";
					}
					response += " found";
					$('#numresultsbysurnamefound').html(numfound+" attendees found");
					$('#attendeesurnameselect').html(html);
					$('#surnameselectdiv').show();
					$('#attendeesurnameselect').trigger('change');
					$('#selectattendeebysurnamebuttonnew').show();
				}
				$('#surnameselect').html('');
			}
		});
	}else{
		$('#selectattendeebysurnamebuttonnew').hide();
		$('#surnameselectdiv').hide();
		$('#surnameselect').html('');
	}
});

$(document).on('keyup', '#selectattendeesurname', function(e){
	e.preventDefault();
	var nametocheck = $(this).val();
	
	if(nametocheck.length>=3){
		$('#surnameselectfromlist').html(spinner);
		var uuid = $('#uuid').val();
		var hostaddress = $('#hostaddresshidden').val();

		$.ajax({
			type: "POST",
			data: {
				"action": "getnamematches",
				"apikey": apikey,
				"nametocheck": nametocheck
			},
			url: "https://"+hostaddress+"/appaccess/getnamematches.php",
			dataType: 'json',
			success: function(response) {
				if(!response.success){
					$('#scanresponsetext').html("No name sent");
				}else{
					$('#attendeesurnameselectlist').empty();
					var html = "";
					$.each(response.data.results, function(attendee) {
						html += "<option value='"+attendee.reference+"'>"+attendee.full_name+"</option>";
					});
					$('#attendeesurnameselectlist').html(html);
					$('#attendeesurnameselectlist').show();
					$('#attendeesurnameselectlist').trigger('change');
					$('#gotoselectedattendee').show();
					$('#surnameselectfromlist').html('');
				}
			}
		});
	}else{
		$('#selectattendeebysurnamebuttonnew').hide();
		$('#surnameselectfromlist').html('');
		$('#gotoselectedattendee').hide();
		$('#attendeesurnameselectlist').show();
	}
});

function registerAttendeeBySurname(){
	var eventid = $('#eventscanid').val();
	var attendeeref = $('#attendeesurnameselect').val();
	if(typeof attendeeref != 'undefined'){
		if(attendeeref=='blank'){
			$('#scanresponsetext').html("No attendees were found, please try again");
		}else{
			registerAttendee(eventid,attendeeref); 
		}
	}
	$('#selectattendeebysurnamebuttonnew').hide();
	$('#attendeesurname').val('');
	$('#attendeesurnameselect').hide();
}

function checkEventScan(){
	var eventid = $('#eventscanid').val();
	if(eventid=='' || eventid==0){
		window.location.href = '#attendeeHome';
	}
}

function checkRegNotes(){
	var regid = $('#regid').val();
	if(regid=='' || regid==0){
		window.location.href = '#attendeeHome';
	}
}

function checkAllNotes(){
	var regid = $('#eventregid').val();
	if(regid=='' || regid==0){
		window.location.href = '#attendeeHome';
	}
}

$(document).on('click', '#close_btn', function(e){
	e.preventDefault();
	resetAllFields();
	window.location.href='#attendeeLogin';
});

$(document).on('click', '#scanbutton', function(e){
	e.preventDefault();
	var eventid = $('#eventscanid').val();
	
	cordova.plugins.barcodeScanner.scan(
		function (result) {
			if(!result.cancelled && result.text!=''){
				registerAttendee(eventid, result.text);
			}
		},
		function (error) {
			alert("Scanning failed: " + error);
		},
		{
			preferFrontCamera : false, // iOS and Android
			saveHistory: true, // Android, save scan history (default false)
			prompt : "Place a barcode inside the scan area", // Android
			resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
			disableAnimations : true, // iOS
			disableSuccessBeep: false // iOS and Android
		}
	);
});

function saveNotes(){
	var uuid = $('#uuid').val();
	var hostaddress = $('#hostaddresshidden').val();
	
	var regid = $('#regid').val();
	var regnotes = $('#regnotestext').val();
	var quality = 0;
		if($('#qual1').prop('checked')){
			quality = 1;
	}else if($('#qual2').prop('checked')){
		quality = 2;
	}else if($('#qual3').prop('checked')){
		quality = 3;
	}

	var loc = $('#loc').val();

	$.ajax({
		type: "POST",
		data: {
			"action": "setnotesforlocation",
			"apikey": apikey,
			"regid": regid,
			"regnotes": regnotes,
			"quality": quality
		},
		url: apiURL,
		dataType: 'json',
		success: function(response) {
			if(!response.success){
				$('#regnotesresponse').html(response.message);
			}else{
				$('#gotorecentlyregistered').hide();
				if(loc=='0'){
					$('#regnotes').val('');
					$('#pagename').html($('#eventname').val());
					$('#scanresponsetext').html(response.text);
					window.location.href = '#eventScan';
					$('#selectattendeebysurnamebuttonnew').hide();
					$('#surnameselectdiv').hide();
					$('#attendeesurnameselect').empty();
					
					$('#attendeesurnameselect').trigger('change');
					$('#numresultsbysurnamefound').html('');
				}else if(loc=='1'){
					getRecentlyRegistered(-1, 0);
					$('#gotoscanbarcodes').show();
					window.location.href='#eventRegs';
				}
			}
		}
	});
}

function registerAttendee( eventid, barcode){
	var uuid = $('#uuid').val();
	var hostaddress = $('#hostaddresshidden').val();
	
	$.ajax({
		type: "POST",
		data: {
			"action": "registerattendee",
			"apikey": apikey,
			"eventid": eventid,
			"scandata": barcode
		},
		url: apiURL,
		dataType: 'json',
		success: function(response) {
			if(!response.success || !response.data.success){
				$('#scanresponsetext').html(response.data.text);
			}else{
				$('#surnameselect').html('');
				$('#attendeesurname').val('');
				$('#selectattendeebysurnamebuttonnew').hide();
				$('#surnameselectdiv').hide();
				if(response.data.eventtype==1){
					//go to save notes page
					$('#regid').val(response.data.insertid);
					$('#loc').val('0');
					$('#regnotestext').val('');
					$('#pagename').html("Add notes for " + response.data.name);
					$('#gotorecentlyregistered').show();
					window.location.href='#regNotes';
				}else{
					$('#scanresponsetext').html(response.data.text);
				}
			}
		}
	});
}

function showToast(text){
	console.log(text);
	//alert(text);
	window.plugins.toast.show(text);
}

$(document).on('click', '.mypage', function(e){
	/*
	 * horrible fudge, the left panel always comes out too far covering part of the page so we
	 * have to check whether the page has been clicked on *unless* it's the menu icon itself
	 */
	if(!$(e.target).hasClass('hamburger_icon') && $('#leftpanel').hasClass('ui-panel-open')){
		$( "#leftpanel" ).panel( "close" );
	} 
});

$(document).on('click', '.menu_link', function(e){
	var clicked = $(this).attr('href');
	var active= $('.ui-page-active').attr('id');
	
	if(clicked=='#'+active){
		$('#leftpanel').panel('close');
	}
});

$(document).on('click', '.goback', function(e){
	window.history.back();
});

$(document).on('click',"#log_in_btn",function(e){
	var action = "login";
	var username = $('#login_form').find('input[name="username"]').val();
	var eventref = $('#login_form').find('input[name="event_reference"]').val();
	var password = $('#login_form').find('input[name="password"]').val();
	var errors = [];
	
	var goodform = true;
	if(!isInternet){
		goodform = false;
		errors.push("Unable to connect to API.  Please check your internet connection");
		//showToast("Unable to connect to API.  Please check your internet connection");
	}
	if(username==''){
		goodform = false;
		errors.push("Your username cannot be blank");
	}
	if(eventref==''){
		goodform = false;
		errors.push("The event reference cannot be blank");
	}
	if(password==''){
		goodform = false;
		errors.push("The password cannot be blank");
	}
	$('#login_response').html("");
	
	if(goodform){
		data = "action=login&username="+username+"&eventref="+eventref+"&password="+password
		$.ajax({
			url: apiURL,
			data: data,
			dataType: "json",
			type: 'post'
		}).done(function(response){
			if(response.success){
				if(response.data.loggedin){
					localStorage.setItem("loggedIn", 1);
					localStorage.setItem("username", username);
					localStorage.setItem("userid", response.data.userid);
					localStorage.setItem("apikey", response.data.apikey);
					localStorage.setItem("conferenceid", response.data.conferenceid);
					localStorage.setItem("conference_name", response.data.conference_name);
					localStorage.setItem("conferenceid", response.data.conferenceid);
					localStorage.setItem("apphelptext", response.data.apphelptext);
					localStorage.setItem("security", parseInt(response.data.security));
					
					$('.conference_name').html(response.data.conference_name);
					$('#apphelptext').html(response.data.apphelptext);
					
					if(parseInt(response.data.security)>=9){
						$('#gottoselectattendee').show();
					}else{
						$('#gottoselectattendee').hide();
					}
					
					window.location.href = "#attendeeHome";
				}else{
					$('#login_response').html("The details you entered did not match an account in our system");
				}
			}else{
				$('#login_response').html("Unable to call API.  Error: "+response.error);
			}
		});
	}else{
		var errorstring = errors.join("<br>");
		console.log(errorstring);
		$('#login_response').html(errorstring);
	}
});

function populateList(){

	
	$.ajax({
		type: "POST",
		data: {
			"action": "getlocationlist",
			"apikey": apikey
		},
		url: apiURL,
		dataType: 'json',
		success: function(response) {
			if(response.success){
				$('#eventselect').html('');
				var numlocations = 0;
				var mainlocid = 0;
				var output = "";
				var firstelementid = 0;
				var firstelementname = "";
				$.each(response.data.list, function(index, item) {
					output += "<option value='"+item.id+"'>"+item.name+"</option>";
					if(numlocations==0){
						firstelementid = item.id;
						firstelementname = item.name;
					}
					numlocations++;
					mainlocid = item.id;
					
				});
				
				$('#eventselect').html(output);
				$('#eventselect').trigger('change');
				if(numlocations==1){
					//Only one location allowed to send them straight there
					$('#eventscanid').val(mainlocid);
					$('#event_name').html(firstelementname);
					selectEvent();
				}
			}
		}
	});
}

function selectEvent(){
	var eventid = $('#eventselect').val();
	
	$('#eventscanid').val(eventid);
	$('#event_name').html($("#eventselect option:selected").text());
	
	window.location.href='#eventScan';
}

function getRecentlyRegistered(eventid, preregistered){
	var uuid = $('#uuid').val();
	var sorttype = $('#sorttype').val();
	var security = localStorage.getItem('security');
	if(eventid==-1){
		eventid = $('#eventregid').val();
	}
	
	$.ajax({
		type: "POST",
		data: {
			"action": "getrecentregistrations",
			"apikey": apikey,
			"eventid": eventid,
			"sorttype": sorttype,
			"preregistered": preregistered,
		},
		url: apiURL,
		dataType: 'json',
		success: function(response) {
			if(!response.success){
				$('#recentregistrations').html(response.message);
			}else{
				var html = "<h3>Attendees registered for " + $('#event_name').val() + "</h3>";
				html += "<table id='recentregtable' class='tablesorter  tablesorter-bootstrap'>"
				html += "<thead><tr>";
				html += "<th onclick='resortName();' class='tablesorterheader";
				if(sorttype=='nameup'){
					html += " headerSortUp";
				}else if(sorttype=='namedown'){
					html += " headerSortDown";
				}
				html += "'>Name</th>";
										
				if(preregistered=='0'){
					html += "<th style='padding-right: 30px;' onclick='resortDate();' class='tablesorterheader";
					if(sorttype=='dateup'){
						html += " headerSortUp";
					}else if(sorttype=='datedown'){
						html += " headerSortDown";
					}
					html += "'>Time<br />registered</th>";  
				}
				html += "<th>&nbsp</th></tr></thead>";
				html += "<tbody>\n";
				$.each(response.data.registrations, function(index, registration) {
					html += "<tr>";
					html += "<td><br />";
					if(eventid=='1' && security=='9'){
							//html += "<a href='#' id='gotoattendee_"+item[itemid].attendeeid+"' class='gotoattendeelink'>";
					}
					html += registration.name
					html += "</td>";
					if(preregistered=='0'){
						html += "<td><br />"+registration.time+"</td>";
					}
					html += "<td><button class='ui-btn ui-shadow ui-corner-all' onclick='goToSaveNotes("+registration.id+")'>Notes</button></td>";
					html += "</tr>\n";
				});
				html += "</tbody></table>";
				$('#recentregistrations').html(html);
			}
		}
	});
	
}

function resortDate(){
	var sorttype = $('#sorttype').val();
	if(sorttype=='datedown'){
		sorttype = 'dateup';
	}else if(sorttype=='dateup'){
		sorttype = 'datedown';
	}else{
		sorttype = 'datedown';
	}
	$('#sorttype').val(sorttype);
	getRecentlyRegistered(-1, 0);
}

function resortName(){
	var sorttype = $('#sorttype').val();
	if(sorttype=='namedown'){
		sorttype = 'nameup';
	}else if(sorttype=='nameup'){
		sorttype = 'namedown';
	}else{
		sorttype = 'namedown';
	}
	$('#sorttype').val(sorttype);
	getRecentlyRegistered(-1, 0);
}

function goToSaveNotes(noteid){
	
	$('#regid').val(noteid);
	$('#loc').val(1);
	
	$.ajax({
		type: "POST",
		data: {
			"action": "getnotesforlocation",
			"apikey": apikey,
			"regid": noteid
		},
		url: apiURL,
		dataType: 'json',
		success: function(response) {
			if(!response.success){
				$('#regnotesresponse').html(response.message);
			}else{				
				
				$('#gotoscanbarcodes').hide();
				$('#regnotestext').val(response.data.notes);
				$('#qual'+response.data.lead_quality).prop('checked', true);
				$('#gotorecentlyregistered').show();
				
				
				window.location.href = '#regNotes'; 
				
				$("input[name='quality']").checkboxradio();
				$("input[name='quality']").checkboxradio("refresh"); //otherwise the radio button doesn't update with the actual selected value
			}
		}
	});	
}

function goToRecentRegList(){
	var eventid = $('#eventselect').val();
	getRecentlyRegistered(eventid, 0);
	
	$('#eventscanid').val(eventid);
	$('#event_name').html($("#eventselect option:selected").text());
	$('#eventregid').val(eventid);
	
	window.location.href='#eventRegs';
}

function dateWithoutSeconds(date){
	return date.substring(0, date.length - 3);
}

//Page change listener - calls functions to make this readable. NB due to the way the "pages" are loaded we cannot put this inside the document ready function.
//Sham - this and the below are there for expandability, can be used for selective synch so only page relevant data is refreshed.
$(document).on( "pagecontainerchange", function( event, ui ) {

	switch (ui.toPage.prop("id")) {
		case "attendeeHome":
			checkIfLoggedIn(true);
			populateList();
			break;
		case "termsAndPrivacy":
			break;
		case "attendeeLogin":
			checkIfLoggedIn(false);
			break;
		case "appHelpPage":
			checkIfLoggedIn(true);
			break;
		case "eventScan":
			checkIfLoggedIn(true);
			checkEventScan();
			break;
		case "regNotes":
			checkIfLoggedIn(true);
			checkRegNotes();
			break;
		case "eventRegs":
			checkIfLoggedIn(true);
			checkAllNotes();
			break;
		default:
			console.log("NO PAGE INIT FUNCTION")
			break;
	}
});

//Sham -returns time since "time", formatted
//to <60s then <60m then <24h:0m then >1d depending on magnitude
//TIME MUST BE UNIX
function since_time(time){
    var thismoment = Date.now();
    var diff = thismoment - time;
    diff /= 1000;
    diff = Math.floor(diff);
    if(diff < 60) {
        return(diff+"s");
    } else {
        diff /= 60;
        diff = Math.floor(diff);
        if(diff < 60){
            return(diff+"m");
        } else {
            var hrs = diff / 60;
            hrs = Math.floor(hrs);
            if(hrs >=24){
                var days = Math.floor(hrs/24);
                return(days+"d");
            } else {
            diff %= 60;
            return(hrs+"h,"+diff+"m");
            }
        }
    }
}


function hide_div(div_id) {   
	document.getElementById(div_id).classList.toggle("hide");
}

function toggle_content(current, alternative) { 
	hide_div(current);
	hide_div(alternative);
}


function resetAllFields(){
	$('#login_response').html('');
	$('.conference_name').html('');
	
	
	localStorage.setItem("loggedIn", 0);
	localStorage.setItem("username", "");
	localStorage.setItem("userid", "");
	localStorage.setItem("apikey", "");
	localStorage.setItem("conferenceid", 0);
}

