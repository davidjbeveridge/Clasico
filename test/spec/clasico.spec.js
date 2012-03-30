describe("Kernel", function(){
  
  describe("extend", function() {
    it("modifies the passed object", function() {
      var test_object = {a: 1};
      expect( Kernel.extend(true, test_object, {b: 2}) ).toBe(test_object);
    });
    
    it("extends objects", function(){
      expect( Kernel.extend({}, {name: "David"}).name ).toEqual("David");
    });
  });
  
  describe("is_method", function() {
    it("returns true for functions", function() {
      expect( Kernel.is_method( new Function ) ).toEqual(true);
    });
    
    it("returns false for non-functions", function() {
      items = [ 1, 'A', "Longer", "function", {}, [], undefined, null, NaN ]
      for (var i=0; i < items.length; i++) {
        expect( Kernel.is_method(items[i]) ).toEqual(false);
      };
    });
  });
  
  describe("is_function", function() {
    it("returns true for functions", function() {
      expect( Kernel.is_function( new Function ) ).toEqual(true);
    });
    
    it("returns false for non-functions", function() {
      var items = [ 1, 'A', "Longer", "function", {}, [], undefined, null, NaN ]
      for (var i=0; i < items.length; i++) {
        expect( Kernel.is_function(items[i]) ).toEqual(false);
      };
    });
  });
  
  describe("is_object", function() {
    it("returns false for Number, String, undefined, null, function, or Boolean", function() {
      var things = [ 1, NaN, "Hello World", undefined, null, new Function, false ]
      for (var i=0; i < things.length; i++) {
        expect( Kernel.is_object(things[i]) ).toEqual(false);
      };
    });
    
    it("returns true for objects", function() {
      var things = [ {}, {hello: 'world'}, new String ]
      for (var i=0; i < things.length; i++) {
        expect( Kernel.is_object(things[i]) ).toEqual(true);
      };
    });
  });
  
  describe("is_null", function() {
    it("returns true for null", function() {
      expect( Kernel.is_null(null) ).toEqual(true);
    });
  });
  
  describe("is_string", function() {
    it("returns true for valid strings", function() {
      var things = [ "Hello", '', 'c', "", new String ]
      for (var i=0; i < things.length; i++) {
        expect( Kernel.is_string(things[i]) ).toEqual(true);
      }; 
    });
    
    it("returns false for anything else", function() {
      var things = [ {}, [], 0, NaN, null, undefined, false ]
      for (var i=0; i < things.length; i++) {
        expect( Kernel.is_string(things[i]) ).toEqual(false);
      }; 
    });
  });
  
  describe("is_number", function() {
    it("returns true for valid numbers", function() {
      var things = [ 0, NaN, Infinity, Number.MAX_VALUE, Number.MIN_VALUE ]
      for (var i=0; i < things.length; i++) {
        expect( Kernel.is_number(things[i]) ).toEqual(true);
      }; 
    });
    
    it("returns false for anything else", function() {
      var things = [ {}, [], null, undefined, false, "1", '2' ]
      for (var i=0; i < things.length; i++) {
        expect( Kernel.is_number(things[i]) ).toEqual(false);
      }; 
    });
  });
  
  describe("defined", function() {
    it("returns true for anything w/ a value", function() {
      var things = [ 0, NaN, Infinity, Number.MAX_VALUE, Number.MIN_VALUE, "hello", {}, [] ]
      for (var i=0; i < things.length; i++) {
        expect( Kernel.defined(things[i]) ).toEqual(true);
      }; 
    });
    
    it("returns true for anything w/ a value", function() {
      var things = [ {}['fake_key'], undefined, null ]
      for (var i=0; i < things.length; i++) {
        expect( Kernel.defined(things[i]) ).toEqual(false);
      }; 
    });
  });
  
})

describe("Class", function(){
	
	it("throws an error if no attributes given", function() {
	  function badInstantiation() {
	    new Class;
	  }
	  expect( badInstantiation ).toThrow(new TypeExpectError("Class", "Object", undefined) );
	});

	it("throws an error if no attributes given", function() {
	  function badInstantiation() {
	    new Class("Hello");
	  }
	  expect( badInstantiation ).toThrow(new TypeExpectError("Class", "Object", "Hello") );
	});
	
	it("Runs the constructor function", function(){
		var Person = new Class({
			initialize: (function(age, sex){
				this.age = age;
				this.sex = sex;
			})
		});
		
		var me = new Person(25, "male");
		expect(me.age).toEqual(25);
		expect(me.sex).toEqual("male");		
	});
	
	describe("public methods", function(){
		var Person = new Class({
			initialize: (function(age, sex){
				this.age = age;
				this.sex = sex;
			}),
			public: {
				isOld: (function isOld(){
					return this.age > 55;
				})
			}
		});

		var me = new Person(25, "male");
		
		it("can call public methods on the instances", function() {
		  expect(me.isOld()).toEqual(false);
		});
		
		it("has the public methods in the prototype", function() {
		  expect(me.constructor.prototype.isOld).toEqual(me.isOld);
		});
		
		it("responds to the public methods", function() {
		  expect( me.respond_to('isOld') ).toEqual(true);
		});
		
	});
	
	describe("inheritance", function() {
	  var Person = new Class({
			initialize: (function(age, sex){
				this.age = age;
				this.sex = sex;
			}),
			public: {
				isOld: (function isOld(){
					return this.age > 55;
				})
			}
		});
		
		var Programmer = new Class({
		  extend: Person
		});
		
		it("inherits the constructor if none is passed", function() {
		  var me = new Programmer(25, 'male');
  		expect( me.age ).toEqual(25);
		});
		
		it("has instances that descend from the parent class", function() {
		  var me = new Programmer(25, 'male');
  		expect( me.kind_of(Person) ).toEqual(true);
		});
		
		it("is not an instance of the parent class", function() {
		  var me = new Programmer(25, 'male');
		  expect( me.instance_of(Person) ).toEqual(false);
		});
		
		it("is an instance of the its constructing class", function() {
		  var me = new Programmer(25, 'male');
		  expect( me.instance_of(Programmer) ).toEqual(true);
		});
		
	});
	
	describe("static methods", function(){
		var Person = new Class({
			initialize: (function(age, sex){
				this.age = age;
				this.sex = sex;
				Person.increaseCount();
			}),
			static: {
				count: (function count(){
					return this._count || 0;
				}),
				increaseCount: (function increaseCount(by){
					this._count = this._count || 0;
					this._count += (by || 0);
				}),
				getContext: (function getContext(){
				  return this;
				})
			}
		});
		
		it("exists", function() {
		  expect( Kernel.is_method(Person.count) ).toEqual(true);
		});
		
		it("executes in the context of the class", function() {
		  expect( Person.getContext() ).toEqual(Person);
		});
		
		it("maintains static vars", function() {
  		Person.increaseCount(4);
  		expect(Person.count()).toEqual(4);
		});
		
	});
	
	describe("Module", function() {
	  
	  var Talker = new Module({
	    public: {
	      sayHello: function(){ console.log("Hello"); }
	    }
	  });
	  
	  var Person = new Class({
	    initialize: (function Person(age, gender){
	      this.age = age;
	      this.gender = gender;
	    })
	  });
	  
	  it("can decorate a class", function() {
	    Talker.decorate(Person);
	    david = new Person(25, 'male');
	    expect( david.respond_to('sayHello') ).toEqual(true);
	  });
	  
	  it("can be included in a class", function() {
	    Person.include(Talker);
	    david = new Person(25, 'male');
	    expect( david.respond_to('sayHello') ).toEqual(true);
	  });
	  
	});
	
	describe("Interface", function() {
    var Loud = new Interface({
	    yell: (new Function)
	  })

  	it("raises an error without the required methods.", function(){
  	  function badInterface(){
    	  var Person = new Class({
    	    implements: Loud
    		}); 
  	  }
  		expect(badInterface).toThrow()
		});
		
		it("doesn't complain if the interface is implemented, regardless of the implementation", function() {
		  function goodInterface() {
		    var Person = new Class({
		      implements: Loud,
		      public: {
		        yell: (new Function)
		      }
		    });
		  }
		  expect( goodInterface ).not.toThrow()
		});
	});
	
});