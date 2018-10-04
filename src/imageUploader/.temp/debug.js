$(document).on('change', '.dropzone :file', function () {
	var input = $(this),
		dropzone = input.parents('.dropzone'),
		info = dropzone.find('.dropzone-info'),
		preview = dropzone.find('.dropzone-preview');
	var resetFile = function () {
		input.wrap('<form>').closest('form').get(0).reset();
		input.unwrap();
		preview.empty();
		info.show();
	}
	if(this.files) {
		var file = this.files[0],
			maxSize = parseInt(input.parents('form').find('input[name=MAX_FILE_SIZE]').val(), 10),
			errors = [];
		if(!file.type.match('image/*')) {
			errors.push('La foto no es una imagen vÃ¡lida (JPG, GIF, PNG)');
		}
		if(file.size > maxSize) {
			errors.push('El tamaÃ±o del fichero es demasiado grande');
		}
		if(errors.length) {
			resetFile();
			showAlert('<ul><li>' + errors.join('</li><li>') + '</li></ul>', 'Error:');
			return;
		}
	}
	if(!window.FileReader) {
		preview.empty().append($('<span>Preview no disponible</span>'));
		info.hide();
		return;
	}
	var reader = new FileReader();
	reader.onload = function (e) {
		preview.empty();
		info.hide();
		$('<img>').attr('src', e.target.result).appendTo(preview);
	}
	reader.onerror = function (e) {
		resetFile();
		showAlert('No se pudo generar la preview de la foto.');
	}
	reader.readAsDataURL(file);
});
$(function () {
	if(document.location.hostname == 'xxx.subefotos.com' && leeCookie('Adulto') != 'si') {
		var message = '<p>EstÃ¡s accediendo a contenido para adultos.</p><p>Si en tu pais tienes la mayoria de edad puedes acceder pulsando "Aceptar".</p><p>Si por el contrario eres menor de edad pulsa "Cancelar"</p>';
		showConfirm(message, 'Contenido para adultos', function (res) {
			if(res) {
				creaCookie('Adulto', 'si', 365);
				loadPhoto();
			} else {
				document.location = '//subefotos.com';
			}
		});
		return;
	}
	loadPhoto();
});

function loadPhoto() {
	$('[data-load-photo]').each(function () {
		var loading = $(this);
		$('<img class="image-responsive">').on('load', function () {
			loading.find('.thumbnail').attr('href', this.src).empty().append(this);
			loading.find('.photo-codes').show();
		}).on('error', function () {
			loading.find('.thumbnail').replaceWith('<div class="alert alert-danger" role="alert"><p><i class="fa fa-times-circle"></i></p><p>Lo sentimos pero la foto a la que intentas acceder no se encuentra en nuestro servidor.</p><p>Puede que la URL sea incorrecta o que la foto ha caducado por falta de visitas.</p></div>');
		}).attr('src', loading.data('load-photo'));
	});
}

function makeModal(message, title, buttons) {
	var modal = $('<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="alertModal">' + '<div class="modal-dialog"><div class="modal-content">' + '<div class="modal-header">' + '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + '</div>' + '<div class="modal-body"></div>' + '<div class="modal-footer"></div>' + '</div>' + '</div>' + '</div>');
	modal.find('.modal-body').html(message);
	modal.find('.modal-header').append($('<h4 class="modal-title"></h4>').html(title));
	modal.find('.modal-footer').html(buttons);
	return modal;
	modal.modal('show');
}

function showAlert(message, title) {
	makeModal(message, title, '<button type="button" class="btn btn-default" data-dismiss="modal">Cerrar</button>').modal('show');
}

function showConfirm(message, title, callback) {
	if(typeof callback != 'function')
		callback = function () {};
	ok = false;
	makeModal(message, title, '<button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button><button type="button" class="btn btn btn-danger" data-dismiss="modal">Aceptar</button>').on('click', '.btn-danger', function () {
		ok = true;
	}).on('hide.bs.modal', function (e) {
		callback(ok);
	}).modal('show');
}

function cleanLastUploads() {
	$.each(document.cookie.match(/hist\[[a-f0-9]{32}(o|x)\.(jpg|png|gif)\]/g), function (pos, name) {
		borraCookie(name);
	});
	document.location.reload();
}

function submitPhoto(form) {
	var f = $(form),
		file = f.find(':file'),
		submit = f.find('button[type=submit]');
	if(file.val()) {
		submit.attr('disabled', 'disabled').html('<i class="fa fa-refresh fa-spin"></i> Subiendo...');
		return true;
	} else {
		showAlert('Arrastra o selecciona una foto primero', 'Error');
		return false;
	}
}

function creaCookie(nombre, valor, dias) {
	if(dias) {
		var fecha = new Date();
		fecha.setTime(fecha.getTime() + (dias * 86400000));
		var expire = "; expires=" + fecha.toGMTString();
	} else {
		var expire = "";
	}
	document.cookie = nombre + "=" + escape(valor) + expire + "; path=/; domain=.subefotos.com";
}

function leeCookie(nombre) {
	var nomCookie = nombre + "=";
	var docCookie = document.cookie.split(';');
	for(var i = 0; i < docCookie.length; i++) {
		var c = docCookie[i];
		while(c.charAt(0) == ' ')
			c = c.substring(1, c.length);
		if(c.indexOf(nomCookie) == 0)
			return unescape(c.substring(nomCookie.length, c.length));
	}
	return false;
}

function borraCookie(nombre) {
	creaCookie(nombre, "", -1);
}
