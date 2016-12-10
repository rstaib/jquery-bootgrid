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
            {
                s = s.substr(1);
            }
            if (hasEnd)
            {
                s = s.substr(0, s.length - 1);
            }

            if (hasStart || hasEnd)
            {
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
/*
// ONLY FOR TESTING
var String.prototype.resolve_old = function (substitutes, prefixes)
{
    var result = this;

    $.each(substitutes, function (key, value)
    {
        if (value != null && typeof value !== "function")
        {
            if (typeof value === "object")
            {
                var keys = (prefixes) ? $.extend([], prefixes) : [];
                keys.push(key);
                result = result.resolve_old(value, keys) + "";
            }
            else
            {
                if (formatter && formatter[key] && typeof formatter[key] === "function")
                {
                    value = formatter[key](value);
                }
                key = (prefixes) ? prefixes.join(".") + "." + key : key;
                var pattern = new RegExp("\\{\\{" + key + "\\}\\}", "gm");
                result = result.replace(pattern, (value.replace) ? value.replace(/\$/gi, "&#36;") : value);
            }
        }
    });

    return result;
};
*/
var template = function (template, substitutes, prefixes)
{
    var str = getTemplate(template);
    var result = "";
    for (var i = 0; i < str.length; i++){
        if (typeof str[i] === "object"){
            var key = str[i].key;
            var v = "";
             // now we have a variable to be substitued
            if (substitutes.hasOwnProperty(key[0]))
            {
                v = substitutes[key[0]];
            }
            else
            {
                continue;
            }

            for (var k = 1; k < key.length; k++){
                if (v.hasOwnProperty(key[k])){
                    v = v[key[k]];
                } else {
                    v = "";
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
    // ONLY FOR TESTING
    /*
    var result_old = this.resolve_old(substitutes, prefixes);
    if (result !== result_old){
        console.warn("Difference templating result");
        console.log(result);
        console.log(result_old);
    }
*/
    return result;
};
var arrayContains = function (arr, condition)
{
    for (var i = 0; i < arr.length; i++)
    {
        var item = arr[i];
        if (condition(item))
        {
            return true;
        }
    }
    return false;
};

var arrayPage = function (arr, page, size)
{
    var skip = (page - 1) * size,
        end = skip + size;
    return (arr.length > skip) ?
        (arr.length > end) ? arr.slice(skip, end) :
            arr.slice(skip) : [];
};

var arrayWhere = function (arr, condition)
{
    var result = [];
    for (var i = 0; i < arr.length; i++)
    {
        var item = arr[i];
        if (condition(item))
        {
            result.push(item);
        }
    }
    return result;
};

var arrayPropValues = function (arr, propName)
{
    var result = [];
    for (var i = 0; i < arr.length; i++)
    {
        result.push(arr[i][propName]);
    }
    return result;
};

