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

function init(element, options, state)
{
    loadColumns(element, options, state);
    render(element, options, state);
    // todo: support static data (no ajax)
    loadData(element, options, state);
}

function loadColumns(element, options, state)
{
    var firstHeadRow = element.find("thead > tr").first(),
        sorted = false;
    firstHeadRow.children().each(function()
    {
        var $this = $(this),
            order = $this.data("order"),
            sortable = $this.data("sortable"),
            column = {
                id: $this.data("column-id"),
                order: (!sorted && (order === "asc" || order === "desc")) ? order : null,
                sortable: !(sortable === false ||  sortable === 0)
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

function loadData(element, options, state)
{
    var request = getRequest(options, state),
        url = getUrl(options);
    if (url == null || typeof url !== "string" || url.length === 0)
    {
        throw new Error("Url setting must be a none empty string or a function that returns one.");
    }
    options.events.loading();
    // todo: show loading modal
    $.post(url, request, function (response)
    {
        state.current = response.current;
        state.total = response.total;
        state.totalPages = Math.round(state.total / state.rowCount);

        renderBody(element, options, state, response.rows);
        renderPagination(element, options, state);
        options.events.loaded();
        // todo: hide loading modal
    });
}

function render(element, options, state)
{
    var css = options.css,
        tpl = options.templates,
        header = $(tpl.div.format(getHeaderId(element), css.header)),
        footer = $(tpl.div.format(getFooterId(element), css.footer));

    element.addClass(css.table).before(header).after(footer);
    renderTableHeader(element, options, state);
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
                tr.append(tpl.cell.format(row[column.id]));
            });
            tbody.append(tr);
        });
    }
    else
    {
        tbody.append(tpl.noResults.format(state.columns.length, labels.noResults));
    }
}

function renderPagination(element, options, state)
{
    var css = options.css,
        tpl = options.templates,
        current = state.current,
        totalPages = state.totalPages,
        list = $(tpl.list.format(css.pagination)),
        offsetRight = totalPages - current,
        offsetLeft = (options.padding - current) * -1,
        startWith = ((offsetRight >= options.padding) ? 
            Math.max(offsetLeft, 1) : 
            Math.max((offsetLeft - options.padding + offsetRight), 1)),
        maxCount = options.padding * 2 + 1,
        count = (totalPages >= maxCount) ? maxCount : totalPages;

    renderPaginationItem(element, options, state, list, "first", "&laquo;", "first")
        ._bgEnableAria(current > 1);
    renderPaginationItem(element, options, state, list, "prev", "&lt;", "prev")
        ._bgEnableAria(current > 1);

    for (var i = 0; i < count; i++)
    {
        var pos = i + startWith;
        renderPaginationItem(element, options, state, list, pos, pos, "page-" + pos)
            ._bgEnableAria()._bgSelectAria(pos === current);
    }

    renderPaginationItem(element, options, state, list, "next", "&gt;", "next")
        ._bgEnableAria(totalPages > current);
    renderPaginationItem(element, options, state, list, "last", "&raquo;", "last")
        ._bgEnableAria(totalPages > current);

    $("#" + getFooterId(element)).empty().append(list);
    if (options.topPagination)
    {
        $("#" + getHeaderId(element)).empty().append(list.clone(true));
    }
}

function renderPaginationItem(element, options, state, list, uri, text, css)
{
    var tpl = options.templates,
        anchor = $(tpl.anchor.format("#" + uri, text))
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
                    // todo: support static data (no ajax)
                    loadData(element, options, state);
                }
            }),
        listItem = $(tpl.listItem).addClass(css).append(anchor);

    list.append(listItem);
    return listItem;
}

function renderTableHeader(element, options, state)
{
    var columns = element.find("thead > tr > th"),
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
            columns.eq(index).addClass(css.sortable).append(" " + tpl.icon.format(iconCss))
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

                    // todo: support static data (no ajax)
                    loadData(element, options, state);
                });
        }
    });
}