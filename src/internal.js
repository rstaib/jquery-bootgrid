// GRID INTERNAL FIELDS
// ====================

var namespace = "rs.jquery.bootgrid";

// GRID INTERNAL FUNCTIONS
// =====================

function getFooterId(element)
{
    return element._bgId() + "-footer";
}

function getHeaderId(element)
{
    return element._bgId() + "-header";
}

function getRequest(options, state)
{
    var request = {
            current: state.current,
            rowCount: options.rowCount,
            sort: state.sort
        },
        post = options.post;

    post = ($.isFunction(post)) ? post() : post;
    return $.extend(true, request, post);
}

function getUrl(options)
{
    var url = options.url;
    return ($.isFunction(url)) ? url() : url;
}

function hideLoading(instance)
{
    instance.loading.fadeOut(300);
    $(window).off("resize." + namespace);
}

function init(instance)
{
    var options = instance.options;
    instance.loading = $(options.templates.loading.resolve({
        css: options.css.loading, 
        text: options.labels.loading
    })).appendTo("body");

    loadColumns(instance);
    render(instance);
    loadData(instance);
}

function loadColumns(instance)
{
    var element = instance.element,
        options = instance.options,
        state = instance.state,
        firstHeadRow = element.find("thead > tr").first(),
        sorted = false;

    firstHeadRow.children().each(function()
    {
        var $this = $(this),
            custom = $this.data("custom"),
            order = $this.data("order"),
            sortable = $this.data("sortable"),
            column = {
                id: $this.data("column-id"),
                custom: (custom === true || custom === 1), // default: false
                order: (!sorted && (order === "asc" || order === "desc")) ? order : null,
                sortable: !(sortable === false || sortable === 0) // default: true
            };
        state.columns.push(column);
        if (column.order != null)
        {
            state.sort[column.id] = column.order;
        }

        // ensures that only the first order will be applied in case of multi sorting is disabled
        if (!options.multiSort && column.order !== null)
        {
            sorted = true;
        }
    });
}

/*
response = {
    current: 1,
    rowCount: 10,
    rows: [{}, {}],
    sort: [{ "columnId": "asc" }],
    total: 101
}
*/

function loadData(instance)
{
    var element = instance.element,
        options = instance.options,
        state = instance.state,
        request = getRequest(options, state),
        url = getUrl(options);

    if (url == null || typeof url !== "string" || url.length === 0)
    {
        throw new Error("Url setting must be a none empty string or a function that returns one.");
    }

    element.trigger("load." + namespace);
    showLoading(instance);
    // todo: support static data (no ajax)
    $.post(url, request, function (response)
    {
        if (typeof (response) === "string")
        {
            response = $.parseJSON(response);
        }

        state.current = response.current;
        state.total = response.total;
        state.totalPages = Math.round(state.total / state.rowCount);

        renderBody(element, options, state, response.rows);
        renderPagination(instance);
        hideLoading(instance);
        element.trigger("loaded." + namespace);
    }).fail(function() { hideLoading(instance); });
}

function render(instance)
{
    var element = instance.element,
        options = instance.options,
        css = options.css,
        tpl = options.templates,
        header = $(tpl.div.resolve({ id: getHeaderId(element), css: css.header })),
        footer = $(tpl.div.resolve({ id: getFooterId(element), css: css.footer }));

    element.addClass(css.table).before(header).after(footer);
    renderTableHeader(instance);
}

function renderBody(element, options, state, rows)
{
    var labels = options.labels,
        tpl = options.templates,
        tbody = element.children("tbody").first().empty();

    if (rows.length > 0)
    {
        $.each(rows, function(i, row)
        {
            var tr = $(tpl.row);
            $.each(state.columns, function(j, column)
            {
                if (column.custom)
                {
                    element.trigger("custom." + namespace, {
                        cell: $(tpl.cell.resolve({ content: "&nbsp;" })).appendTo(tr),
                        column: column,
                        row: row
                    });
                }
                else
                {
                    tr.append(tpl.cell.resolve({ content: row[column.id] || "&nbsp;" }));
                }
            });
            tbody.append(tr);
        });
    }
    else
    {
        tbody.append(tpl.noResults.resolve({ columns: state.columns.length, text: labels.noResults }));
    }
}

function renderPagination(instance)
{
    var element = instance.element,
        options = instance.options,
        state = instance.state,
        css = options.css,
        tpl = options.templates,
        current = state.current,
        totalPages = state.totalPages,
        list = $(tpl.list.resolve({ css: css.pagination })),
        offsetRight = totalPages - current,
        offsetLeft = (options.padding - current) * -1,
        startWith = ((offsetRight >= options.padding) ? 
            Math.max(offsetLeft, 1) : 
            Math.max((offsetLeft - options.padding + offsetRight), 1)),
        maxCount = options.padding * 2 + 1,
        count = (totalPages >= maxCount) ? maxCount : totalPages;

    renderPaginationItem(instance, list, "first", "&laquo;", "first")
        ._bgEnableAria(current > 1);
    renderPaginationItem(instance, list, "prev", "&lt;", "prev")
        ._bgEnableAria(current > 1);

    for (var i = 0; i < count; i++)
    {
        var pos = i + startWith;
        renderPaginationItem(instance, list, pos, pos, "page-" + pos)
            ._bgEnableAria()._bgSelectAria(pos === current);
    }

    renderPaginationItem(instance, list, "next", "&gt;", "next")
        ._bgEnableAria(totalPages > current);
    renderPaginationItem(instance, list, "last", "&raquo;", "last")
        ._bgEnableAria(totalPages > current);

    $("#" + getFooterId(element)).empty().append(list);
    if (options.topPagination)
    {
        $("#" + getHeaderId(element)).empty().append(list.clone(true));
    }
}

function renderPaginationItem(instance, list, uri, text, css)
{
    var options = instance.options,
        state = instance.state,
        tpl = options.templates,
        anchor = $(tpl.anchor.resolve({ href: "#" + uri, text: text }))
            .on("click." + namespace, function (e)
            {
                e.preventDefault();
                var $this = $(this);
                if (!$this.parent().hasClass("disabled"))
                {
                    var commandList = {
                        first: 1,
                        prev: state.current - 1,
                        next: state.current + 1,
                        last: state.totalPages
                    };
                    var command = $this.attr("href").substr(1);
                    state.current = commandList[command] || +command; // + converts string to int
                    loadData(instance);
                }
            }),
        listItem = $(tpl.listItem).addClass(css).append(anchor);

    list.append(listItem);
    return listItem;
}

function renderTableHeader(instance)
{
    var element = instance.element,
        options = instance.options,
        state = instance.state,
        columns = element.find("thead > tr > th"),
        css = options.css,
        tpl = options.templates;

    $.each(state.columns, function(index, column)
    {
        if (column.sortable)
        {
            var sort = state.sort[column.id],
                iconCss = css.icon + 
                    ((sort && sort === "asc") ? " " + css.iconDown : 
                        (sort && sort === "desc") ? " " + css.iconUp : "");
            columns.eq(index).addClass(css.sortable).append(" " + tpl.icon.resolve({ css: iconCss }))
                .on("click." + namespace, function(e)
                {
                    e.preventDefault();
                    var $this = $(this), 
                        $sort = state.sort[column.id],
                        $icon = $this.find("." + css.icon);

                    if (!options.multiSort)
                    {
                        columns.find("." + css.icon).removeClass(css.iconDown + " " + css.iconUp);
                        state.sort = {};
                    }

                    if ($sort && $sort === "asc")
                    {
                        state.sort[column.id] = "desc";
                        $icon.removeClass(css.iconDown).addClass(css.iconUp);
                    }
                    else if ($sort && $sort === "desc")
                    {
                        delete state.sort[column.id];
                        $icon.removeClass(css.iconUp);
                    }
                    else
                    {
                        state.sort[column.id] = "asc";
                        $icon.addClass(css.iconDown);
                    }

                    loadData(instance);
                });
        }
    });
}

function showLoading(instance)
{
    $(window).on("resize." + namespace, function ()
    {
        var element = instance.element,
            offset = element.offset();
        instance.loading.css("left", offset.left).css("top", offset.top)
            .height(element.height()).width(element.width());
    }).resize();
    instance.loading.fadeIn(300);
}