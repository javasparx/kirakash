/**
 * User: Javlon Eraliyev
 * Date: 2/17/13
 */

window.ContactManagerView = Parse.View.extend({
    events:{
        "click .save":"save",
        "click .clear":"clear"
    },

//    el:".content",

    initialize:function () {
//        var self = this;

        _.bindAll(this, 'addOne', 'addAll', 'render');

        this.$el.html(_.template($("#manage-contact-template").html()));

        this.input = this.$("#new-contact");

        var defaults = {
            type:"email"
        };

        this.options = $.extend({}, defaults, this.options);

        this.contacts = new window.ContactList;

        this.contacts.query = new Parse.Query(window.Contact);
        this.contacts.query.equalTo("user", Parse.User.current());
        this.contacts.query.equalTo("type", this.options.type);

        this.contacts.bind('add', this.addOne);
        this.contacts.bind('reset', this.addAll);
        this.contacts.bind('all', this.render);

        this.contacts.fetch();
    },

    addOne:function (contact) {
        var view = new window.ContactView({model:contact});
        view.render().$el.hide();
        this.$("#contact-list").append(view.render().el);
        view.render().$el.slideDown();
    },

    addAll:function () {
        this.$("#contact-list").html("");
        this.contacts.each(this.addOne);
    },

    save:function () {

        var self = this;
        this.input[0].setCustomValidity("");

        if (this.input[0].validity.valid === false) {
            this.input[0].setCustomValidity("My Error");
        } else {

            var model = new window.Contact();

            model.set("name", this.input.val());
            model.set("type", this.options.type);
            model.set("order", this.contacts.nextOrder());
            model.set("user", Parse.User.current());
            model.set("ACL", new Parse.ACL(Parse.User.current()));

            this.contacts.create(model, {
                success:function () {
                    self.input.val('');
                },
                wait:true
            });
        }
    },

    render:function () {
        this.delegateEvents();
        return this;
    },

    clear:function () {
        this.input.val('');
    }

});

window.ContactList = Parse.Collection.extend({

    // Reference to this collection's model.
    model:window.Contact,

    nextOrder:function () {
        if (!this.length) return 1;
        return this.last().get('order') + 1;
    },

    // Todos are sorted by their original insertion order.
    comparator:function (contact) {
        return contact.get('order');
    }

});

window.ContactView = Parse.View.extend({
    tagName:"form",
    className:"row",
//    ,
    events:{
        "click .save":"save",
        "dblclick .item-edit":"edit",
        "click .destroy":"clear",
//        "keypress .edit":"updateOnEnter",
        "blur .item-edit":"close"
    },

    initialize:function () {
        _.bindAll(this, 'render', 'close', 'remove');

        this.model.bind('change', this.render);
        this.model.bind('destroy', this.remove);

        this.isEditmode = false;
    },

    save:function (callback) {


        if (!this.isEditmode) {
            this.edit();
            return false;
        }

        var self = this;

        this.input[0].setCustomValidity("");

        if (this.input[0].validity.valid === false) {
            this.input[0].setCustomValidity("My Error");
        } else {
            this.model.save({name:this.input.val()});

            self.close();


            if (_.isFunction(callback)) {
                callback();
            }
        }
    },

    render:function () {

        var self = this;

        this.template = _.template($('#row-template').html());

        this.$el.html(self.template(
            this.model.toJSON()
        ));

        this.input = self.$(".item-edit");

        this.close();

        this.input.val(self.model.get('name'));


        return this;
    },

    edit:function () {
        if (this.isEditmode) {
            return false;
        }

        this.input.removeClass("fake-label");
        this.input.removeAttr('disabled');
        this.$(".save").val("Save");
        this.input.focus();
        this.isEditmode = true;
    },

    close:function (e) {

        /*Was not saved || Blur event was triggered*/
        if (!_.isEmpty(e)) {
            this.input.val(this.model.get('name'));
        }

        this.input.attr('disabled', 'disabled');
        this.$(".save").val("Edit");
        this.input.addClass("fake-label");
        this.isEditmode = false;
    },

    clear:function () {
        var self = this;
        this.$el.slideUp(
            500,
            function () {
                self.model.destroy();
            }
        );
    }
});

window.Contact = Parse.Object.extend("Contact", {

    defaults:{
        type:"email",
        name:""
    },
    initialize:function () {

    }
});
