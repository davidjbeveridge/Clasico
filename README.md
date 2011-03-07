Clásico
=======
Classic, not convoluted.

Clásico is designed to provide a simple DSL for classes and classical
inheritance in JavaScript.  Writing classes is usually a real pain in the
ass, because JavaScript doesn't technically support classes--it just has
objects.  That's all fine and well, but if you're used to using classes,
writing constructors and prototypes really complicates what should be
fairly simple to do.

Clásico comes out of my personal need for a tool like this, and my disdain
for the libraries and frameworks that usually come packed around it.  I
realize that this functionality is available in a number of other libraries,
such as MooTools, but I don't need the bloat that comes with that.  I
tend to use jQuery a lot (and sometimes other libraries), but need some
structure to base the rest of my code on.  Anywho, this should be fairly
framework agnosticish.

Declaring a class:
------------------
    // Assume that MyParentClass is already defined.
    var MyClass = Class.new({
      name: 'MyClass',
      extends: MyParentClass,
      implements: MyInterface
      initialize: function(){
        // Constructor
      },
      public: {
        myMethod: function(){ ... },
        myOtherMethod: function(){ ... }
      }
    });
