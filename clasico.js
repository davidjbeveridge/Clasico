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

function Kernel(){};
Kernel.prototype = {
  extend: function(obj) {
    Kernel.extend(this,obj);
  },
  send: function(){
    fnName = Array.prototype.shift.call(arguments);
    if(Kernel.is_method(this[fnName]))  {
      return this[fnName].apply(this,arguments);
    }
  }
};
Kernel.extend = function() {
  try
  {
    var
      i = 1,
      force = false,
      target = arguments[0];
    ;
    if(target === true) {
      force = true;
      target = arguments[i++];
    }
    for(var max = arguments.length; i < max; i++)  {
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
Kernel.is_method = function(func) {
  return Boolean(func && typeof(func) === 'function');
};
Kernel.is_function = Kernel.is_method;
Kernel.is_object = function(obj)  {
  return Boolean(typeof(obj) === 'object');
};


function Class(attributes){
  if(typeof attributes !== 'object')  {
    throw new TypeExpectError('Class','Object',attributes);
  }

  var
    constructor,
    private = {}
  ;

  // Create a constructor function:
  if(Kernel.is_method(attributes.extends)){ // Use a parent constructor
    constructor = function(){
      attributes.extends.apply(this,arguments);
      if(Kernel.is_method(attributes.initialize))  {
        attributes.initialize.apply(this,arguments);
      }
    };
    constructor.superclass = attributes.extends;
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
  Kernel.extend(constructor.prototype,Kernel.prototype);
  Kernel.extend(constructor.prototype,Class.prototype);

  if(attributes.name) {
    constructor.prototype.class = attributes.name;
  }

  // Inherit from our parent...
  if(attributes.extends)  {
    // Static members...
    Kernel.extend(constructor, attributes.extends);

    // Prototype...
    if(Kernel.is_method(attributes.extends)) {
      constructor.prototype = new attributes.extends;
    }
    else  {
      if(Kernel.is_object(attributes.extends)) {
        Kernel.extend(constructor.prototype, attributes.extends);
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
  extends: function(parent_class){
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
  responds_to: function(method_name){
    return Kernel.is_method(this[method_name]);
  }
});

Class.new = function(attributes){
  return new Class(attributes);
}


var Interface = Class.new({
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

var TypeExpectError = Class.new({
  name: 'TypeExpectError',
  extends: Error,
  initialize: function(caller,expected,got) {
    this.message = caller+': expected object of type '+expected+'; got '+typeof(got);
  }
});
