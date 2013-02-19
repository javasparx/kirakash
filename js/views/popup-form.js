/**
 * User: Javlon Eraliyev
 * Date: 2/17/13
 */



/*
 *     Javlon Eraliyev
 *
 *      Example:
 *
 *      var popup = new PopupView({
 *              title:'Title Text',
 *              content: anyHTML,
 *              okClicked:myFunction
 *      });
 *
 *      myFunction = function(){
 *          ...
 *      }
 */

window.PopupForm = Parse.View.extend({
    className:'popup-body',

    events:{
        'click .popup-close':'close',
        'click .button':'ok'
    },

    initialize:function () {
        _.bindAll(this, "ok", "close");

        var defaults = {top:100, overlay:0.5, closeButton:null};

        this.options = $.extend(defaults, this.options);

        this.buttonText = this.options.buttonText;
        this.popupWidth = this.options.popupWidth ? this.options.popupWidth : null;
        this.popupHeight = this.options.popupHeight ? this.options.popupHeight : null;
        this.showOkButton = (this.options.showOkButton != false);

        this.render();
    },

    render:function (content) {
        if (_.isEmpty(content)) {
            content = this.options.content;
        }

        var self = this;

        this.template = _.template($('#popup-template').html());

        this.$el.html(this.template({
            temp:{
                title:self.options.title,
                buttonText:self.buttonText,
                more:self.options.more
            }
        }));

        ///////Set temporary content////////
        if (_.isEmpty(content)) {
            content = '<div class="no-content c">Loading...</div>';
        }

        $('.popup-content', this.$el).html(content);

        $('body').append(this.$el);

        if (this.popupWidth != null) {
            self.$el.css({
                width:self.popupWidth + 'px'
            });
        }

        if (this.popupHeight != null) {
            this.$el.height(this.popupHeight);
        }

        if (this.showOkButton) {
            $('.button', this.$el).show();
        }

        //Use cached "this.$el" instead of "$(this.el)"
        if (_.isFunction(this.options.onRendered)) {
            this.options.onRendered();
        }

        $('#overlay').fadeTo(200, self.options.overlay);

        this.$el.css({
            "margin-left":-(this.$el.outerWidth() / 2) + "px",
            "top":self.options.top + "px"
        });

        this.$el.fadeTo(200, 1);

        return this;  //Always return view at the end of render()
    },

    ok:function () {
        if (_.isFunction(this.options.onAccepted)) {
            this.options.onAccepted();
        }

        return false; // Always return false
    },

    close:function () {
        this.$el.remove();

        if (_.isFunction(this.options.onClose)) {
            this.options.onClose();
        }

        $('#overlay').fadeOut(200, 0);

        return false;
    }
});

