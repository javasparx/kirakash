$(function () {

    Parse.$ = jQuery;

    // Initialize Parse with your Parse application javascript keys
    Parse.initialize("8qnlnHykLKo49vGtdJjkEnpzRdMIKW7bp9zAgbct",
        "RuuaHGlOJKkWjvBAEtkOK0D4dRieSkryhMx1kg9x");

    // TodoA Model
    // ----------

    // Our basic TodoA model has `content`, `order`, and `done` attributes.
    var Todo = Parse.Object.extend("Todo", {
        // Default attributes for the todoA.
        defaults:{
            content:"empty todo...",
            done:false
        },

        // Ensure that each todoA created has `content`.
        initialize:function () {
            if (!this.get("content")) {
                this.set({"content":this.defaults.content});
            }
        },

        // Toggle the `done` state of this todoA item.
        toggle:function () {
            this.save({done:!this.get("done")});
        }
    });

    // This is the transient application state, not persisted on Parse
    var AppState = Parse.Object.extend("AppState", {
        defaults:{
            filter:"all"
        }
    });

    // TodoA Collection
    // ---------------

    var TodoList = Parse.Collection.extend({

        // Reference to this collection's model.
        model:Todo,

        // Filter down the list of all todoA items that are finished.
        done:function () {
            return this.filter(function (todo) {
                return todo.get('done');
            });
        },

        // Filter down the list to only todoA items that are still not finished.
        remaining:function () {
            return this.without.apply(this, this.done());
        },

        // We keep the Todos in sequential order, despite being saved by unordered
        // GUID in the database. This generates the next order number for new items.
        nextOrder:function () {
            if (!this.length) return 1;
            return this.last().get('order') + 1;
        },

        // Todos are sorted by their original insertion order.
        comparator:function (todo) {
            return todo.get('order');
        }

    });

    // TodoA Item View
    // --------------

    // The DOM element for a todoA item...
    var TodoView = Parse.View.extend({

        //... is a list tag.
        tagName:"li",

        // Cache the template function for a single item.
        template:_.template($('#item-template').html()),

        // The DOM events specific to an item.
        events:{
            "click .toggle":"toggleDone",
            "dblclick label.todo-content":"edit",
            "click .todo-destroy":"clear",
            "keypress .edit":"updateOnEnter",
            "blur .edit":"close"
        },

        // The TodoView listens for changes to its model, re-rendering. Since there's
        // a one-to-one correspondence between a TodoA and a TodoView in this
        // app, we set a direct reference on the model for convenience.
        initialize:function () {
            _.bindAll(this, 'render', 'close', 'remove');
            this.model.bind('change', this.render);
            this.model.bind('destroy', this.remove);
        },

        // Re-render the contents of the todoA item.
        render:function () {
            $(this.el).html(this.template(this.model.toJSON()));
            this.input = this.$('.edit');
            return this;
        },

        // Toggle the `"done"` state of the model.
        toggleDone:function () {
            this.model.toggle();
        },

        // Switch this view into `"editing"` mode, displaying the input field.
        edit:function () {
            $(this.el).addClass("editing");
            this.input.focus();
        },

        // Close the `"editing"` mode, saving changes to the todoA.
        close:function () {
            this.model.save({content:this.input.val()});
            $(this.el).removeClass("editing");
        },

        // If you hit `enter`, we're through editing the item.
        updateOnEnter:function (e) {
            if (e.keyCode == 13) this.close();
        },

        // Remove the item, destroy the model.
        clear:function () {
            this.model.destroy();
        }

    });

    // The Application
    // ---------------

    // The main view that lets a user manage their todoA items
    window.ManageTodosView = Parse.View.extend({

        // Our template for the line of statistics at the bottom of the app.
        statsTemplate:_.template($('#stats-template').html()),

        // Delegated events for creating new items, and clearing completed ones.
        events:{
            "keypress #new-todo":"createOnEnter",
            "click #clear-completed":"clearCompleted",
            "click #toggle-all":"toggleAllComplete",
            "click .log-out":"logOut",
            "click ul#filters a":"selectFilter"
        },

        el:".content",

        // At initialization we bind to the relevant events on the `Todos`
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting todos that might be saved to Parse.
        initialize:function () {
            var self = this;

            _.bindAll(this, 'addOne', 'addAll', 'addSome', 'render', 'toggleAllComplete', 'logOut', 'createOnEnter');

            // Main todoA management template
            this.$el.html(_.template($("#manage-todos-template").html()));

            this.input = this.$("#new-todo");
            this.allCheckbox = this.$("#toggle-all")[0];

            // Create our collection of Todos
            this.todos = new TodoList;

            // Setup the query for the collection to look for todos from the current user
            this.todos.query = new Parse.Query(Todo);
            this.todos.query.equalTo("user", Parse.User.current());

            this.todos.bind('add', this.addOne);
            this.todos.bind('reset', this.addAll);
            this.todos.bind('all', this.render);

            // Fetch all the todoA items for this user
            this.todos.fetch();

            state.on("change", this.filter, this);
        },

        // Logs out the user and shows the login view
        logOut:function (e) {
            Parse.User.logOut();
            new window.LogInView();
            this.undelegateEvents();
            delete this;
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render:function () {
            var done = this.todos.done().length;
            var remaining = this.todos.remaining().length;

            this.$('#todo-stats').html(this.statsTemplate({
                total:this.todos.length,
                done:done,
                remaining:remaining
            }));

            this.delegateEvents();

            this.allCheckbox.checked = !remaining;
        },

        // Filters the list based on which type of filter is selected
        selectFilter:function (e) {
            var el = $(e.target);
            var filterValue = el.attr("id");
            state.set({filter:filterValue});
            Parse.history.navigate(filterValue);
        },

        filter:function () {
            var filterValue = state.get("filter");
            this.$("ul#filters a").removeClass("selected");
            this.$("ul#filters a#" + filterValue).addClass("selected");
            if (filterValue === "all") {
                this.addAll();
            } else if (filterValue === "completed") {
                this.addSome(function (item) {
                    return item.get('done')
                });
            } else {
                this.addSome(function (item) {
                    return !item.get('done')
                });
            }
        },

        // Resets the filters to display all todos
        resetFilters:function () {
            this.$("ul#filters a").removeClass("selected");
            this.$("ul#filters a#all").addClass("selected");
            this.addAll();
        },

        // Add a single todoA item to the list by creating a view for it, and
        // appending its element to the `<ul>`.
        addOne:function (todo) {
            var view = new TodoView({model:todo});
            this.$("#todo-list").append(view.render().el);
        },

        // Add all items in the Todos collection at once.
        addAll:function (collection, filter) {
            this.$("#todo-list").html("");
            this.todos.each(this.addOne);
        },

        // Only adds some todos, based on a filtering function that is passed in
        addSome:function (filter) {
            var self = this;
            this.$("#todo-list").html("");
            this.todos.chain().filter(filter).each(function (item) {
                self.addOne(item)
            });
        },

        // If you hit return in the main input field, create new TodoA model
        createOnEnter:function (e) {
            var self = this;
            if (e.keyCode != 13) return;

            this.todos.create({
                content:this.input.val(),
                order:this.todos.nextOrder(),
                done:false,
                user:Parse.User.current(),
                ACL:new Parse.ACL(Parse.User.current())
            });

            this.input.val('');
            this.resetFilters();
        },

        // Clear all done todoA items, destroying their models.
        clearCompleted:function () {
            _.each(this.todos.done(), function (todo) {
                todo.destroy();
            });
            return false;
        },

        toggleAllComplete:function () {
            var done = this.allCheckbox.checked;
            this.todos.each(function (todo) {
                todo.save({'done':done});
            });
        }
    });

    // The main view for the app
    var AppView = Parse.View.extend({
        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el:$("#todoapp"),

        initialize:function () {
            this.render();
        },

        render:function () {
//            if (Parse.User.current()) {
//                new ManageTodosView();
//            } else {
            /*TODO - remove after dev*/

            $("#test-login").click(function () {

                var login = new window.LogInView().loginForm();

                var popup = new window.PopupForm({
                    onClose:function () {
                        //                            login.$el.remove();
                    },
                    onAccepted:function () {
                        login.logIn(function () {
                            popup.close();
                        });
                    },
                    title:"Login",
//                        more: "This is login window",
                    popupWidth:300,
                    showOkButton:false,
                    buttonText:"Login",
                    content:login.$el
                });
            });
            $("#test-signup").click(function () {

                var login = new window.LogInView().signUpForm();

                var popup = new window.PopupForm({
                    onClose:function () {
//                            login.$el.remove();
                    },
                    onAccepted:function () {
                        login.signUp(function () {
                            popup.close();
                        });
                    },
                    title:"Sign Up",
                    more:"This is sign up window",
                    popupWidth:450,
                    showOkButton:false,
                    buttonText:"Sign Up",
                    content:login.$el
                });
            });

            $("#test-app").click(function () {
//                    var model = window.Application();
                var app = new window.AppView({
                    model:new window.Application()
//                        app:new window.Application()
                });

                var popup = new window.PopupForm({
                    onClose:function () {
//                            login.$el.remove();
                    },
                    onAccepted:function () {
                        app.submit(function () {
                            popup.close();
                        });
                    },
                    title:"Application",
//                        more:"This is sign up window",
                    popupWidth:450,
                    showOkButton:false,
                    buttonText:"Save",
                    content:app.$el
                });
            });

            $("#test-contact").click(function () {
//                    var model = window.Application();
                var contactView = new window.ContactManagerView({type:"phone"}).render();

                var popup = new window.PopupForm({
                    onClose:function () {
//                            login.$el.remove();
                    },
                    onAccepted:function () {
//                            app.submit(function () {
//                                popup.close();
//                            });
                    },
                    title:"Contact: Phone",
//                        more:"This is sign up window",
                    popupWidth:350,
                    buttonText:"Save",
                    content:contactView.$el
                });
            });

//            }
        }
    });

    var AppRouter = Parse.Router.extend({
        routes:{
            "all":"all",
            "active":"active",
            "completed":"completed"
        },

        initialize:function (options) {
        },

        all:function () {
            state.set({ filter:"all" });
        },

        active:function () {
            state.set({ filter:"active" });
        },

        completed:function () {
            state.set({ filter:"completed" });
        }
    });

    var state = new AppState;

    new AppRouter;
    new AppView;
    Parse.history.start();
});
