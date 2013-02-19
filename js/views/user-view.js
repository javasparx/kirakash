/**
 * User: Javlon Eraliyev
 * Date: 2/17/13
 */

window.LogInView = Parse.View.extend({
    events:{
        "submit form.login-form":"logIn",
        "submit form.signup-form":"signUp"
    },

//    el:".content",

    initialize:function () {
        _.bindAll(this, "logIn", "signUp");
//        this.render();
    },

    logIn:function (e) {
        var self = this;
        var username = this.$("#login-username").val();
        var password = this.$("#login-password").val();

        Parse.User.logIn(username, password, {
            success:function (user) {
                new window.ManageTodosView();
                self.undelegateEvents();
                delete self;
                if (_.isFunction(e)) {
                    e();
                }
            },

            error:function (user, error) {
                self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
                self.$(".login-form .button").removeAttr("disabled");
            }
        });

        this.$(".login-form .button").attr("disabled", "disabled");

        return false;
    },

    signUp:function (callback) {
        var self = this;
        var password = this.$("#signup-password").val();
        var passwordConfirm = this.$("#signup-password-confirm").val();

        if (password != passwordConfirm) {
            this.$(".signup-form .error").html("Password and Password Confirm should be same").show();
            return false;
        }

        var username = this.$("#signup-username").val();
        var phone = this.$("#signup-phone").val();
        var city = this.$("#signup-city").val();
        var email = this.$("#signup-email").val();

        var user = new Parse.User();
        user.set("username", username);
        user.set("password", password);
        user.set("phone", phone);
        user.set("city", city);
        user.set("email", email);
//        user.set("vehicle", email);

        user.set("ACL", new Parse.ACL());

        user.signUp(null, {
            success:function (user) {
                new ManageTodosView();
                self.undelegateEvents();
                delete self;
                if (_.isFunction(callback)) {
                    callback();
                }
            },
            error:function (user, error) {
                self.$(".signup-form .error").html(error.message).show();
                self.$(".signup-form button").removeAttr("disabled");
            }
        });

        this.$(".signup-form button").attr("disabled", "disabled");

        return false;
    },

    signUpForm:function () {
        this.$el.html(_.template($("#signup-template").html()));
        this.fillFields();
        this.delegateEvents();
        return this;
    },

    loginForm:function () {
        this.$el.html(_.template($("#login-template").html()));
        return this;
    },

    /*Todo remove after development*/
    fillFields:function () {
        this.$("#signup-username").val("javasparx");
        this.$("#signup-password").val("123");
        this.$("#signup-password-confirm").val("123");
        this.$("#signup-phone").val("+998936446363");
        this.$("#signup-city").val("Namangan");
        this.$("#signup-email").val("example@example.com");
    }
});

window.UserModel = Parse.Object.extend("User", {
    defaults:{
        active:true,
        username:"",
        password:"",
        phone:"",
        city:"",
        email:"",
        ACL:"",
        mobile:"",
        vehicle:"",
        name:"",
        more:""
    }
});