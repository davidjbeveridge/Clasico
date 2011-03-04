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
Kernel.extend = function(a,b) {
  for(prop in b)  {
    a[prop] = b[prop];
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

  var constructor;

  var func_name = attributes.name || 'Constructor';

  // Create a constructor function:
  if(Kernel.is_method(attributes.extends)){ // Use a parent constructor
    eval("function "+func_name+"(){\
      attributes.extends.apply(this,arguments);\
      if(Kernel.is_method(attributes.initialize))  {\
        attributes.initialize.apply(this,arguments);\
      }\
    };");
    constructor = eval(func_name);
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

  // Inherit instance methods from our parent...
  if(attributes.extends)  {
    if(Kernel.is_method(attributes.extends)) {
      Kernel.extend(constructor.prototype, (attributes.extends.prototype));
    }
    else  {
      if(Kernel.is_object(attributes.extends)) {
        Kernel.extend(constructor.prototype, attributes.extends);
      }
    }
  }

  // Assign own instance methods...
  if(Kernel.is_object(attributes.public))  {
    Kernel.extend(constructor.prototype,attributes.public);
  }

  // Set class instances to reference the correct constructor
  constructor.prototype.constructor = constructor;

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
    return (some_interface instanceof Interface) && Kernel.is_method(some_interface.implemented_in) && some_interface.implemented_in(this);
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



function Interface(methods) {
  if(typeof methods !== 'object') {
    throw new TypeExpectError('Interface','Object',methods);
  }
  this.methods = [];
  for(methodName in methods) {
    if(typeof methods[methodName] === 'function') { this.methods.push(methodName); }
  }
}

function TypeExpectError(caller,expected,got){
  this.message = caller+': expected object of type '+expected+'; got '+typeof(got)
}
TypeExpectError.prototype = new Error;
TypeExpectError.prototype.constructor = TypeExpectError
