(function () {
	/**
	*
	*
	*
	*/
	const MODULE = new Module({
		moduleName: "IMGUR_REPO",
		title: "Imgur Repository",
		description: "repositorio de imagenes de imgur",
		version: "1.0",
		author: "nurbian",
		preload: ["https://unpkg.com/masonry-layout@4.2.2/dist/masonry.pkgd.min.js"],
		match: ["/foro/showthread.php?*", "/foro/newreply.php?*"],
		runat: "load"
	});


	MODULE.config.define("LAST_FILTERS", {
		defaultValue: {
			section: "top",
			sort: "viral",
			window: "day",
			page: "0",
			mature: false
		}
	});

	// MODULE
	/**
	*
	*
	*
	*/

	const CLIENT_ID = "213fc16451733ee";

	// TODO: poner las URLs donde funciona el script
	const CONTROLLER_QUERY = location.pathname == "/foro/showthread.php" ?
	"#vB_Editor_QR_textarea" : "loquesea";

	const IMAGE_WIDTH = 210;

	const KEY = "KeyI";

	const IMGUR_API = "https://api.imgur.com/3";

	const IMGUR_CSS = `<style>
		.msnryGrid-item {
			border: 3px solid #009688;
			border-radius: 4px;
			margin-bottom: 10px;
			cursor: pointer;
		}
		.imgurPanel-opts table {
			margin-left: auto;
			margin-right: auto;
		}
		.imgurPanel-body {
			height: 69vh;
			overflow-y: scroll;
			border-top: 3px solid #009688;
			border-bottom: 3px solid #009688;
		}
		.imgurButton:hover {
			background-color: rgb(193, 210, 238);
			border: 1px solid rgb(49, 106, 197);
			padding:0px;
		}
	</style>`;

	class ImgurAPI {
		static counter = 0;

		static createImgurButton() {
			const CONTROLERS = $('#vB_Editor_QR_controls');
			const UPLOADICONSRC = "https://raw.githubusercontent.com/Pytness/fc-script/master/src/imageUploader/uploadIcon2.gif";

			let td = $(CONTROLERS.find('tr>td')[11]);
			let image = $(`<div class="imgurButton"><img src="${UPLOADICONSRC}"></div>`);
			image.insertAfter(td);

			return image[0]; //returns html element
		}

		static getURL({section: section, sort: sort, window: window, page: page, mature: mature}) {
			return `${IMGUR_API}/gallery/${section}/${section == "user" ? sort : "viral"}/${section == "top" ? window : "day"}/${page}?album_previews=false&mature=${mature}`;
		}

		// CREATES THE HTML TAG FOR EACH IMAGE
		static getTag(img, index) {
			let HTMLtag = [];

			// img.images[{...}] if aviable
			img.images === undefined ? (function () {
				if (img.type != "video/mp4") {
					if (img.link.search("https:") == -1)
					img.link = img.link.replace("http:", "https:");

					HTMLtag[0] = `<img class="msnryGrid-item ${ImgurAPI.counter++}" src="${img.link}" width="${IMAGE_WIDTH}px" />`;
				}
			})()
			: (function () {
				HTMLtag = img.images.filter(f => f.type != "video/mp4")
				.map(f => {
					if (f.link.search("https:") == -1)
					f.link = f.link.replace("http:", "https:");

					return `<img class="msnryGrid-item ${ImgurAPI.counter++}" src="${f.link}" width="${IMAGE_WIDTH}px"/>`;
				});
			})();

			return HTMLtag;
		}
		static getBody(init) { //object OPTIONS
			let url = ImgurAPI.getURL(init);
			let imgurHeader = new Headers({
				"Authorization": `Client-ID ${CLIENT_ID}`
			});

			ImgurAPI.counter = 0;
			return fetch(url, {
				method: "GET",
				headers: imgurHeader

			}).then(response => {
				if (response.status != 200)
					throw response;

				return response.json();

			}).then(json => {
				let data = json.data;

				data = data.map(ImgurAPI.getTag).filter(f => f != "").flat(); //prettyfies the array

				//images body and number of images
				return {
					HTMLString: `<div class="msnryGrid">${data.join(' ')}</div>`, //WHOLE HTML STRING
					length: ImgurAPI.counter //number of IMAGES
				};

			}).catch(console.error);
		}
	}

	class FiltersGUI {
		constructor(section, sort, window, mature, page, next, numBtn, prev) {
			this.section = section;
			this.sort = sort;
			this.window = window;
			this.mature = mature;
			this.paging = {
				page: page,
				next: next,
				numBtn: numBtn,
				prev: prev
			};
		}

		enablePaging() {
			this.paging.page.disabled = false;
			this.paging.next.disabled = false;
			this.paging.numBtn.disabled = false;
			this.paging.prev.disabled = false;
		}

		disablePaging() {
			this.paging.page.disabled = true;
			this.paging.next.disabled = true;
			this.paging.numBtn.disabled = true;
			this.paging.prev.disabled = true;
		}

		loadGUI(options) {
			this.section.value = options.section;
			this.paging.page.value = options.page;

			if (this.section.value != "user") {
				this.sort.value = "viral";
				this.sort.disabled = true;

				if (this.section.value != "top") {
					this.window.value = "day";
					this.window.disabled = true;
					this.disablePaging();
				} else {
					this.window.disabled = false;
					this.window.value = options.window;
					this.enablePaging();
				}
			} else {
				this.sort.disabled = false;
				this.sort.value = options.sort;
				this.window.disabled = true;
				this.enablePaging();
			}
		}

		updateGUI() {
			if (this.section.value != "user") {
				this.sort.value = "viral";
				this.sort.disabled = true;

				if (this.section.value != "top") {
					this.window.value = "day";
					this.window.disabled = true;
				} else {
					this.window.disabled = false;
				}
			} else {
				this.sort.disabled = false;
				this.window.disabled = true;
			}
		}

		getOptions() {
			let options = {
				section: this.section.value,
				sort: this.section.value == "user" ? this.sort.value : "viral",
				window: this.section.value == "top" ? this.window.value : "day",
				page: "0",
				mature: this.mature.checked
			};

			return options;
		}
	}

	class ImagesPanel {
		constructor(options) {
			this.options = options;
			this.imageButton = ImgurAPI.createImgurButton();
		}

		onClick(f) {
			this.imageButton.addEventListener("click", f);
		}

		showPanel() { //page?
			const CLASS = {
				PANEL: "imgurPanel",
				BODY: "imgurPanel-body",
				BOTTOM: "imgurPanel-bottom",
				CONFIG: {
					GENERAL: "imgurPanel-opts",
					PREV: "imgurPanel-prev",
					NEXT: "imgurPanel-next",
					NUM: "imgurPanel-num",
					NUM_BTN: "imgurPanel-numBtn",
					FILTER_BTN: "imgurPanel-filterBtn",
					SECTION: "imgurPanel-section",
					SORT: "imgurPanel-order",
					WINDOW: "imgurPanel-window",
					MATURE: "imgurPanel-mature"
				}
			};

			let options = this.options;

			//RE-ALIGNS MASONRY LAYOUT
			function updateMasonry(length) {
				let msnry = $(".msnryGrid");

				msnry.masonry({
					itemSelector: ".msnryGrid-item",
					gutter: 10
				});

				for (let i = 0; i < length; i++) {
					$(`.msnryGrid-item.${i}`)[0].addEventListener("load", (elem) => {
						msnry.masonry().append(elem);
					});
				}

				//EVENT TO INSERT THE IMAGE INTO FC's EDITOR
				$(".msnryGrid-item").on("click", function() {
					let editor = $(CONTROLLER_QUERY);

					let text = editor.val();
					let cursor = editor.prop("selectionStart");

					let newText = text.substr(0, cursor);

					newText += `[IMG]${this.src}[/IMG]`;
					newText += text.substr(cursor);

					editor.val(newText);
					editor.focus();

					// Set cursor position
					let newCursor = cursor + (newText.length - text.length) + 1;

					editor[0].setSelectionRange(newCursor, newCursor);

					swal.clickConfirm();
				});
			}

			function updatePage() {
				$(`.${CLASS.CONFIG.NUM}`)[0].value = options.page;

				ImgurAPI.getBody(options)
				.then(({HTMLString: HTMLString, length: length}) => {
					$(`.${CLASS.BODY}`)[0].innerHTML = HTMLString;
					updateMasonry(length);
				}).catch(console.error);
			}

			function nextPage() {
				if (options.section == "hot") return;
				options.page++;
				updatePage();
			}

			function prevPage() {
				if (options.page == 0) return;
				options.page--;
				updatePage();
			}

			function loadPage(num) {
				if (options.page == num) return;
				options.page = Math.abs(parseInt(num));
				updatePage();
			}

			function applyFilters(newOptions) {
				MODULE.config.set("LAST_FILTERS", newOptions);
				options = newOptions;
				updatePage();
			}

			ImgurAPI.getBody(options)
			.then(({HTMLString: HTMLString, length: length}) => {
				return swal({
					title: "Imgur repository",
					html: `<div class="${CLASS.PANEL}">` +
							`<div class="${CLASS.CONFIG.GENERAL}">` +
								'<table>' +
									'<tr>' +
										'<td>' +
											`Sección: <select class="${CLASS.CONFIG.SECTION}">` +
												'<option value="hot">HOT</option>' +
												'<option value="top">TOP</option>' +
												'<option value="user">USER</option>' +
											'</select>' +
										'</td>' +
										'<td>' +
											`Ordenar por: <select class="${CLASS.CONFIG.SORT}">` +
												'<option value="viral">VIRAL</option>' +
												'<option value="time">TIME</option>' +
												'<option value="rising">RISING</option>' +
											'</select>' +
										'</td>' +
										'<td>' +
											`Window: <select class="${CLASS.CONFIG.WINDOW}">` +
												'<option value="day">DAY</option>' +
												'<option value="week">WEEK</option>' +
												'<option value="month">MONTH</option>' +
												'<option value="year">YEAR</option>' +
												'<option value="all">ALL</option>' +
											'</select>' +
										'</td>' +
										'<td>' +
											`¿+18? <input type="checkbox" class="${CLASS.CONFIG.MATURE}"/>` +
										'</td>' +
										'<td>' +
											`<button class="${CLASS.CONFIG.FILTER_BTN}">APPLY</button>` +
										'</td>' +
									'</tr>' +
									'<tr>' +
										'<td>' +
											`<button class="${CLASS.CONFIG.PREV}">PREV</button>` +
										'</td>' +
										'<td colspan="3">' +
											`Page: <input class="${CLASS.CONFIG.NUM}" type="number" value="0" min="0">` +
											`<button class="${CLASS.CONFIG.NUM_BTN}">GO!</button>` +
										'</td>' +
										'<td>' +
											`<button class="${CLASS.CONFIG.NEXT}">NEXT</button>` +
										'</td>' +
									'</tr>' +
								'</table>' +
							'</div>' +
							'<br>' +
							`<div class="${CLASS.BODY}">` +
								HTMLString +
							'</div>' +
							'<br>' +
						'</div>',
					width: "100%",

					//methods
					onOpen: () => {

						let filtersGUI = new FiltersGUI(
							$(`.${CLASS.CONFIG.SECTION}`)[0],	//section
							$(`.${CLASS.CONFIG.SORT}`)[0],		//sort
							$(`.${CLASS.CONFIG.WINDOW}`)[0],	//window
							$(`.${CLASS.CONFIG.MATURE}`)[0],	//matura
							$(`.${CLASS.CONFIG.NUM}`)[0],		//page num
							$(`.${CLASS.CONFIG.NEXT}`)[0],		//page next
							$(`.${CLASS.CONFIG.NUM_BTN}`)[0],	//page num btn
							$(`.${CLASS.CONFIG.PREV}`)[0]		//page prev
						);

						updateMasonry(length);

						filtersGUI.loadGUI(options);

						$(`.${CLASS.CONFIG.SECTION}`).on("change", function () {
							filtersGUI.updateGUI();
						});

						//CHANGE PAGE, PLEASE------------------------------------------------------
						//secuential page update
						$(`.${CLASS.CONFIG.NEXT}`).on("click", function() {
							nextPage();
						});

						$(`.${CLASS.CONFIG.PREV}`).on("click", function() {
							prevPage();
						});

						//direct page update
						$(`.${CLASS.CONFIG.NUM_BTN}`).on("click", function() {
							loadPage($(`.${CLASS.CONFIG.NUM}`)[0].valueAsNumber);
						});

						//filters appliance
						$(`.${CLASS.CONFIG.FILTER_BTN}`).on("click", function() {
							const NEW_OPTIONS = filtersGUI.getOptions();

							NEW_OPTIONS.section != "hot" ? filtersGUI.enablePaging() :
							filtersGUI.disablePaging();

							applyFilters(NEW_OPTIONS);
						});
						//------------------------------------------------------------------------
					},

					onClose: () => {
						MODULE.config.set("LAST_FILTERS", options);
						this.options = options;
					}
				});
			});
		}
	}

	MODULE.onload = function() {
		$('html > head').append(IMGUR_CSS);

		console.log(MODULE.config.get("LAST_FILTERS"));

		const OPTIONS = MODULE.config.get("LAST_FILTERS");

		var panel = new ImagesPanel(OPTIONS);
		panel.onClick(() => panel.showPanel());
	};


})();
