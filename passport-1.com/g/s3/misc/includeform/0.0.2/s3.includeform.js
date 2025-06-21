/* masalygin 0.0.2 */
'use strict';

(function(factory) {

    if (typeof define === 'function' && define.amd) {

        define(['jquery'], factory);

    } else {

        factory(jQuery);

    }

})(function($) {

    $.fn.s3IncludeForm = function(url, type, callback) {

        if ($.isFunction(type)) {
            callback = type;
            type = null;
        }

        url += (~url.indexOf('?') ? '&' : '?') + $.now();
        type = type || 'comment';
        callback = callback || $.noop;

        if (~document.location.search.indexOf('screengrabber=1')) {
            url += '&screengrabber=1';
        }

        return this.each(function() {

            var _this = this;
            var $this = $(this);
            var id = $.now();
            var key = 's3-include-form-id';

            $this.data(key, id);

            function init() {

                $this.find('form').on('submit', function(e) {
                    e.preventDefault();
                    $.post(url, $(this).serialize(), update);
                });

                try {

                    $this.find('.init-calendar').each(function(i){
                        new tcal({
                            'controlname': this.id,
                            'place': this.parentNode,
                            'lang': 'ru'
                        });
                    });

                    $this.find('.init-calendar-interval').each(function(){

                        for(var j=0; j<2; ++j){

                            var e = f_getElement(this.id + '['+j+']');

                            new tcal({
                                'controlname': e.id,
                                'place': e.parentNode,
                                'lang': 'ru',
                                'intervalpair': [
                                    this.id + '[0]',
                                    this.id + '[1]'
                                ],
                                'intervalupdatecont': this.id
                            });
                        }
                    });

                    var $captcha = $this.find('input[name=_cn]');
                    if ($captcha.length) {
                        $.getScript('https://captcha.megagroup.ru/static/captcha.js?2', function() {
                            var $d = $captcha.prev();
                            mgCaptcha.draw("/my/s3/captcha/get.php", ($d.length ? $d.get(0) : null));
                        });
                    }

                } catch (err) {}

                try {
                    Onicon.core.liveFormsApply();
                } catch (e) {}

            }


            function update(html, status) {

                if (status !== 'success' || $this.data(key) !== id) {
                    return;
                }

                switch (type) {
                    case 'comment':
                        html = html.split('<!--includeForm-->');
                        html = html.length === 3 ? html[1] : '';
                        html = $.parseHTML(html);
                        break;

                    case 'all':
                        html = $.parseHTML(html);
                        break;

                    default:
                        html = $('<div>').append($.parseHTML(html)).find(type);
                        break;
                }

                $this.html(html);
                init();
                callback.call(_this, html, status);

            }

            $.get(url, update);

        });

    };

});