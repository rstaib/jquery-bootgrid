// GRID PLUGIN DEFINITION
// =====================

var old = $.fn.bootgrid;

$.fn.bootgrid = function (option)
{
    return this.each(function ()
    {
        var $this = $(this),
            data = $this.data(namespace),
            options = typeof option === "object" && option;

        if (!data && option === "destroy")
        {
            return;
        }
        if (!data)
        {
            $this.data(namespace, (data = new Grid(this, options)));
        }
        if (typeof option === "string")
        {
            return data[option]();
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