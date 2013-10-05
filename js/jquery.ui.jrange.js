// we need to hack the jqueryui datepicker

$.datepicker._defaults.onAfterUpdate = null;

var datepicker__updateDatepicker = $.datepicker._updateDatepicker;

$.datepicker._updateDatepicker = function(inst){
	datepicker__updateDatepicker.call(this, inst);
	var onAfterUpdate = this._get(inst, 'onAfterUpdate');
	if (onAfterUpdate)
		onAfterUpdate.apply((inst.input ? inst.input[0] : null),[(inst.input ? inst.input.val() : ''), inst]);
};




(function($){

$.widget("ui.jrange", {
	options: {  
		dateFormat: "D, d M yy"
	},
	
	_create: function() {
		var self = this;
		var o = self.options;
		var el = self.element;
		
		self.cur = new Date();
		self.prv = self.cur;
		self.newSelection = true;
		
		
		
		self.input = el.children("input");
		self.div = el.children("div");
		
		
		self.input.val($.datepicker.formatDate(o.dateFormat,self.cur,{}));

		self.div.css({position: "absolute"});
		
		self.div.datepicker({
			changeMonth: true,
			changeYear: true,
			showButtonPanel: true,
			onSelect: function(dateText, inst){
				self.newSelection = self.newSelection || (self.prv.valueOf() != self.cur.valueOf());

				var sel = new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay);
				
				if(self.newSelection){
					self.prv = self.cur = sel;
					self.newSelection = false;
				}
				else{
					self.prv = self.cur;
					self.cur = sel;
				}
				
				self._updateVal();
			},
			beforeShowDay: function(date){
				return [
					true, 
					( (date >= Math.min(self.prv, self.cur) && date <= Math.max(self.prv, self.cur)) ? 'date-range-selected' : '')
				];
			},
			onAfterUpdate: function(dateText, inst){
				var buttonpane = self.div.find(".ui-datepicker-buttonpane");
				
				buttonpane.empty();

				// "Done"
				$('<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" data-handler="hide" data-event="click">Done</button>')
				.appendTo(buttonpane)
				.on('click', function () { self.div.hide(); });
				
				// "Select month"
				$('<button type="button" class="ui-state-default ui-corner-all">Select Month</button>')
				.appendTo(buttonpane)
				.on('click', function(){
					self.newSelection = true;
					self.div.find(".ui-datepicker-calendar").find("a:last").click();
					self.div.find(".ui-datepicker-calendar").find("a:first").click();
				});
			} 
		}).hide();

		self.input.on('focus', function(e){
			if(self.div.is(":visible")){
				self.hide();
			}
			else{
				self.show();
			}
		});
	},
	
	destroy: function() {
		var self = this;
		self.div.datepicker("destroy");
		self.input.off('focus');
	},
	
	_setOption: function(option, value) {
		var self = this;
		var o = self.options;
		
		switch (option) {
			case "dateFormat":
				o.dateFormat = value;
				self._updateVal();
				break;
		}  
	},
	
	_updateVal: function() {
		var self = this;
		var o = self.options;
		
		if(self.prv.valueOf() == self.cur.valueOf()){
			self.input.val($.datepicker.formatDate(o.dateFormat,self.cur,{}));
		}
		else{
			var d1 = $.datepicker.formatDate(o.dateFormat,new Date(Math.min(self.prv, self.cur)),{});
			var d2 = $.datepicker.formatDate(o.dateFormat,new Date(Math.max(self.prv, self.cur)),{});
			self.input.val(d1 + " - " + d2);
		}
	},
	
	getDate: function() {
		var self = this;
		
		return self.getStartDate();
	},
	
	getStartDate: function() {
		var self = this;
		
		var minDate = new Date(Math.min(self.cur, self.prv));
		return new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()); // eliminate time
	},

	getEndDate: function() {
		var self = this;
		
		var maxDate = new Date(Math.max(self.cur, self.prv));
		return new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()+1); // eliminate time and add a day
	},
	
	show: function() {
		var self = this;
		
		self.newSelection = true;

		self.div.show().position({
			my: 'left top',
			at: 'left bottom',
			of: self.input
		});
	},
	
	hide: function() {
		var self = this;
		
		self.div.hide();
	}
}); 

}(jQuery));