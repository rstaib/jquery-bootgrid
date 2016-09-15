// GRID COMMON TYPE EXTENSIONS
// ============

$.fn.extend({
    _bgAria: function (name, value)
    {
        return (value) ? this.attr("aria-" + name, value) : this.attr("aria-" + name);
    },

    _bgBusyAria: function(busy)
    {
        return (busy == null || busy) ? 
            this._bgAria("busy", "true") : 
            this._bgAria("busy", "false");
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

    _bgEnableField: function (enable)
    {
        return (enable == null || enable) ? 
            this.removeAttr("disabled") : 
            this.attr("disabled", "disable");
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
    
    var _templateCache = {};
    var getTemplate = function(template){
        if (!_templateCache.hasOwnProperty(template)){
            var str = template.split(/{([^{}]+)}/g);

            for (var i = 0; i < str.length; i++){
                var s = str[i];
                var hasStart = (s.charAt(0) === "}");
                var hasEnd = (s.charAt(s.length - 1) === "{");
                if (hasStart)
                    s = s.substr(1);
                if (hasEnd)
                    s = s.substr(0, s.length - 1);

                if (hasStart || hasEnd){
                    str[i] = s;  //plain old html
                } else {
                    str[i] = {
                        token: str[i],
                        key: s.split(".")
                    };
                }
            }
            _templateCache[template] = str;
        }
        return _templateCache[template];
    };

    String.prototype.resolve = function (substitutes, prefixes)
    {
        var str = getTemplate(this);
        var result = "";
        for (var i = 0; i < str.length; i++){
            if (typeof str[i] === "object"){
                var key = str[i].key;
                 // now we have a variable to be substitued
                if (substitutes.hasOwnProperty(key[0]))
                    var v = substitutes[key[0]];
                else
                    continue;

                for (var k = 1; k < key.length; k++){
                    if (v.hasOwnProperty(key[k])){
                        v = v[key[k]];
                    } else {
                        v = null;
                        break;
                    }
                }
                var formatter_key = key[key.length-1];
                if (formatter && formatter[formatter_key] && typeof formatter[formatter_key] === "function"){
                    result += formatter[formatter_key](v);
                } else {
                    result += v;
                }
            } else {
                result += str[i]; // plain old html
            }
        }
        return result;
    };
}

if (!Array.prototype.first)
{
    Array.prototype.first = function (condition)
    {
        for (var i = 0; i < this.length; i++)
        {
            var item = this[i];
            if (condition(item))
            {
                return item;
            }
        }
        return null;
    };
}

if (!Array.prototype.contains)
{
    Array.prototype.contains = function (condition)
    {
        for (var i = 0; i < this.length; i++)
        {
            var item = this[i];
            if (condition(item))
            {
                return true;
            }
        }
        return false;
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
    Array.prototype.where = function (condition)
    {
        var result = [];
        for (var i = 0; i < this.length; i++)
        {
            var item = this[i];
            if (condition(item))
            {
                result.push(item);
            }
        }
        return result;
    };
}

if (!Array.prototype.propValues)
{
    Array.prototype.propValues = function (propName)
    {
        var result = [];
        for (var i = 0; i < this.length; i++)
        {
            result.push(this[i][propName]);
        }
        return result;
    };
}
