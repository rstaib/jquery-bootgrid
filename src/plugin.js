// GRID PLUGIN DEFINITION
// =====================

var old = $.fn.bootgrid;

$.fn.bootgrid = function (option)
{
    return this.each(function ()
    {
        var $this = $(this),
            instance = $this.data(namespace),
            options = typeof option === "object" && option;

        if (!instance && option === "destroy")
        {
            return;
        }
        if (!instance)
        {
            $this.data(namespace, (instance = new Grid(this, options)));
            init(instance.element, instance.options, instance.context);
        }
        if (typeof option === "string")
        {
            return instance[option]();
        }
    });
};

$.fn.bootgrid.Constructor = Grid;

// GRID NO CONFLICT
// ===============

$.fn.bootgrid.noConflict = function ()
{
    $.fn.bootgrid = old;
    return this;
};

// GRID DATA-API
// ============

/*
$(document).on("click" + namespace + ".data-api", "[data-toggle=\"bootgrid\"]", function(e)
{
    e.preventDefault();
    $(this).bootgrid("show");
});
*/