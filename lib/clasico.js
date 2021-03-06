/*
Clasico: a library for clasical inheritance in JavaScript
Written by David Beveridge <davidjbeveridge@gmail.com>

Copyright (c) 2011 David Beveridge

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

var Kernel = (function(){
	function Kernel(){}
	Kernel.prototype = {
		extend: function extend(obj) {
			Kernel.extend(this,obj);
		},
		send: function send(){
			var fnName = Array.prototype.shift.call(arguments);
			if(Kernel.is_method(this[fnName]))  {
				return this[fnName].apply(this,arguments);
			}
		}
	};
	Kernel.extend = function extend() {
		try
		{
			var
			i = 1,
			max = arguments.length,
			force = false,
			target = arguments[0]
			;
			if(target === true) {
				force = true;
				target = arguments[i++];
			}
			for( ; i < max; i++)  {
				for(prop in arguments[i])  {
					if(!target[prop] || force) {
						target[prop] = arguments[i][prop];
					}
				}
			}
			return target;
		}
		catch (e) {
			return {};
		}
	};
	Kernel.is_method = function is_method(thing) {
		return Boolean(thing && typeof(thing) === 'function');
	};
	Kernel.is_function = Kernel.is_method;
	Kernel.is_object = function is_object(thing)  {
		return Boolean(typeof(thing) === 'object' && !Kernel.is_null(thing));
	};
	Kernel.is_null = function is_null(thing)	{
		return Boolean(thing === null);
	};
	Kernel.is_string = function is_string(thing)	{
		return Boolean(typeof thing === 'string' || thing instanceof String);
	};
	Kernel.is_number = function is_number(thing)	{
		return Boolean(typeof thing === 'number');
	};
	Kernel.defined = function defined(thing)	{
		return !Boolean(typeof thing === 'undefined' || Kernel.is_null(thing));
	};
	
	return Kernel;
})();


function Class(attributes){
  if(! Kernel.is_object(attributes) )  {
    throw new TypeExpectError('Class','Object',attributes);
  }

  var constructor;

  // Create a constructor function:
  if(Kernel.is_method(attributes.extend)){ // Use a parent constructor
    constructor = function(){
      attributes.extend.apply(this,arguments);
      if(Kernel.is_method(attributes.initialize))  {
        attributes.initialize.apply(this,arguments);
      }
    };
    constructor.superclass = attributes.extend;
  }
  else if(Kernel.is_method(attributes.initialize)) {  // Or just the one that was passed
    constructor = function(){
      attributes.initialize.apply(this,arguments);
    };
  }
  else {  // Or just use a blank one...
    constructor = function(){};
  }


  // Make a prototype:
  constructor.prototype = new Object;
  // Decorate with Kernel and Class
  constructor.include = Class.include;
  Kernel.extend(true, constructor.prototype, Kernel.prototype);
  Kernel.extend(true, constructor.prototype, Class.prototype);
	
	//Create a static 'new' method:
	constructor.make = function(){ return new constructor(); }

  if(attributes.name) {
    constructor.prototype.klass = attributes.name;
  }

  // Inherit from our parent...
  if(attributes.extend)  {
    // Static members...
    Kernel.extend(constructor, attributes.extend);

    // Prototype...
    if(Kernel.is_method(attributes.extend)) {
      constructor.prototype = new attributes.extend;
    }
    else  {
      if(Kernel.is_object(attributes.extend)) {
        Kernel.extend(constructor.prototype, attributes.extend);
      }
    }
  }

  // Assign public methods...
  if(Kernel.is_object(attributes.public))  {
    Kernel.extend(true, constructor.prototype, attributes.public);
  }

  // Assign static methods...
  if(Kernel.is_object(attributes.static)) {
    Kernel.extend(true, constructor, attributes.static);
  }

  // Set class instances to reference the correct constructor
  constructor.prototype.constructor = constructor;

  // Finally, we'll check for our interface:

  if(attributes.implements && Kernel.is_method(attributes.implements.implemented_in))  {
    attributes.implements.implemented_in(new constructor);
  }

  return constructor;

}

Class.prototype = new Function;
Kernel.extend(Class.prototype,{
  extend: function(parent_class){
    if(Kernel.is_method(parent_class)) {
      Kernel.extend(this.constructor.prototype, (parent_class.prototype));
    }
    else  {
      if(Kernel.is_object(parent_class)) {
        Kernel.extend(this.constructor.prototype, parent_class);
      }
    }
  },
  implements: function(some_interface){
    if(!(some_interface instanceof Interface))  {
      throw new Error("Class#implements: expected Interface.");
    }
    return Kernel.is_method(some_interface.implemented_in) && some_interface.implemented_in(this);
  },
  define_method: function(method_name,method_body){
    return this.constructor.prototype[method_name] = method_body;
  },
  kind_of: function(klass){
    return Boolean( this instanceof klass );
  },
  instance_of: function(klass){
    return Boolean( this.constructor === klass );
  },
  respond_to: function(method_name){
    return Kernel.is_method(this[method_name]);
  }
});

Class.make = function(attributes){
  return new Class(attributes);
}

Class.include = function(mod){
  if(mod.instance_of && mod.instance_of(Module))  {
    mod.decorate(this);
  }
  else if(Kernel.is_function(mod)) {
    Kernel.extend(true, this, mod);
    Kernel.extend(true, this.prototype, mod.prototype);
  }
}

var Module = Class.make({
  name: 'Module',
  initialize: function(attributes){
    var
      public = Kernel.is_object(attributes.public) ? attributes.public : {},
      static = Kernel.is_object(attributes.static) ? attributes.static : {}
    ;
    this.decorate = function(mod)  {
      if(Kernel.is_function(mod)) {
        Kernel.extend(true, mod, static);
        //Kernel.extend(true, mod.prototype, public);
        for(prop_name in public)  {
          if(Kernel.is_method(public[prop_name])) {
            mod.prototype[prop_name] = function(){
              return public[prop_name].apply(this,arguments);
            }
          }
          else {
            mod.prototype[prop_name] = public[prop_name];
          }

        }
      }
    };
  },
  public: {
    include: function(){ Class.prototype.include.apply(this,arguments); }
  }
});

var Interface = Class.make({
  name: 'Interface',
  initialize: function(methods) {
    if(typeof methods !== 'object') {
      throw new TypeExpectError('Interface','Object',methods);
    }
    this.methods = [];
    for(methodName in methods) {
      if(Kernel.is_method(methods[methodName])) { this.methods.push(methodName); }
    }
  },
  public: {
    implemented_in: function(obj){
      for(var i = 0, max = this.methods.length; i < max; i++) {
        if( !Kernel.is_method(obj[this.methods[i]]) )  {
          throw new Error("Interface: "+this.methods[i]+" method missing; required by interface.");
        }
      }
      return true;
    }
  }
});

var TypeExpectError = Class.make({
  name: 'TypeExpectError',
  extend: Error,
  initialize: function(caller,expected,got) {
    this.message = caller+': expected object of type '+expected+'; got '+typeof(got);
  }
});
