/**
 * User: Javlon Eraliyev
 * Date: 2/18/13
 */

jQuery.fn.center = function () {
    this.css("position", "absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) +
        $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
        $(window).scrollLeft()) + "px");
    return this;
};

function isDefined(o) {
    return !_.isEmpty(o);
}

window.ages = ["1-13", "14-21", "22-30", "31-50", "51-100"];
window.appTypes = ["Offer", "Request"];
window.types = {
    select:'select',
    text:'text',
    date:'datepicker',
    checkbox:'checkbox',
    textarea:'textarea',
    label:'label',
    password:'password',
    email:"email"
};
window.cities = ['Namangan', 'Tashkent', 'Fergana', 'Andijan'];

function setUserDetails(user, city, vehicle, isMale, age, mobile, more) {
    user.set("city", "");
    user.set("vehicle", "");
    user.set("isMale", true);
    user.set("age", "");
    user.set("mobile", "");
    user.set("more", "");
}