// GRID PUBLIC CLASS DEFINITION
// ====================

var Grid = function(element, options)
{
    this.element = $(element);
    this.options = $.extend(true, {}, Grid.defaults, this.element.data(), options);
    this.state = {
        columns: [],
        current: 1,
        rowCount: this.options.rowCount,
        sort: {},
        total: 0,
        totalPages: 0
    };

    init(this);
};

Grid.defaults = {
    post: {},     // or use function () { return {}; }
    padding: 2,   // page padding (pagination)
    rowCount: 10, // rows per page
    url: "",      // or use function () { return ""; }
    topPagination: false,
    multiSort: false,
    // todo: implement cache

    // note: The following properties are not available via data-api attributes
    css: {
        footer: "bootgrid-footer",
        icon: "glyphicon",
        iconDown: "glyphicon-chevron-down",
        iconUp: "glyphicon-chevron-up",
        loading: "bootgrid-loading",
        pagination: "pagination",
        header: "bootgrid-header",
        sortable: "sortable",
        table: "bootgrid-table table"
    },
    labels: {
        loading: "Loading...",
        noResults: "No results found!"
    },
    templates: {
        anchor: "<a href=\"{{href}}\">{{text}}</a>",
        cell: "<td>{{content}}</td>",
        div: "<div id=\"{{id}}\" class=\"{{css}}\"></div>",
        icon: "<span class=\"{{css}}\"></span>",
        list: "<ul class=\"{{css}}\"></ul>",
        listItem: "<li></li>",
        loading: "<div class=\"{{css}}\"><div>{{text}}</div></div>",
        noResults: "<tr><td colspan=\"{{columns}}\" class=\"no-results\">{{text}}</td></tr>",
        row: "<tr></tr>"
    }
};

Grid.prototype.destroy = function()
{
    this.element.off(namespace).removeData(namespace);
};

Grid.prototype.reload = function()
{
    this.state.current = 1; // reset
    // todo: support static data (no ajax)
    loadData(this.element, this.options, this.state);
};

Grid.prototype.sort = function(dictionary)
{
    var values = (dictionary) ? $.extend({}, dictionary) : {};
    if (values === this.state.sort)
    {
        return this;
    }

    this.state.sort = values;

    $.each(values, function(field, direction)
    {
        // todo: Implement rendering
    });

    // todo: Show loading
    // todo: Execute post

    return this;
};