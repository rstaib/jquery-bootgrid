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

if (!String.prototype.resolve)
{
    var formatter = {
        "checked": function(value)
        {
            if (typeof value === "boolean")
            {
                return (value) ? "checked=\"checked\"" : "";
            }

            return value;
        }
    };

    String.prototype.resolve = function (substitutes, prefixes)
    {
        var result = this;
        $.each(substitutes, function (key, value)
        {
            if (typeof value === "object")
            {
                var keys = (prefixes) ? $.extend([], prefixes) : [];
                keys.push(key);
                result = result.resolve(value, keys);
            }
            else
            {
                if ($.isFunction(formatter[key]))
                {
                    value = formatter[key](value);
                }
                key = (prefixes) ? prefixes.join(".") + "." + key : key;
                var pattern = new RegExp("\\{\\{" + key + "\\}\\}", "gm");
                result = result.replace(pattern, value);
            }
        });
        return result;
    };
}

if (!Array.prototype.page)
{
    Array.prototype.page = function (page, size)
    {
        var skip = (page - 1) * size,
            end = skip + size;
        return (this.length > skip) ? 
            (this.length > end) ? this.slice(skip, end) : 
                this.slice(skip) : [];
    };
}

if (!Array.prototype.where)
{
    Array.prototype.where = function (predicate)
    {
        var result = [];
        for (var i = 0; i < this.length; i++)
        {
            var item = this[i];
            if (predicate(item))
            {
                result.push(item);
            }
        }
        return result;
    };
}