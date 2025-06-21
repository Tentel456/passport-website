(function($) {
	$.fn.mgPassportCalculator = function() {
		return this.each(function() {
			var calcWrapper = $(this),
				typeId = calcWrapper.data('type-id'),
				jsonTitle = calcWrapper.data('json-title'),
				elements = getElements(),
				dataField,
				reference,
				calcData,
				calcType;


			if (!typeId || !jsonTitle) {
				console.error('No required data for calculator');
				return 
			}

			calcData = loadData();
			reference = parseReferenceData(calcData);

			fillPassportReplacementControls(reference);
			fillInternationalPassportControls(reference);

			elements.switcher.dataBlocks.css('display', 'none');
			elements.price.css('display', 'none');

			elements.international_passport.form.citizen_type.change(function() {
				fillInternationalPassportControls(reference);
			});

			elements.switcher.buttons.click(function() {
				var current = $(this),
					target = current.data('target');
					$('.mg-calc-switcher li').removeClass('active');
					$(this).parent().addClass('active');
				calcType = current.data('calc-type');

				elements.switcher.dataBlocks.css('display', 'none');

				elements.switcher.dataBlocks
					.filter('.' + target)
					.css('display', 'block');
					
				// calculate();
				
			}).eq(0).click();

			changePrice(0 + ' руб.', 'hide');

			calculate();
			
			$.each(elements.international_passport.form, function(key, value) {
				value.on('change.mgCalc', calculate);
			});
			$.each(elements.passport_replacement.form, function(key, value) {
				value.on('change.mgCalc', calculate);
			});			

			function loadData() {
				var data;

				$.ajax({
					'url': '/-/x-api/v1/public/',
					'async': false,
					'data': {
						'method': 'json/get',
						'param': {
							'type_id': typeId,
							'title': jsonTitle
						}
					},
					'success': function(response) {

						if (!response.result.data.json) {
							console.error('Calculator ajax data error');
						}
						
						//data = JSON.parse(response.result.data.json);
						data = data_calc
					}
				});

				return data;
			}

			function getElements() {
				return {
					'switcher': {
						'buttons': calcWrapper.find('.mg-calc-switcher li>span'),
						'data': calcWrapper.find('.mg-calc-data-wrapper'),
						'dataBlocks': calcWrapper.find('.mg-calc-data-wrapper .mg-calc-data')
					},
					'international_passport': {
						'wrapper': calcWrapper.find('.mg-calc-data-wrapper .international-passport'),
						'form': {
							'citizen_type': calcWrapper.find('.mg-calc-data-wrapper .international-passport .mg-calc-data-internation-passport-citizen-type'),
							'passport_type': calcWrapper.find('.mg-calc-data-wrapper .international-passport .mg-calc-data-internation-passport-type'),
							'days': calcWrapper.find('.mg-calc-data-wrapper .international-passport .mg-calc-data-internation-passport-days')
						}
					},
					'passport_replacement': {
						'wrapper': calcWrapper.find('.mg-calc-data-wrapper .passport-replacement'),
						'form': {
							'region': calcWrapper.find('.mg-calc-data-wrapper .passport-replacement .mg-calc-data-passport-replacement-region'),
							'days': calcWrapper.find('.mg-calc-data-wrapper .passport-replacement .mg-calc-data-passport-replacement-days')
						}
					},
					'price': calcWrapper.find('.mg-calc-price .price')
				}
			}

			function changePrice(price, execute) {
				elements.price.html(price);

				var display = 'none';

				switch (execute) {
					case "show": 
						display = 'block';
						break;
					case "hide":
						display = 'block';
				}

				elements.price.css('display', display);
			}


			function parseReferenceData(data) {
				var reference = {};

				$.each(data, function(key, value) {
					if (typeof reference[key] != 'object') {
						reference[key] = {};
					}

					if ($.isArray(value)) {
						reference[key] = parseReference(value);
					} else if (typeof value == 'object') {
						reference[key] = parseReferenceData(value);
					}
				});

				return reference;
			}

			function parseReference(data) {
				var reference = {};

				$.each(data, function(key, value) {
					if (typeof value != 'object') {
						return;
					}

					$.each(value, function(innerKey, innerValue) {
						if (!$.isArray(reference[innerKey])) {
							reference[innerKey] = [];
						}

						if (reference[innerKey].indexOf(innerValue) == -1) {
							reference[innerKey].push(innerValue);
						}
					});
				});

				// $.each(reference, function(key, value) {
				// 	if ($.isArray(reference[key])) {
				// 		reference[key] = reference[key].sort(function (a, b){
				// 			if(a > b) {
				// 				return 1
				// 			} else if (a < b) {
				// 				return -1;
				// 			} else {
				// 				return 0;
				// 			}
				// 		});
				// 	}
				// })

				return reference;
			}


			function fillPassportReplacementControls(reference) {
				var option = '<option value="">Срок изготовления</option>';

				elements.passport_replacement.form.days.empty();
				elements.passport_replacement.form.days.append(option);

				$.each(reference.passport_replacement.days, function(key, value) {
					option = '<option value="' + value + '">' + value + '</option>';
					elements.passport_replacement.form.days.append(option);
				});
			}

			function fillInternationalPassportControls(reference) {
				var current_citizen_type = elements.international_passport.form.citizen_type.val(),
					option = '<option value="">Срок изготовления</option>';

				elements.international_passport.form.days.empty();
				elements.international_passport.form.days.append(option);

				if (typeof reference.international_passport[current_citizen_type] == 'object') {
					var days = reference.international_passport[current_citizen_type].days;

					$.each(days, function(key, value) {
						option = '<option value="' + value + '">' + value + '</option>';
						elements.international_passport.form.days.append(option);
					});
				}
			}

			function calculate() {
				changePrice(0 + ' руб.', 'hide');

				switch (calcType) {
					case "international_passport":
						var citizen_type = elements.international_passport.form.citizen_type.val(),
							passport_type = elements.international_passport.form.passport_type.val(),
							days = elements.international_passport.form.days.val(),
							findedResult;

						if (!citizen_type) {
							return;
						}

						$.each(calcData[calcType][citizen_type], function(key, value) {
							var price = 0;

							switch (passport_type) {
								case "general": 
									price = value.price_for_general_passport;
									break;
								case "biometrical":
									price = value.price_for_biometrical_passport;
									break;
							}

							if (value.days == days && price) {
								findedResult = price;
							}
						});

						if (findedResult) {
							changePrice(findedResult + ' руб.', 'show');
							$('.price').removeClass('nothing');
							$('.price-title').show();
						} else {
							changePrice("Стоимость не определена. Выберите другой срок.", 'show');
							$('.price').addClass('nothing');
							$('.price-title').hide();
						}

						break;
					case "passport_replacement":
						var region = elements.passport_replacement.form.region.val(),
							days = elements.passport_replacement.form.days.val(),
							findedResult;
						$.each(calcData[calcType], function(key, value) {
							if (value.region == region && value.days == days && value.price) {
								findedResult = value.price;
							}
						});

						if (findedResult) {
							changePrice(findedResult + ' руб.', 'show');
							$('.price').removeClass('nothing');
							$('.price-title').show();
						} else {
							changePrice("Стоимость не определена. Выберите другой срок.", 'show');
							$('.price').addClass('nothing');
							$('.price-title').hide();
						}

						break;
				}
				
				prepareFormData();
			}
			
			function prepareFormData() {
				var value = [];
				
				dataField = calcWrapper.find('.calc-form-data');
				
				dataField.val('');

				switch (calcType) {
					case "international_passport":
						value.push("Тип заявки: Загран. паспорт");
						value.push("Категория граждан: " + elements.international_passport.form.citizen_type.find('option:selected').text());
						value.push("Вид паспорта: " + elements.international_passport.form.passport_type.find('option:selected').text());
						value.push("Срок изготовления: " + elements.international_passport.form.days.find('option:selected').text());
						value.push("Цена: " + elements.price.text());
						break;
					case "passport_replacement":
						value.push("Тип заявки: Замена паспорта");
						value.push("Регион: " + elements.passport_replacement.form.region.val());
						value.push("Срок: " + elements.passport_replacement.form.days.find('option:selected').text());
						value.push("Цена: " + elements.price.text());
						break;
				}
				
				dataField.val(value.join("\n"));
			}

		})
	};


	$(function() {
		$('.mg-passport-calculator').mgPassportCalculator();
		
		$('.mega-calc, .popup-close').on('click', function(event) {
			event.preventDefault();
			$('.popup-wrapper').toggleClass('opened');
			$('input, textarea').blur();
		});
		
		$(document).on('click touchstart vclick', function(event) {
			if ( $(event.target).closest('.popup-form, .mega-calc').length ) return;
			
			if ($('.popup-wrapper').hasClass('opened')) {
				$('input, textarea').blur();
			}

			$('.popup-wrapper').removeClass('opened');
		});   	
		
		resizeController(767, function() {
			$('.layout_14').appendTo('.popup-form');
		}, function() {
			$('.layout_14').appendTo('.layout_3_id_13');
		});
		
	});
})(jQuery);