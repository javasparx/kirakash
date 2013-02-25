/**
 * User: Javlon Eraliyev
 * Date: 2/17/13
 */

window.AppView = Parse.View.extend({
    events:{
        "click .prevHour":"previousHour",
        "click .nextHour":"nextHour",
        "click .prevMin":"previousMin",
        "click .nextMin":"nextMin"
    },

//    el:".content",

    initialize:function () {
        _.bindAll(this, "previousHour","nextHour","previousMin","nextMin");
        this.render();
    },

    submit:function (callback) {
        var self = this;



        return false;
    },

    render:function () {
        var self = this;

        this.template = _.template($('#app-template').html());

        var date = self.model.get("date");
        var d = $.datepicker.formatDate('DD, d MM, yy', self.model.get("date"));
        var m = date.getMinutes();
        var h = date.getHours();

        var t = (h < 10 ? ("0" + h) : h) + ":" + (m < 10 ? ("0" + m) : h);

        this.$el.html(self.template({
            date:d,
            time:t,
            types:["Offer", "Request"],
            cities:["Tashkent", "Namangan", "Andijon"],
            app:self.model.toJSON()
        }));

//        $.datepicker.setDefaults($.datepicker.regional["uz"]);

        self.$("#app-date").datepicker({
            dateFormat:"DD, d MM, yy",
            showOtherMonths:true,
            selectOtherMonths:true
        });


//        self.$('#app-time').blur(function () {
//            self.model.setTime(self.$('#app-time').val());
//        });


        this.$("#app-type :contains('" + self.model.get("type") + "')").attr("selected", "selected");
        this.$("#app-from :contains('" + self.model.get("from") + "')").attr("selected", "selected");
        this.$("#app-to :contains('" + self.model.get("to") + "')").attr("selected", "selected");
        this.$("#app-place :contains('" + self.model.get("places") + "')").attr("selected", "selected");

        this.delegateEvents();
        return this;
    }
});

window.Application = Parse.Object.extend("Application", {

    defaults:{
        active:true,
        type:"offer",
        country:"Uzbekistan",
        from:"",
        to:"",
//        date:new Date(),
        comment:"Empty comment...",
        isRegular:false,
        stops:[],
        places:3,
        isSmoker:false,
        payment:"Cash when driving",
        price:"",
        contact:{
            phone:{
                visible:true
            },
            mobile:{
                visible:true
            },
            email:{
                visible:true
            }
        }
    },

    // Ensure that each todoA created has `content`.
    initialize:function () {
        var date = new Date();
        date.setHours(date.getHours() + 2);
        date.setMinutes(0);

        this.set("date", date);
        if (Parse.User.current()) {
            this.attributes.vehicle = Parse.User.current().vehicle;
            this.attributes.contact.phone.name = Parse.User.current().phone;
            this.attributes.contact.phone.mobile = Parse.User.current().mobile;
            this.attributes.contact.phone.email = Parse.User.current().email;
        }
    },

    setTime:function (h, m) {
        var d = this.get("date");
        d.setHours(h);
        d.setMinutes(m);
    }
});
