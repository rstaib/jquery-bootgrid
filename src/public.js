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

    init(this.element, this.options, this.state);
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
        anchor: "<a href=\"{0}\">{1}</a>",
        cell: "<td>{0}</td>",
        div: "<div id=\"{0}\" class=\"{1}\"></div>",
        icon: "<span class=\"{0}\"></span>",
        list: "<ul class=\"{0}\"></ul>",
        listItem: "<li></li>",
        noResults: "<tr><td colspan=\"{0}\" class=\"no-results\">{1}</td></tr>",
        row: "<tr>{0}</tr>"
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