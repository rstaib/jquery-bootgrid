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
    // overrides rowCount explicitly because deep copy ($.extend) leads to strange behaviour
    var rowCount = this.options.rowCount = this.element.data().rowCount || options.rowCount || this.options.rowCount;
    this.columns = [];
    this.identifier = null; // The first column ID that is marked as identifier
    this.current = 1;
    this.rows = [];
    this.rowCount = ($.isArray(rowCount)) ? rowCount[0] : rowCount;
    this.sort = {};
    this.searchPhrase = "";
    this.total = 0;
    this.totalPages = 0;
    this.cachedParams = {
        lbl: this.options.labels,
        css: this.options.css,
        ctx: {}
    };
    this.header = null;
    this.footer = null;

    // todo: implement cache
};

Grid.defaults = {
    navigation: 3, // it's a flag: 0 = none, 1 = top, 2 = bottom, 3 = both (top and bottom)
    padding: 2, // page padding (pagination)
    rowCount: [10, 25, 50, -1], // rows per page int or array of int (-1 represents "All")
    selection: false, // todo: implement!
    multiSelect: false, // todo: implement!
    selectRows: false, // todo: implement and find a better name for this property [select new rows after adding]!
    sorting: true,
    multiSort: false,
    ajax: false, // todo: find a better name for this property to differentiate between client-side and server-side data
    post: {}, // or use function () { return {}; } (reserved properties are "current", "rowCount", "sort" and "searchPhrase")
    url: "", // or use function () { return ""; }

    // note: The following properties should be used via data-api attributes
    converters: {
        numeric: {
            from: function (value) { return +value; }, // converts from string to numeric
            to: function (value) { return value + ""; } // converts from numeric to string
        },
        string: {
            // default converter
            from: function (value) { return value; },
            to: function (value) { return value; }
        }
    },
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
        search: "search form-group", // must be a unique class name or constellation of class names within the header and footer
        searchField: "searchField form-control",
        sortable: "sortable",
        table: "bootgrid-table table"
    },
    formatters: {},
    labels: {
        all: "All",
        infos: "Showing {{ctx.start}} to {{ctx.end}} of {{ctx.total}} entries",
        loading: "Loading...",
        noResults: "No results found!",
        refresh: "Refresh",
        search: "Search"
    },
    templates: {
        actionButton: "<button class=\"btn btn-default\" type=\"button\" title=\"{{ctx.text}}\">{{ctx.content}}</button>",
        actionDropDown: "<div class=\"{{css.dropDownMenu}}\"><button class=\"btn btn-default dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\"><span class=\"{{css.dropDownMenuText}}\">{{ctx.content}}</span> <span class=\"caret\"></span></button><ul class=\"{{css.dropDownMenuItems}}\" role=\"menu\"></ul></div>",
        actionDropDownItem: "<li><a href=\"{{ctx.uri}}\" class=\"{{css.dropDownItemButton}}\">{{ctx.text}}</a></li>",
        actionDropDownCheckboxItem: "<li><label class=\"{{css.dropDownItemCheckbox}}\"><input name=\"{{ctx.name}}\" type=\"checkbox\" value=\"1\" {{ctx.checked}} /> {{ctx.label}}</label></li>",
        actions: "<div class=\"{{css.actions}}\"></div>",
        body: "<tbody></tbody>",
        cell: "<td>{{ctx.content}}</td>",
        footer: "<div id=\"{{ctx.id}}\" class=\"{{css.footer}}\"><div class=\"row\"><div class=\"col-sm-6\"><p class=\"{{css.pagination}}\"></p></div><div class=\"col-sm-6 infoBar\"><p class=\"{{css.infos}}\"></p></div></div></div>",
        header: "<div id=\"{{ctx.id}}\" class=\"{{css.header}}\"><div class=\"row\"><div class=\"col-sm-12 actionBar\"><p class=\"{{css.search}}\"></p><p class=\"{{css.actions}}\"></p></div></div></div>",
        headerCell: "<th data-column-id=\"{{ctx.column.id}}\"><a href=\"javascript:void(0);\" class=\"{{css.columnHeaderAnchor}} {{ctx.sortable}}\"><span class=\"{{css.columnHeaderText}}\">{{ctx.column.text}}</span>{{ctx.icon}}</a></th>",
        icon: "<span class=\"{{css.icon}} {{ctx.iconCss}}\"></span>",
        infos: "<div class=\"{{css.infos}}\">{{lbl.infos}}</div>",
        loading: "<tr><td colspan=\"{{ctx.columns}}\" class=\"loading\">{{lbl.loading}}</td></tr>",
        noResults: "<tr><td colspan=\"{{ctx.columns}}\" class=\"no-results\">{{lbl.noResults}}</td></tr>",
        pagination: "<ul class=\"{{css.pagination}}\"></ul>",
        paginationItem: "<li class=\"{{ctx.css}}\"><a href=\"{{ctx.uri}}\" class=\"{{css.paginationButton}}\">{{ctx.text}}</a></li>",
        row: "<tr>{{ctx.cells}}</tr>",
        search: "<div class=\"{{css.search}}\"><div class=\"input-group\"><span class=\"{{css.icon}} input-group-addon glyphicon-search\"></span> <input type=\"text\" class=\"{{css.searchField}}\" placeholder=\"{{lbl.search}}\" /></div></div>"
    }
};

Grid.prototype.append = function(rows)
{
    // there is only support for client-side data
    if (!this.options.ajax)
    {
        for (var i = 0; i < rows.length; i++)
        {
            appendRow.call(this, rows[i]);
        }
        sortRows.call(this);
        loadData.call(this);
    }

    return this;
};

Grid.prototype.clear = function()
{
    // there is only support for client-side data
    if (!this.options.ajax)
    {
        this.rows = [];
        this.current = 1;
        this.total = 0;
        loadData.call(this);
    }

    return this;
};

Grid.prototype.destroy = function()
{
    // todo: this method has to be optimized (the complete initial state must be restored)
    $(window).off(namespace);
    if (this.options.navigation & 1)
    {
        this.header.remove();
    }
    if (this.options.navigation & 2)
    {
        this.footer.remove();
    }
    this.element.remove("tbody").off(namespace).removeData(namespace);

    return this;
};

Grid.prototype.reload = function()
{
    this.current = 1; // reset
    loadData.call(this);

    return this;
};

Grid.prototype.remove = function(id)
{
    // there is only support for client-side data
    if (!this.options.ajax) // check also is identifier available
    {
        // todo: implement!
    }

    return this;
};

Grid.prototype.search = function(phrase)
{
    this.searchPhrase = phrase;
    loadData.call(this);

    return this;
};

Grid.prototype.select = function()
{
    // todo: implement!

    return this;
};

Grid.prototype.sort = function(dictionary)
{
    var values = (dictionary) ? $.extend({}, dictionary) : {};
    if (values === this.sort)
    {
        return this;
    }

    this.sort = values;

    renderTableHeader.call(this);
    sortRows.call(this);
    loadData.call(this);

    return this;
};