const iframe = $('<iframe src="https://subefotos.com/" sandbox="allow-same-origin allow-top-navigation allow-forms allow-scripts"></iframe>');
$("head").append(iframe);

iframe.on('load', function () {
	console.log(iframe[0].contentWindow.document);
	console.log(iframe.find('input'));
});



$(document).on('dragover', function (e) {
	e.preventDefault();
	e.stopPropagation();
});

$(document).on('dragenter', function (e) {
	e.preventDefault();
	e.stopPropagation();
});

$(document).on('drop', function (e) {
	if(e.originalEvent.dataTransfer) {
		if(e.originalEvent.dataTransfer.files.length === 1) {
			e.preventDefault();
			e.stopPropagation();
			/*UPLOAD FILES HERE*/
			upload(e.originalEvent.dataTransfer.files);
		}
	}
});

function upload(file) {

	let formData = new FormData();

	formData.append('accion', 'subir');
	formData.append('MAX_FILE_SIZE', 16613376);

	formData.append('foto', file[0]);

	console.log(1);
	$.ajax({
		url: "https://subefotos.com/",
		type: 'POST',
		data: formData,
		crossDomain: true,
		success: function (e) {
			alert("Success");
			console.log(e);
		},
		error: function () {
			alert('Failed!');
		},
	});


	const ajax = new XMLHttpRequest();
	ajax.open("POST", "https://subefotos.com/", false);
	ajax.send(formData);
	console.log(ajax);

	console.log(file);

	const reader = new FileReader();
	// debugger;
	reader.onload = function (e) {
		console.log('[FC_IMG_UPLOADER]: Image loaded');
		console.log('[FC_IMG_UPLOADER]:', reader.result);
	};
	reader.onerror = function (e) {
		console.log('[FC_IMG_UPLOADER]: some kind of error: ', e);
	};

	reader.readAsDataURL(file[0]);
	console.log(reader);
}
