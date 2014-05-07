// GRID COMMON TYPE EXTENSIONS
// ============

$.fn.extend({
	_bgAria: function (name, value)
	{
		return this.attr("aria-" + name, value);
	},

	_bgRemoveAria: function (name)
	{
		return this.removeAttr("aria-" + name);
	},

	_bgEnableAria: function (enable)
	{
		return (enable == null || enable) ? 
			this.removeClass("disabled")._bgAria("disabled", "false") : 
			this.addClass("disabled")._bgAria("disabled", "true");
	},

	_bgShowAria: function (show)
	{
		return (show == null || show) ? 
			this.show()._bgAria("hidden", "false") :
			this.hide()._bgAria("hidden", "true");
	},

	_bgSelectAria: function (select)
	{
		return (select == null || select) ? 
			this.addClass("active")._bgAria("selected", "true") : 
			this.removeClass("active")._bgAria("selected", "false");
	},

	_bgId: function (id)
	{
		return (id) ? this.attr("id", id) : this.attr("id");
	}
});

if (!String.prototype.format)
{
	String.prototype.format = function (stringValues)
	{
		var formattedString = this;
		for (var i = 0; i < arguments.length; i++)
		{
			var pattern = new RegExp("\\{" + i + "\\}", "gm");
			formattedString = formattedString.replace(pattern, arguments[i]);
		}
		return formattedString;
	};
}