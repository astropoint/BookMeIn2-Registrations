$(document).ready(function(){
	//This will need to be removed when it's uploaded to phone...
	document.addEventListener('deviceready', onDeviceReady,false);
	//onDeviceReady();
	checkInternet(null);
	checkMobile();
	
	numattendees = localStorage.getItem("numattendees");
	if(numattendees===null){
		numattendees = 0;
		localStorage.setItem("numattendees", 0);
	}
	loggedin = localStorage.getItem("loggedin");
	if(loggedin===null){
		loggedin = 0;
		localStorage.setItem("loggedin", 0);
	}
	
	//check the status of the internet every 10 seconds
	setInterval(function(){
		if(loggedin=='1'){
			checkInternet(tryNormalUploads);
		}else{
			checkInternet(tryOldUploads);
		}
		
		refreshcount++;
	}, 10000);
	
	setTimeout(checkIfLoggedIn, 20);
	
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
		cordova.getAppVersion.getVersionNumber(function (version) {
				$('.versionnumber').html(version);
		});
}

var siteURL = "https://bookmein2.com";
var apiURL = siteURL+"/api/checkinapi.php";
var isInternet = true;
var curconference = -1;
var curapikey = "";
var maxUploadSize = 8;
var apikey = "";
var numlocations = 0;
var numattendees = 0;

function checkInternet(callback){
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
					$('#selectattendeecontent').hide();
					$('#selectattendeecontentnotavailable').show();
			},
			success: function(response){
				if(response.success){
					isInternet = true;
					allow_name_search = localStorage.getItem('allow_name_search');
					if(allow_name_search==1){
						$('#selectattendeecontent').show();
					}else{
						$('#selectattendeecontent').hide();
					}
					$('#selectattendeecontentnotavailable').hide();
					if(callback!==null){
						callback();
					}
				}else{
					isInternet = false;
					$('#selectattendeecontent').hide();
					$('#selectattendeecontentnotavailable').show();
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
		
		afterLoginCheck();
		
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
					$('#attendeesurnameselect').html('');
					var html = "";
					var numfound = parseInt(response.data.total);
					
					$.each(response.data.results, function(key, attendee) {
						var valuename = attendee.reference+"_"+attendee.first_name+"_"+attendee.last_name+"_"+attendee.job_title+"_"+attendee.organisation;
						html += "<option value='"+valuename+"'>"+attendee.full_name+"</option>";
					});
					var response = numfound+" attendee";
					if(numfound!=1){
						response += "s";
					}
					response += " found";
					$('#numresultsbysurnamefound').html(numfound+" attendees found");
					$('#attendeesurnameselect').html(html);
					$('#attendeesurnameselect').trigger('change');
					$('#surnameselectdiv').show();
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
					$('#selectattendeeresponse').html(response.message);
				}else{
					$('#attendeesurnameselectlist').empty();
					var html = "";
					$.each(response.data.results, function(index, attendee) {
						html += "<option value='"+attendee.reference+"'>"+attendee.full_name+"</option>";
					});
					$('#attendeesurnameselectlist').html(html);
					$('#attendeesurnameselectlist').trigger('change');
					$('#attendeesurnamelistselectdiv').show();
					$('#gotoselectedattendee').show();
				}
			}
		});
	}else{
		$('#selectattendeebysurnamebuttonnew').hide();
		$('#surnameselectfromlist').html('');
		$('#attendeesurnamelistselectdiv').hide();
		$('#gotoselectedattendee').hide();
	}
});

$(document).on("click", "#gotoselectedattendee", function(e){
	e.preventDefault();
	var attendeereference = $('#attendeesurnameselectlist').val();
	$('#surnameselectfromlist').hide();
	$('#viewattendeereference').val(attendeereference);
	goToViewAttendee(attendeereference);
});

function registerAttendeeBySurname(){
	var eventid = $('#eventscanid').val();
	var type = $('#eventscantype').val();
	var attendeeref = $('#attendeesurnameselect').val();
	if(typeof attendeeref != 'undefined'){
		if(attendeeref=='blank'){
			$('#scanresponsetext').html("No attendees were found, please try again");
		}else{
			registerAttendee(eventid,attendeeref, type); 
		}
	}
	$('#selectattendeebysurnamebuttonnew').hide();
	$('#attendeesurname').val('');
	$('#attendeesurnameselect').empty();
	$('#surnameselectdiv').hide();
}

function checkEventScan(){
	var eventid = $('#eventscanid').val();
	if(eventid=='' || eventid==0){
		window.location.href = '#attendeeHome';
	}
}

function updateLocalAttendeeName(barcode, updateregnotestitle){
	
	$.ajax({
		type: "POST",
		data: {
			"action": "getattendeedetails",
			"apikey": apikey,
			"barcode": barcode
		},
		url: apiURL,
		dataType: 'json',
		success: function(response) {
			if(response.success){
				localStorage.setItem("attendee-"+attendeenum+"-name", response.data.first_name+" "+response.data.last_name);
				localStorage.setItem("attendee-"+attendeenum+"-job_title", response.data.job_title);
				localStorage.setItem("attendee-"+attendeenum+"-organisation", response.data.organisation);
				if(updateregnotestitle){
					$('#regnotesname').html("Notes for "+response.data.first_name+" "+response.data.last_name);
				}
			}
		},
		error: function(error){
			attemptinguploads = false;
		}
	});
}

function checkRegNotes(){
	var regid = $('#regid').val();
	
	if(regid==''){
		window.location.href = '#attendeeHome';
	}else{
		var notes = localStorage.getItem("attendee-"+regid+"-notes");
		var quality = localStorage.getItem("attendee-"+regid+"-quality");
		var name = localStorage.getItem("attendee-"+regid+"-name");
		var organisation = localStorage.getItem("attendee-"+regid+"-organisation");
		var job_title = localStorage.getItem("attendee-"+regid+"-job_title");
		var barcode = localStorage.getItem("attendee-"+regid+"-barcode");
		var splitbarcode = barcode.split("_");
		if(name=='' && splitbarcode.length=='1' && isInternet){
			updateLocalAttendeeName(barcode, true);
		}else if(name=='' && splitbarcode.length=='1'){
			$('#regnotesname').html("Notes for "+barcode);
		}else{
			$('#regnotesname').html("Notes for "+name);
		}
		if(organisation!='' && job_title!=''){
			$('#regnotesname').append("<br>");
			if(job_title!='' && job_title!='undefined'){
				$('#regnotesname').append(job_title+", ");
			}
			if(organisation!='' && organisation!='undefined'){
				$('#regnotesname').append(organisation);
			}
		}
		if(quality!==null){
			$('#quality').val(quality)
		}else{
			$('#quality').val('0');
		}
		$('#quality').selectmenu('refresh', true);
		if(notes!==null){
			$('#regnotestext').val(notes);
		}
	}
}

function checkAllNotes(){
	var regid = $('#eventregid').val();
	
	if(regid=='' || regid==0){
		window.location.href = '#attendeeHome';
	}
}

function checkIfAdmin(){
	//needs to be admin to be on this page
	if(parseInt(localStorage.getItem('security'))<9){
		window.location.href = '#attendeeHome';
	}
}

function checkViewAttendee(){
	var attendeeref = $('#viewattendeereference').val();
	if(attendeeref=='' || attendeeref==0){
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
	var type = $('#eventscantype').val();
	
	try{
		cordova.plugins.barcodeScanner.scan(
			function (result) {
				if(!result.cancelled && result.text!=''){
					registerAttendee(eventid, result.text, type);
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
	}catch(error){
		alert(error);
	}
});

function saveNotes(){
	
	var regid = $('#regid').val();
	var regnotes = $('#regnotestext').val();
	var quality = 0;
	quality = $('#quality').val();

	var loc = $('#loc').val();
	
	localStorage.setItem("attendee-"+regid+"-quality", quality);
	localStorage.setItem("attendee-"+regid+"-notes", regnotes);
	localStorage.setItem("attendee-"+regid+"-notesuploaded", '0');
	
	$('#gotorecentlyregistered').hide();
	$('#regnotestext').val('');
	$('#quality').val('0');
	$('#quality').selectmenu('refresh', true);
	
	if(loc=='0'){
		$('#regnotes').val('');
		$('#scanresponsetext').html(localStorage.getItem("attendee-"+regid+"-name")+" has been updated");
		if(isInternet){
			uploadNotes(regid, false, false);
		}
		window.location.href = '#eventScan';
		$('#selectattendeebysurnamebuttonnew').hide();
		$('#surnameselectdiv').hide();
		$('#attendeesurnameselect').empty();
		
		$('#attendeesurnameselect').trigger('change');
		$('#numresultsbysurnamefound').html('');
	}else if(loc=='1'){
		getRecentlyRegistered(-1, 0);
		$('#gotoscanbarcodes').show();
		if(isInternet){
			uploadNotes(regid, false, false);
		}
		window.location.href='#eventRegs';
	}

}

function tryNormalUploads(){
	tryUploads(false);
}

function tryOldUploads(){
	tryUploads(true);
}

var attemptinguploads = false;
function tryUploads(useoldkey){
	
	if(isInternet){
		if(!attemptinguploads){
			attemptinguploads = true;
			var numattendees = localStorage.getItem("numattendees");
			
			for(var i = 0;i<numattendees;i++){
				var uploaded = localStorage.getItem("attendee-"+i+"-uploaded");
				var deleted = localStorage.getItem("attendee-"+i+"-deleted");
				if(uploaded=='0' && deleted=='0'){
					uploadAttendee(i, true, useoldkey);
					//if we upload, stop the function, and wait for it to be called again
					return true;
				}
			}
			
			for(var i = 0;i<numattendees;i++){
				var uploaded = localStorage.getItem("attendee-"+i+"-notesuploaded");
				var deleted = localStorage.getItem("attendee-"+i+"-deleted");
				if(uploaded=='0'){
					uploadNotes(i, true, useoldkey);
					attemptinguploads = false;
					//if we upload, stop the function, and wait for it to be called again
					return true;
				}
			}
			
			attemptinguploads = false;
		}
	}
}

function uploadNotes(attendeenum, tryuploadsagain, useoldkey){
	
	var regnotes = localStorage.getItem("attendee-"+attendeenum+"-notes");
	var quality = localStorage.getItem("attendee-"+attendeenum+"-quality");
	var barcode = localStorage.getItem("attendee-"+attendeenum+"-barcode");
	var eventid = localStorage.getItem("attendee-"+attendeenum+"-eventid");
	var notesstatus = localStorage.getItem("attendee-"+attendeenum+"-notesuploaded");
	
	var keytouse = apikey;
	if(useoldkey){
		keytouse = localStorage.getItem("oldkey");
	}
	
	if(notesstatus==0){
	
		$.ajax({
			type: "POST",
			data: {
				"action": "setnotesforlocation",
				"apikey": keytouse,
				"barcode": barcode,
				"regnotes": regnotes,
				"quality": quality,
				"eventid": eventid
			},
			url: apiURL,
			dataType: 'json',
			success: function(response) {
				if(response.success){
					localStorage.setItem("attendee-"+attendeenum+"-notesuploaded", '1');
					if(tryuploadsagain){
						attemptinguploads = false;
						if(useoldkey){
							tryOldUploads();
						}else{
							tryNormalUploads();
						}
					}
				}else{
					attemptinguploads = false;
				}
				getRecentlyRegistered(-1, false);
			},
			error: function(error){
				attemptinguploads = false;
			}
		});
	}
}

function registerAttendee( eventid, thisbarcode, type){
	
	var splitbarcode = thisbarcode.split("_");
	barcode = splitbarcode[0];
	name = "";
	if(splitbarcode.length==5){
		name = splitbarcode[1]+" "+splitbarcode[2];
		job_title = splitbarcode[3];
		organisation = splitbarcode[4];
	}
	
	var found = false;
	numattendees = parseInt(localStorage.getItem("numattendees"));
	//first check for previous match
	for(var i = 0; i<numattendees;i++){
		var thiseventid = localStorage.getItem("attendee-"+i+"-eventid");
		var thisbarcode = localStorage.getItem("attendee-"+i+"-barcode");
		if(thiseventid==eventid && thisbarcode==barcode){
			thisattendeenum = i;
			found = true;
			break;
		}
	}
	
	if(!found){
		var thisattendeenum = numattendees;
		numattendees++;
		localStorage.setItem("numattendees", numattendees);
		
		localStorage.setItem("attendee-"+thisattendeenum+"-eventid", eventid);
		localStorage.setItem("attendee-"+thisattendeenum+"-barcode", barcode);
		localStorage.setItem("attendee-"+thisattendeenum+"-name", name);
		localStorage.setItem("attendee-"+thisattendeenum+"-organisation", organisation);
		localStorage.setItem("attendee-"+thisattendeenum+"-job_title", job_title);
		localStorage.setItem("attendee-"+thisattendeenum+"-quality", -1);
		localStorage.setItem("attendee-"+thisattendeenum+"-notes", "");
		localStorage.setItem("attendee-"+thisattendeenum+"-uploaded", '0');
		localStorage.setItem("attendee-"+thisattendeenum+"-deleted", '0');
		localStorage.setItem("attendee-"+thisattendeenum+"-notesuploaded", '0'); // until notes are saved, there's nothing to upload
		localStorage.setItem("attendee-"+thisattendeenum+"-attendeeid", -1);
		
		if(isInternet){
			uploadAttendee(thisattendeenum, false, false);
		}else{
			if(splitbarcode.length==1 && isInternet){
				//1 D barcode, and internet, look up the name as well
				updateLocalAttendeeName(barcode, false);
			}
		}
	}else{
		//do nothing if they have already been registered here, but send them on elsewhere later on as appropriate
	}
	
	$('#surnameselect').html('');
	$('#attendeesurname').val('');
	$('#selectattendeebysurnamebuttonnew').hide();
	$('#surnameselectdiv').hide();
	$('#numresultsbysurnamefound').html('');
	
	if(type=='Exhibition Stand'){
		//go to save notes page
		$('#regid').val(thisattendeenum);
		$('#loc').val('0');
		$('#regnotestext').val('');
		$('#pagename').html("Add notes for attendee");
		$('#gotorecentlyregistered').show();
	}else{
		$('#scanresponsetext').html("Attendee details saved");
	}
	
	if(type=='Exhibition Stand'){
		window.location.href='#regNotes';
	}
}

function uploadAttendee(attendeenum, tryuploadsagain, useoldkey){
	var uuid = $('#uuid').val();
	var hostaddress = $('#hostaddresshidden').val();

	var eventid = localStorage.getItem("attendee-"+attendeenum+"-eventid");
	var barcode = localStorage.getItem("attendee-"+attendeenum+"-barcode");
	var keytouse = apikey;
	if(useoldkey){
		keytouse = localStorage.getItem("oldkey");
	}
	
	$.ajax({
		type: "POST",
		data: {
			"action": "registerattendee",
			"apikey": keytouse,
			"eventid": eventid,
			"scandata": barcode
		},
		url: apiURL,
		dataType: 'json',
		success: function(response) {
			if(response.success && response.data.success){
				//mark the attendee as having been uploaded
				localStorage.setItem("attendee-"+attendeenum+"-name", response.data.name);
				localStorage.setItem("attendee-"+attendeenum+"-uploaded", '1');
				localStorage.setItem("attendee-"+attendeenum+"-attendeeid", response.data.insertid);
				if(tryuploadsagain){
					attemptinguploads = false;
					if(useoldkey){
						localStorage.setItem("attendee-"+attendeenum+"-deleted", '1');
						tryOldUploads();
					}else{
						tryNormalUploads();
					}
				}
				if(useoldkey){
					//delete old record
				}
			}else{
				attemptinguploads = false;
			}
		},
		error: function(error){
			attemptinguploads = false;
		}
	});
}

function showToast(text){
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
	}else{
		tryOldUploads();
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
		numattendees = localStorage.getItem("numattendees");
		for(var i = 0; i<numattendees;i++){
			localStorage.setItem("attendee-"+i+"-eventid", '');
			localStorage.setItem("attendee-"+i+"-barcode", '');
			localStorage.setItem("attendee-"+i+"-name", '');
			localStorage.setItem("attendee-"+i+"-organisation", '');
			localStorage.setItem("attendee-"+i+"-job_title", '');
			localStorage.setItem("attendee-"+i+"-quality", -1);
			localStorage.setItem("attendee-"+i+"-notes", "");
			localStorage.setItem("attendee-"+i+"-uploaded", '0');
			localStorage.setItem("attendee-"+i+"-deleted", '1');
			localStorage.setItem("attendee-"+i+"-notesuploaded", '0'); // until notes are saved, there's nothing to upload
			localStorage.setItem("attendee-"+i+"-attendeeid", -1);
		}
		numattendees = 0;
		localStorage.setItem("numattendees", 0);
		$('#scanresponsetext').html('');
		
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
					localStorage.setItem("stand_manager", parseInt(response.data.stand_manager));
					localStorage.setItem("allow_name_search", parseInt(response.data.allow_name_search));
					
					afterLoginCheck();
					
					window.location.href = "#attendeeHome";
				}else{
					$('#login_response').html(response.data.error);
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

function afterLoginCheck(){
	
	$('.conference_name').html(localStorage.getItem('conference_name'));
	$('#apphelptext').html(localStorage.getItem('apphelptext'));
		
	apikey = localStorage.getItem('apikey');
	stand_manager = localStorage.getItem('stand_manager');
					
	if(stand_manager==1){
		$('#standmanagerpagelink').show();
		$('#standmanagerbreak').show();
	}else{
		$('#standmanagerpagelink').hide();
		$('#standmanagerbreak').hide();
	}

	allow_name_search = localStorage.getItem('allow_name_search');
	if(allow_name_search==1){
		$('#selectattendeecontent').show();
	}else{
		$('#selectattendeecontent').hide();
	}
		
	if(parseInt(localStorage.getItem('security'))>=9){
		$('#gottoselectattendee').show();
	}else{
		$('#gottoselectattendee').hide();
	}
}

function populateList(rundisplay){
	var thing = localStorage.getItem("attendee-0-notes");
	
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
				
				numlocations = 0;
				$.each(response.data.list, function(index, item) {
					localStorage.setItem("location-"+numlocations+"-id", item.id);
					localStorage.setItem("location-"+numlocations+"-name", item.name);
					localStorage.setItem("locationtype-"+item.id, item.event_type);
					
					var exists = localStorage.getItem("location-"+numlocations+"-regs");
					if(exists===null){
						localStorage.setItem("location-"+numlocations+"-regs", "");
					}
					
					numlocations++;

				});

			}
			if(rundisplay){
				displayLocationList();
			}
		}
	});
}

function displayLocationListCheck(){
	if(isInternet){
		populateList(true);
	}else{
		displayLocationList();
	}
}

function displayLocationList(){
	var mainlocid = 0;
	var output = "";
	var firstelementid = 0;
	var firstelementname = "";
	$('#eventselect').html('');
	
	for(var i = 0;i<numlocations;i++){
		var locationid = localStorage.getItem("location-"+i+"-id");
		var locationname = localStorage.getItem("location-"+i+"-name");
		var locationtype = localStorage.getItem("location-"+i+"-type");
		output += "<option value='"+locationid+"'>"+locationname+"</option>";
		if(numlocations==0){
			firstelementid = locationid;
			firstelementname = locationname;
		}
		mainlocid = locationid;
	}
	
	$('#eventselect').html(output);
	$('#eventselect').trigger('change');
	
	if(numlocations==1){
		//Only one location allowed to send them straight there
		$('#eventscanid').val(mainlocid);
		$('#event_name').html(firstelementname);
		selectEvent();
	}
}

function selectEvent(){
	var eventid = $('#eventselect').val();
	
	$('#eventscanid').val(eventid);
	$('#event_name').html($("#eventselect option:selected").text());
	$('#eventscantype').val(localStorage.getItem("locationtype-"+eventid));
	
	window.location.href='#eventScan';
}

function getRecentlyRegistered(eventid, preregistered){
	var uuid = $('#uuid').val();
	var sorttype = $('#sorttype').val();
	var security = localStorage.getItem('security');
	numattendees = localStorage.getItem('numattendees');
	var eventscantype = $('#eventscantype');
	if(eventid==-1){
		eventid = $('#eventregid').val();
	}
	
		
	var html = "<h3>Attendees registered for " + $('#event_name').html() + "</h3>";
	html += "<table id='recentregtable' class='tablesorter  tablesorter-bootstrap'>"
	html += "<thead><tr>";
	html += "<th onclick='resortName();' class='tablesorterheader";
	if(sorttype=='nameup'){
		html += " headerSortUp";
	}else if(sorttype=='namedown'){
		html += " headerSortDown";
	}
	html += "'>Name</th>";
	
	html += "<th>Upload<br>Status</th><th>&nbsp;</th></tr></thead>";
	html += "<tbody>\n";
	for(var i = 0;i<numattendees;i++){
		var deleted = localStorage.getItem('attendee-'+i+'-deleted');
		if(deleted=='0'){
			name = localStorage.getItem('attendee-'+i+'-name');
			barcode = localStorage.getItem('attendee-'+i+'-barcode');
			if(barcode!==null){
				if(name!=''){
					name += " - "+barcode;
				}else{
					name = barcode;
				}
				
				html += "<tr>";
				html += "<td><br />";
				html += name
				html += "</td>";
				html += "<td>";
				if(localStorage.getItem('attendee-'+i+'-uploaded')=='1' && localStorage.getItem('attendee-'+i+'-notesuploaded')=='1'){
					html += "Uploaded";
				}else{
					html += "Pending";
				}
				html += "</td>";
				html += "<td><button class='ui-btn ui-shadow ui-corner-all' onclick='goToSaveNotes("+i+", "+eventid+", 1)'>Notes</button></td>";
				html += "</tr>\n";
			}
		}
	}
	html += "</tbody></table>";
	$('#recentregistrations').html(html);

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

function goToSaveNotes(noteid, eventid, loc){
	
	$('#regid').val(noteid);
	$('#loc').val(loc);
	
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
				$('#quality').val(response.data.lead_quality);
				$('#gotorecentlyregistered').show();
				
				
				window.location.href = '#regNotes'; 
			}
		}
	});
}

function goToViewReg(regid){
	
	$('#regidfulldets').val(regid);
	
	window.location.href = '#fullRegNotes'; 
	
}

function getFullRegDetails(){
	var noteid = $('#regidfulldets').val();
	
	$.ajax({
		type: "POST",
		data: {
			"action": "getfullregistrationdetails",
			"apikey": apikey,
			"regid": noteid
		},
		url: apiURL,
		dataType: 'json',
		success: function(response) {
			if(!response.success){
				$('#standmanagerresponse').html(response.message);
				$('#standmanagerresponse').show();
				setTimeout(function(){
					$('#standmanagerresponse').hide();
				}, 3000);
				window.location.href = "#standManagerPage";
			}else{
				//found etails, build the page
				html = "Attendee name: "+response.data.first_name+" "+response.data.last_name;
				html += "<br>Organisation: "+response.data.organisation;
				html += "<br>Job Title: "+response.data.job_title;
				html += "<br>Lead Quality: ";
				switch(response.data.lead_quality){
					case '1':
						html += "Low";
						break;
					case '2':
						html += "Medium";
						break;
					case '3':
						html += "High";
						break;
					default:
						html += "N/A";
				}
				html += "<br>Registered By: "+response.data.registered_by_name;
				html += "<br>Notes:<br>"+response.data.notes;
				$('#regdetails').html(html);
			}
		}
	});
}

function goToViewAttendee(attendeeref){   

	$.ajax({
		type: "POST",
		data: {
				"action": "getattendeedetails",
				"apikey": apikey,
				"attendeeref": attendeeref
		},
		url: apiURL,
		dataType: 'json',
		success: function(response) {
			if(!response.success){
				$('#viewattendeeresponse').html(response.message);
			}else{
				if(!response.data.success){
					$('#viewattendeeresponse').html(response.data.message);
				}else{
					$('#returntoselectattendeelist').show();
					var html = "Details for "+response.data.attendee_details.first_name+" "+response.data.attendee_details.last_name;
					window.location.href = '#viewAttendee';
					$('#attendee_dets_first_name').html(response.data.attendee_details.first_name);
					$('#attendee_dets_last_name').html(response.data.attendee_details.last_name);
					$('#attendee_dets_attendee_type').html(response.data.attendee_details.attendee_type);
					$('#attendee_dets_reference').html(response.data.attendee_details.reference);
					var job_title = response.data.attendee_details.job_title;
					if(typeof(job_title)===null || typeof(job_title)==null|| job_title==null || job_title==''|| job_title=="null"|| job_title=='null'){
						$('#viewattendeejobtitlerow').hide();
					}else{
						$('#viewattendeejobtitlerow').show();
						$('#attendee_dets_job_title').html(response.data.attendee_details.job_title);
					}
					var organisation = response.data.attendee_details.organisation;
					if(typeof(organisation)===null || typeof(organisation)==null|| organisation==null || organisation==''|| organisation=="null"|| organisation=='null'){
						$('#viewattendeeorgrow').hide();
					}else{
						$('#viewattendeeorgrow').show();
						$('#attendee_dets_organisation').html(response.data.attendee_details.organisation);
					}
					$('#attendee_dets_notes').html("Notes: "+response.data.attendee_details.notes);
								
					html += "<h4>Registrations</h4>";
					if(response.data.attendee_details.registrations.length>0){
						html += "<h5>Attended locations/session</h5>";
						html += "<table id='registeredtable' class='backwhite tablesorter'><thead><tr><th>Location</th><th>Time Registered</th><th>Registered by</th><th>Notes</th><th>Lead Status</th></tr></thead><tbody>\n";
						$.each(response.data.attendee_details.registrations, function(index, item) {
							if(item.time_registered!==null){
								html += "<tr>";
								html += "<td><br />"+item.event_name;
								html += "<br />Type: "+item.event_type;
								html += "</td>";
								html += "<td><br />"+item.time_registered+"</td>";
								html += "<td><br />"+item.registered_by+"</td>";
								html += "<td><br />";
								if(item.notes!==null){
									html += item.notes;
								}
								html += "</td>";
								html += "<td><br />"+item.lead_quality+"</td>";
								html += "</tr>\n";
							}
						});
						html += "</tbody></table>\n";
									
						html += "<h5>Preregistered for, not yet attended</h5>";
						html += "<table id='unregisteredtable' class='backwhite tablesorter'><thead><tr><th>Location</th></tr></thead><tbody>\n";
						$.each(response.data.attendee_details.registrations, function(index, item) {
							if(item.time_registered===null){
								html += "<tr>";
								html += "<td><br />"+item.event_name;
								html += "<br />Type: "+item.event_type;
								html += "</td>";
								html += "</tr>\n";
							}
						});
						html += "</tbody></table>\n";
					}else{
						html += response.data.attendee_details.first_name+" "+response.data.attendee_details.last_name+" is not registered for any locations";
					}
					$('#attendeeregistrations').html(html);
				}
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

function goToSelectAttendee(){
	
	window.location.href='#selectAttendee';
}

/*
 * This ASSUMES a stand manager is only on one stand, 
 * TODO needs fixing to allow admins or similar to also see this presumably down the line 
 */
function getAllStandDetails(){
	var eventid = $('#eventselect').val();
	
	if(isInternet){
		$.ajax({
			type: "POST",
			data: {
					"action": "getstandmanagerregs",
					"apikey": apikey,
					"eventid": eventid
			},
			url: apiURL,
			dataType: 'json',
			success: function(response) {
				console.log(response);
				if(response.success){
					
					
					var html = "<h4>"+response.data.total+" attendees registered for " + $('#event_name').html() + "</h4>";
					html += "<table id='recentregtable' class='tablesorter  tablesorter-bootstrap'>"
					html += "<thead><tr>";
					html += "<th>Organisation</th>";
					html += "<th onclick='resortName();' class='tablesorterheader";
					if(sorttype=='nameup'){
						html += " headerSortUp";
					}else if(sorttype=='namedown'){
						html += " headerSortDown";
					}
					html += "'>Name</th>";
					
					html += "<th>Quality</th><th></th></tr></thead>";
					html += "<tbody>\n";
					for(var i = 0;i<response.data.registrations.length;i++){
						organisation_name = response.data.registrations[i].organisation_name;
						name = response.data.registrations[i].name;
						id = response.data.registrations[i].id;
						time = response.data.registrations[i].time;
						notes = response.data.registrations[i].notes;
						lead_quality = response.data.registrations[i].lead_quality;
						html += "<tr>";
							html += "<td>";
								html += organisation_name;
							html += "</td>";
							html += "<td>";
								html += name;
							html += "</td>";
							html += "<td>";
								switch(lead_quality){
									case '1':
										html += "Low";
										break;
									case '2':
										html += "Medium";
										break;
									case '3':
										html += "High";
										break;
									default:
										html += "N/A";
								}
							html += "</td>";
							html += "<td>";
								html += "<button class='ui-btn ui-shadow ui-corner-all' onclick='goToViewReg("+id+")'>Notes</button>";
							html += "</td>";
						html += "</tr>\n";
					}
					html += "</tbody></table>";
					$('#standmanagerdetails').html(html);
					
					
				}else{
					$('#standmanagerdetails').html(response.message);
				}
				
			}
		});
	}else{
		$('#standmanagerdetails').html("Currently there is no internet access so this list cannot be loaded.  Once access is restored, please refresh the page");
	}
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
			displayLocationListCheck();
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
		case "selectAttendee":
			checkIfLoggedIn(true);
			checkIfAdmin();
			break;
		case "viewAttendee":
			checkIfLoggedIn(true);
			checkIfAdmin();
			checkViewAttendee();
			break;
		case "standManagerPage":
			checkIfLoggedIn(true);
			getAllStandDetails();
			break;
		case "fullRegNotes":
			checkIfLoggedIn(true);
			getFullRegDetails();
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
	
	var oldkey = localStorage.getItem("apikey");
	localStorage.setItem("oldkey", oldkey);
	
	
	localStorage.setItem("loggedIn", 0);
	localStorage.setItem("username", "");
	localStorage.setItem("userid", "");
	localStorage.setItem("apikey", "");
	localStorage.setItem("conferenceid", 0);
}

