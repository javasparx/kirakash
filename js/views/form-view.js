/**
 * User: Javlon Eraliyev
 * Date: 3/1/13
 */

/*
 * You can use options below in 'schema' object:
 *
 * Required:
 * label - Label text.
 * name - corresponds with attribute name of model.
 *
 * Optional:
 * type - defines UI element type. By default: 'input'. [input, checkbox, select, textarea, datepicker]
 * error - error text to popup. By default: 'This field is required'.
 * ph - placeholder text. By default: empty.
 * force - replaces model attribute with schema attribute forcibly. By default: false. [true,false]
 * value - value of UI element. Useless if 'force' is not 'true'. By default: value of correspondent model attribute.
 * options - options of select element. Useless if 'type' is not 'select'. By default: []
 * required - UI element required to be filled. Useless if 'type' is 'checkbox' or 'select'. By default: false
 *
 * */

window.FormView = Parse.View.extend({
    tagName:"ul",
    className:"form",

    initialize:function () {
        this.render();
    },

    fieldChanged:function (elem, options) {

        var name = elem.attr('data-name');

        if (options && options.type == 'checkbox') {
            this.model.set(name, elem.is(':checked'));
        } else if (options && options.type == 'select') {
            this.model.set(name, $('#' + elem.attr('id') + ' option:selected').text().trim())
        } else if (options && options.type == 'datepicker') {
            this.model.set(name, options.value);
        } else {
            this.model.set(name, elem.val().trim());
        }
    },

    render:function () {

        var self = this;
        var defaults = {
            type:'input',
            error:'This field is required'
        };

        this.template = _.template($('#field-template').html());

        _.each(self.options.schema, function (item) {

            item = $.extend({}, defaults, item);

            var value = self.model.get(item.name);

            if (item.force == true) {
                /*Set value from schema*/
                self.model.set(item.name, item.value);
            } else {
                /*Set value from model*/
                item.value = value;
            }

            var data = {
                par:item,
                form:self.options.form
            };

            self.$el.append(self.template(data));

            var elem = self.$("#" + data.form.name + "-" + item.name);

            if (item.type == 'datepicker') {

                var d = $.datepicker.formatDate('DD, d MM, yy', item.value);

                elem.val(d);

                elem.datepicker({
                    dateFormat:"DD, d MM, yy",
                    showOtherMonths:true,
                    selectOtherMonths:true,
                    'onSelect':function (text, obj) {
                        item.value = elem.datepicker('getDate');
                        self.fieldChanged(elem, item);
                    }
                });
            } else {
                elem.change(function (e) {
                    self.fieldChanged($(e.currentTarget), item);
                });
            }

        });

        return this;
    }

});