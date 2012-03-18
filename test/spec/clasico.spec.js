describe("Class", function(){
	
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
	
	it("Supports public methods in the protype", function(){
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
		expect(me.isOld()).toEqual(false);
		expect(me.constructor.prototype.isOld).toEqual(me.isOld);
	});
	
	it("Supports static methods", function(){
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
				})
			}
		});
		
		Person.increaseCount(4);
		expect(Person.count()).toEqual(4);
		
	});
	
});