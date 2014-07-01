// GRID PUBLIC CLASS DEFINITION
// ====================

var Grid = function(element, options)
{
    this.element = $(element);
    this.options = $.extend(true, {}, Grid.defaults, this.element.data(), options);
    var rowCount = this.options.rowCount;
    this.context = {
        columns: [],
        current: 1,
        rowCount: (typeof rowCount === "object") ? getFirstDictionaryItem(rowCount).value : rowCount,
        sort: {},
        total: 0,
        totalPages: 0,
        cachedParams: {
            tpl: this.options.templates,
            lbl: this.options.labels,
            css: this.options.css,
            ctx:  {}
        }
    };
};

Grid.defaults = {
    navigation: 3, // it's a flag: 0 = none, 1 = top, 2 = bottom, 3 = both (top and bottom)
    multiSort: false,
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
        dropDownItemButton: "dropdown-button", // must be a unique class name or constellation of class names within the actionDropDown
        dropDownMenu: "dropdown-menu pull-right", // must be a unique class name or constellation of class names within the actionDropDown
        footer: "bootgrid-footer container-fluid",
        header: "bootgrid-header container-fluid",
        icon: "icon glyphicon",
        iconDown: "glyphicon-chevron-down",
        iconRefresh: "glyphicon-refresh",
        iconUp: "glyphicon-chevron-up",
        infos: "infos", // must be a unique class name or constellation of class names within the header and footer
        loading: "bootgrid-loading",
        pagination: "pagination", // must be a unique class name or constellation of class names within the header and footer
        paginationButton: "button", // must be a unique class name or constellation of class names within the pagination
        sortable: "sortable",
        table: "bootgrid-table table"
    },
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
        actionDropDown: "<div class=\"btn-group\"><button class=\"btn btn-default dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\">{{ctx.text}} <span class=\"caret\"></span></button><ul class=\"{{css.dropDownMenu}}\" role=\"menu\"></ul></div>",
        actionDropDownItem: "<li><a href=\"{{ctx.uri}}\" class=\"{{ctx.buttonCss}}\">{{ctx.key}}</a></li>",
        actions: "<div class=\"{{css.actions}}\"></div>",
        cell: "<td>{{ctx.content}}</td>",
        footer: "<div id=\"{{ctx.id}}\" class=\"{{css.footer}}\"><div class=\"row\"><div class=\"col-sm-6\"><p class=\"{{css.pagination}}\"></p></div><div class=\"col-sm-6 infoBar\"><p class=\"{{css.infos}}\"></p></div></div></div>",
        header: "<div id=\"{{ctx.id}}\" class=\"{{css.header}}\"><div class=\"row\"><div class=\"col-sm-12 actionBar\"><p class=\"{{css.actions}}\"></p></div></div></div>",
        headerCellContent: "<a href=\"javascript:void(0);\" class=\"{{css.columnHeaderAnchor}} {{ctx.sortable}}\"><span class=\"{{css.columnHeaderText}}\">{{ctx.content}}</span>{{ctx.icon}}</a>",
        icon: "<span class=\"{{css.icon}} {{ctx.iconCss}}\"></span>",
        infos: "<div class=\"{{css.infos}}\">{{lbl.infos}}</div>",
        loading: "<div class=\"{{css.loading}}\"><div>{{lbl.loading}}</div></div>",
        noResults: "<tr><td colspan=\"{{ctx.columns}}\" class=\"no-results\">{{ctx.text}}</td></tr>",
        pagination: "<ul class=\"{{css.pagination}}\"></ul>",
        paginationItem: "<li class=\"{{ctx.css}}\"><a href=\"{{ctx.uri}}\" class=\"{{css.paginationButton}}\">{{ctx.text}}</a></li>",
        row: "<tr></tr>"
    }
};

Grid.prototype.destroy = function()
{
    $(window).off(namespace);
    this.element.off(namespace).removeData(namespace);
};

Grid.prototype.reload = function()
{
    this.context.current = 1; // reset
    // todo: support static data (no ajax)
    loadData(this.element, this.options, this.context);
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