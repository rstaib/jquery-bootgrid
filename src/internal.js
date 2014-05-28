// GRID INTERNAL FIELDS
// ====================

var namespace = ".rs.jquery.bootgrid";

// GRID INTERNAL FUNCTIONS
// =====================

function getFirstDictionaryItem(dictionary, value)
{
    if (typeof dictionary === "object")
    {
        for (var key in dictionary)
        {
            if (value != null)
            {
                if (value === dictionary[key])
                {
                    return { key: key, value: dictionary[key] };
                }
            }
            else
            {
                return { key: key, value: dictionary[key] };
            }
        }
    }

    throw new Error("Is not a dictionary!");
}

function getInstance(element)
{
    return element.data(namespace);
}

function getParams(context, ctx)
{
    return $.extend({}, context.cachedParams, { ctx: ctx || {} });
}

function getRequest(options, context)
{
    var request = {
            current: context.current,
            rowCount: context.rowCount,
            sort: context.sort
        },
        post = options.post;

    post = ($.isFunction(post)) ? post() : post;
    return $.extend(true, request, post);
}

function getSelector(css)
{
    return "." + $.trim(css).replace(/\s+/gm, ".");
}

function getUrl(options)
{
    var url = options.url;
    return ($.isFunction(url)) ? url() : url;
}

function hideLoading(element)
{
    var instance = getInstance(element);
    instance.loading.fadeOut(300);
    $(window).off(namespace);
}

function init(element, options, context)
{
    loadColumns(element, options, context);
    render(element, options, context);
    loadData(element, options, context);
}

function loadColumns(element, options, context)
{
    var firstHeadRow = element.find("thead > tr").first(),
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
        context.columns.push(column);
        if (column.order != null)
        {
            context.sort[column.id] = column.order;
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

function loadData(element, options, context)
{
    var request = getRequest(options, context),
        url = getUrl(options);

    if (url == null || typeof url !== "string" || url.length === 0)
    {
        throw new Error("Url setting must be a none empty string or a function that returns one.");
    }

    element.trigger("load" + namespace);
    showLoading(element);
    // todo: support static data (no ajax)
    $.post(url, request, function (response)
    {
        if (typeof (response) === "string")
        {
            response = $.parseJSON(response);
        }

        context.current = response.current;
        context.total = response.total;
        context.totalPages = Math.ceil(context.total / context.rowCount);

        renderBody(element, options, context, response.rows);
        renderActions(element, options, context);
        renderInfos(element, options, context);
        renderPagination(element, options, context);
        hideLoading(element);
        element.trigger("loaded" + namespace);
    }).fail(function() { hideLoading(element); });
}

function render(element, options, context)
{
    var instance = getInstance(element),
        css = options.css,
        tpl = options.templates;

    instance.loading = $(options.templates.loading.resolve(getParams(context)));
    element.addClass(css.table).after(instance.loading);
    if (options.navigation & 1)
    {
        instance.header = $(tpl.header.resolve(getParams(context, { id: element._bgId() + "-header" })));
        element.before(instance.header);
    }
    if (options.navigation & 2)
    {
        instance.footer = $(tpl.footer.resolve(getParams(context, { id: element._bgId() + "-footer" })));
        element.after(instance.footer);
    }

    renderTableHeader(element, options, context);
}

function renderActions(element, options, context)
{
    if (options.navigation !== 0)
    {
        var instance = getInstance(element),
            css = options.css,
            tpl = options.templates,
            refresh = $(tpl.actionButton.resolve(getParams(context, 
                { iconCss: css.iconRefresh, text: options.labels.refresh })))
                    .on("click" + namespace, function (e)
                    {
                        // todo: prevent multiple fast clicks (fast click detection)
                        e.preventDefault();
                        var $this = $(this);
                        context.current = 1;
                        loadData(element, options, context);
                        $this.trigger("blur");
                    }),
            actions = $(tpl.actions.resolve(getParams(context))).append(refresh),
            selector = getSelector(css.actions);

        if (typeof options.rowCount === "object")
        {
            var currentKey = getFirstDictionaryItem(options.rowCount, context.rowCount).key,
                rowCount = $(tpl.actionDropDown.resolve(getParams(context, { text: currentKey })));
            $.each(options.rowCount, function(key, value)
            {
                var item = $(tpl.actionDropDownItem.resolve(getParams(context, 
                    { buttonCss: css.dropDownItemButton, key: key, uri: "#" + value })))
                    ._bgSelectAria(key === currentKey);
                item.find(getSelector(css.dropDownItemButton)).on("click" + namespace, function (e)
                {
                    e.preventDefault();
                    var $this = $(this);
                    if ($this.text() !== currentKey)
                    {
                        // todo: sophisticated solution needed for calculating which page is selected
                        context.current = 1; // context.rowCount === -1 ---> All
                        context.rowCount = +$this.attr("href").substr(1);
                        loadData(element, options, context);
                    }
                    $this.trigger("blur");
                });
                rowCount.find(getSelector(css.dropDownMenu)).append(item);
            });
            actions.append(rowCount);
        }

        replacePlaceHolder(options, instance.header.find(selector), actions, 1);
        replacePlaceHolder(options, instance.footer.find(selector), actions, 2);
    }
}

function renderBody(element, options, context, rows)
{
    var tpl = options.templates,
        tbody = element.children("tbody").first().empty();

    if (rows.length > 0)
    {
        $.each(rows, function(i, row)
        {
            var tr = $(tpl.row);
            $.each(context.columns, function(j, column)
            {
                if (column.custom)
                {
                    element.trigger("custom" + namespace, {
                        cell: $(tpl.cell.resolve(getParams(context, { content: "&nbsp;" }))).appendTo(tr),
                        column: column,
                        row: row
                    });
                }
                else
                {
                    var value = row[column.id];
                    tr.append(tpl.cell.resolve(getParams(context, { content: (value == null || value === "") ? "&nbsp;" : value })));
                }
            });
            tbody.append(tr);
        });
    }
    else
    {
        tbody.append(tpl.noResults.resolve(getParams(context, { columns: context.columns.length, text: options.labels.noResults })));
    }
}

function renderInfos(element, options, context)
{
    if (options.navigation !== 0)
    {
        var instance = getInstance(element),
            end = (context.current * context.rowCount),
            infos = $(options.templates.infos.resolve(getParams(context, 
                { end: (end > context.total) ? context.total : end, 
                    start: (end - context.rowCount + 1), total: context.total }))),
            selector = getSelector(options.css.infos);

        replacePlaceHolder(options, instance.header.find(selector), infos, 1);
        replacePlaceHolder(options, instance.footer.find(selector), infos, 2);
    }
}

function renderPagination(element, options, context)
{
    if (options.navigation !== 0)
    {
        var instance = getInstance(element),
            selector = getSelector(options.css.pagination),
            header = instance.header.find(selector)._bgShowAria(context.rowCount !== -1),
            footer = instance.footer.find(selector)._bgShowAria(context.rowCount !== -1);

        if (context.rowCount === -1)
        {
            return;
        }

        var tpl = options.templates,
            current = context.current,
            totalPages = context.totalPages,
            pagination = $(tpl.pagination.resolve(getParams(context))),
            offsetRight = totalPages - current,
            offsetLeft = (options.padding - current) * -1,
            startWith = ((offsetRight >= options.padding) ?
                Math.max(offsetLeft, 1) :
                Math.max((offsetLeft - options.padding + offsetRight), 1)),
            maxCount = options.padding * 2 + 1,
            count = (totalPages >= maxCount) ? maxCount : totalPages;

        renderPaginationItem(element, options, context, pagination, "first", "&laquo;", "first")
            ._bgEnableAria(current > 1);
        renderPaginationItem(element, options, context, pagination, "prev", "&lt;", "prev")
            ._bgEnableAria(current > 1);

        for (var i = 0; i < count; i++)
        {
            var pos = i + startWith;
            renderPaginationItem(element, options, context, pagination, pos, pos, "page-" + pos)
                ._bgEnableAria()._bgSelectAria(pos === current);
        }

        if (count === 0)
        {
            renderPaginationItem(element, options, context, pagination, 1, 1, "page-" + 1)
                ._bgEnableAria(false)._bgSelectAria();
        }

        renderPaginationItem(element, options, context, pagination, "next", "&gt;", "next")
            ._bgEnableAria(totalPages > current);
        renderPaginationItem(element, options, context, pagination, "last", "&raquo;", "last")
            ._bgEnableAria(totalPages > current);

        replacePlaceHolder(options, header, pagination, 1);
        replacePlaceHolder(options, footer, pagination, 2);
    }
}

function renderPaginationItem(element, options, context, list, uri, text, markerCss)
{
    var tpl = options.templates,
        css = options.css,
        values = getParams(context, { css: markerCss, text: text, uri: "#" + uri }),
        item = $(tpl.paginationItem.resolve(values)).addClass(css);

    item.find(getSelector(css.paginationButton)).on("click" + namespace, function (e)
    {
        e.preventDefault();
        var $this = $(this),
            parent = $this.parent();
        if (!parent.hasClass("active") && !parent.hasClass("disabled"))
        {
            var commandList = {
                first: 1,
                prev: context.current - 1,
                next: context.current + 1,
                last: context.totalPages
            };
            var command = $this.attr("href").substr(1);
            context.current = commandList[command] || +command; // + converts string to int
            loadData(element, options, context);
        }
        $this.trigger("blur");
    });

    list.append(item);
    return item;
}

function renderTableHeader(element, options, context)
{
    var columns = element.find("thead > tr > th"),
        css = options.css,
        tpl = options.templates;

    $.each(context.columns, function(index, column)
    {
        if (column.sortable)
        {
            var sort = context.sort[column.id],
                iconCss = ((sort && sort === "asc") ? " " + css.iconDown : 
                    (sort && sort === "desc") ? " " + css.iconUp : "");
            columns.eq(index).addClass(css.sortable).append(" " + tpl.icon.resolve(getParams(context, { iconCss: iconCss })))
                .on("click" + namespace, function(e)
                {
                    e.preventDefault();
                    var $this = $(this), 
                        $sort = context.sort[column.id],
                        $icon = $this.find("." + css.icon);

                    if (!options.multiSort)
                    {
                        columns.find("." + css.icon).removeClass(css.iconDown + " " + css.iconUp);
                        context.sort = {};
                    }

                    if ($sort && $sort === "asc")
                    {
                        context.sort[column.id] = "desc";
                        $icon.removeClass(css.iconDown).addClass(css.iconUp);
                    }
                    else if ($sort && $sort === "desc")
                    {
                        if (options.multiSort)
                        {
                            delete context.sort[column.id];
                            $icon.removeClass(css.iconUp);
                        }
                        else
                        {
                            context.sort[column.id] = "asc";
                            $icon.removeClass(css.iconUp).addClass(css.iconDown);
                        }
                    }
                    else
                    {
                        context.sort[column.id] = "asc";
                        $icon.addClass(css.iconDown);
                    }

                    loadData(element, options, context);
                });
        }
    });
}

function replacePlaceHolder(options, placeholder, element, flag)
{
    if (options.navigation & flag)
    {
        placeholder.each(function(index, item)
        {
            // todo: check how append is implemented. Perhaps cloning here is superfluous.
            $(item).before(element.clone(true)).remove();
        });
    }
}

function showLoading(element)
{
    var instance = getInstance(element);
    $(window).on("resize" + namespace, function ()
    {
        var position = element.position();
        instance.loading.css("left", position.left).css("top", position.top)
            .height(element.height()).width(element.width());
    }).resize();
    instance.loading.fadeIn(300);
}