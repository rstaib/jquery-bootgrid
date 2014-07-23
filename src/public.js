// GRID PUBLIC CLASS DEFINITION
// ====================

/**
 * Represents the jQuery Bootgrid plugin.
 *
 * @class Grid
 * @constructor
 * @param [element] {Object} The corresponding DOM element.
 * @param [options] {Object} The options to initialize the plugin.
 * @chainable
 **/
var Grid = function(element, options)
{
    this.element = $(element);
    this.options = $.extend(true, {}, Grid.defaults, this.element.data(), options);
    this.columns = [];
    this.current = 1;
    this.rows = []; // cached rows
    var rowCount = this.options.rowCount;
    this.rowCount = (typeof rowCount === "object") ? getFirstDictionaryItem(rowCount).value : rowCount;
    this.sort = {};
    this.total = 0;
    this.totalPages = 0;
};

Grid.defaults = {
    navigation: 3, // it's a flag: 0 = none, 1 = top, 2 = bottom, 3 = both (top and bottom)
    enableAsync: false, // todo: implement and find a better name for this property!
    enableSelection: false, // todo: implement!
    enableSorting: false, // todo: implement!
    multiSelect: false, // todo: implement!
    multiSort: false,
    selectRows: false, // todo: implement and find a better name for this property [select new rows after adding]!
    padding: 2, // page padding (pagination)
    post: {}, // or use function () { return {}; }
    rowCount: { // rows per page
        "10": 10,
        "25": 25,
        "50": 50,
        "All": -1
    },
    url: "", // or use function () { return ""; }

    // todo: implement cache

    // note: The following properties are not available via data-api attributes
    css: {
        actions: "actions btn-group", // must be a unique class name or constellation of class names within the header and footer
        columnHeaderAnchor: "column-header-anchor", // must be a unique class name or constellation of class names within the column header cell
        columnHeaderText: "text",
        dropDownItemButton: "dropdown-item-button", // must be a unique class name or constellation of class names within the actionDropDown
        dropDownItemCheckbox: "dropdown-item-checkbox", // must be a unique class name or constellation of class names within the actionDropDown
        dropDownMenu: "dropdown btn-group", // must be a unique class name or constellation of class names within the actionDropDown
        dropDownMenuItems: "dropdown-menu pull-right", // must be a unique class name or constellation of class names within the actionDropDown
        dropDownMenuText: "dropdown-text", // must be a unique class name or constellation of class names within the actionDropDown
        footer: "bootgrid-footer container-fluid",
        header: "bootgrid-header container-fluid",
        icon: "icon glyphicon",
        iconColumns: "glyphicon-th-list",
        iconDown: "glyphicon-chevron-down",
        iconRefresh: "glyphicon-refresh",
        iconUp: "glyphicon-chevron-up",
        infos: "infos", // must be a unique class name or constellation of class names within the header and footer,
        pagination: "pagination", // must be a unique class name or constellation of class names within the header and footer
        paginationButton: "button", // must be a unique class name or constellation of class names within the pagination
        sortable: "sortable",
        table: "bootgrid-table table"
    },
    formatters: {},
    labels: {
        infos: "Showing {{ctx.start}} to {{ctx.end}} of {{ctx.total}} entries",
        loading: "Loading...",
        noResults: "No results found!",
        refresh: "Refresh"
    },
    templates: {
        // note: Grenzen der template sprache sind: Templates duerfen nur einmal ineinander verschachtelt werden und 
        //       es darf mittels des Kontexts kein weiteres HTML, dass wiederum Variablen enthalten kann, die auch ersetzt werden muessen, eingefuegt werden.
        actionButton: "<button class=\"btn btn-default\" type=\"button\" title=\"{{ctx.text}}\">{{tpl.icon}}</button>",
        actionDropDown: "<div class=\"{{css.dropDownMenu}}\"><button class=\"btn btn-default dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\"><span class=\"{{css.dropDownMenuText}}\">{{ctx.content}}</span> <span class=\"caret\"></span></button><ul class=\"{{css.dropDownMenuItems}}\" role=\"menu\"></ul></div>",
        actionDropDownItem: "<li><a href=\"{{ctx.uri}}\" class=\"{{css.dropDownItemButton}}\">{{ctx.key}}</a></li>",
        actionDropDownCheckboxItem: "<li><label class=\"{{css.dropDownItemCheckbox}}\"><input name=\"{{ctx.name}}\" type=\"checkbox\" value=\"1\" {{ctx.checked}} /> {{ctx.label}}</label></li>",
        actions: "<div class=\"{{css.actions}}\"></div>",
        body: "<tbody></tbody>",
        cell: "<td>{{ctx.content}}</td>",
        footer: "<div id=\"{{ctx.id}}\" class=\"{{css.footer}}\"><div class=\"row\"><div class=\"col-sm-6\"><p class=\"{{css.pagination}}\"></p></div><div class=\"col-sm-6 infoBar\"><p class=\"{{css.infos}}\"></p></div></div></div>",
        header: "<div id=\"{{ctx.id}}\" class=\"{{css.header}}\"><div class=\"row\"><div class=\"col-sm-12 actionBar\"><p class=\"{{css.actions}}\"></p></div></div></div>",
        headerCell: "<th data-column-id=\"{{ctx.columnId}}\"><a href=\"javascript:void(0);\" class=\"{{css.columnHeaderAnchor}} {{ctx.sortable}}\"><span class=\"{{css.columnHeaderText}}\">{{ctx.content}}</span>{{ctx.icon}}</a></th>",
        icon: "<span class=\"{{css.icon}} {{ctx.iconCss}}\"></span>",
        infos: "<div class=\"{{css.infos}}\">{{lbl.infos}}</div>",
        loading: "<tr><td colspan=\"{{ctx.columns}}\" class=\"loading\">{{lbl.loading}}</td></tr>",
        noResults: "<tr><td colspan=\"{{ctx.columns}}\" class=\"no-results\">{{lbl.noResults}}</td></tr>",
        pagination: "<ul class=\"{{css.pagination}}\"></ul>",
        paginationItem: "<li class=\"{{ctx.css}}\"><a href=\"{{ctx.uri}}\" class=\"{{css.paginationButton}}\">{{ctx.text}}</a></li>",
        row: "<tr>{{ctx.cells}}</tr>"
    }
};

Grid.prototype.add = function(item)
{
    // todo: implement!
    if ($.isPlainObject(item))
    {
        // single add
    }
    else if ($.isArray(item))
    {
        // multi add (range)
    }
};

Grid.prototype.clear = function()
{
    // todo: implement!
};

Grid.prototype.destroy = function()
{
    $(window).off(namespace);
    this.element.off(namespace).removeData(namespace);
    // todo: empty body and remove surrounding elements
};

Grid.prototype.insert = function(index, item)
{
    // todo: implement!
    if ($.isPlainObject(item))
    {
        // single insert
    }
    else if ($.isArray(item))
    {
        // multi insert (range)
    }
};

Grid.prototype.reload = function()
{
    this.current = 1; // reset
    // todo: support static data (no ajax)
    loadData.call(this);
};

Grid.prototype.remove = function(id)
{
    // todo: implement!
    if (typeof id === "string")
    {
        // single remove
    }
    else if ($.isArray(id))
    {
        // multi remove (range)
    }
};

Grid.prototype.select = function()
{
    // todo: implement!
};

Grid.prototype.sort = function(dictionary)
{
    var values = (dictionary) ? $.extend({}, dictionary) : {};
    if (values === this.context.sort)
    {
        return this;
    }

    this.context.sort = values;

    $.each(values, function(field, direction)
    {
        // todo: Implement rendering
    });

    // todo: Show loading
    // todo: Execute post

    return this;
};