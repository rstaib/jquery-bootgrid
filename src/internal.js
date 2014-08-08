// GRID INTERNAL FIELDS
// ====================

var namespace = ".rs.jquery.bootgrid";

// GRID INTERNAL FUNCTIONS
// =====================

function appendRow(row)
{
    var that = this;

    function exists(item)
    {
        return that.identifier && item[that.identifier] === row[that.identifier];
    }

    if (!this.rows.contains(exists))
    {
        this.rows.push(row);
        return true;
    }

    return false;
}

function getParams(context)
{
    return (context) ? $.extend({}, this.cachedParams, { ctx: context }) : 
        this.cachedParams;
}

function getRequest()
{
    var request = {
            current: this.current,
            rowCount: this.rowCount,
            sort: this.sort,
            searchPhrase: this.searchPhrase
        },
        post = this.options.post;

    post = ($.isFunction(post)) ? post() : post;
    return $.extend(true, request, post);
}

function getCssSelector(css)
{
    return "." + $.trim(css).replace(/\s+/gm, ".");
}

function getUrl()
{
    var url = this.options.url;
    return ($.isFunction(url)) ? url() : url;
}

function init()
{
    this.element.trigger("initialize" + namespace);

    loadColumns.call(this); // Loads columns from HTML thead tag
    loadRows.call(this); // Loads rows from HTML tbody tag if ajax is false
    prepareTable.call(this);
    renderTableHeader.call(this);
    renderSearchField.call(this);
    renderActions.call(this);
    loadData.call(this);

    this.element.trigger("initialized" + namespace);
}

function highlightAppendedRows(rows)
{
    if (this.options.highlightRows)
    {
        // todo: implement
    }
}

function isVisible(column)
{
    return column.visible;
}

function loadColumns()
{
    var that = this,
        firstHeadRow = this.element.find("thead > tr").first(),
        sorted = false;

    /*jshint -W018*/
    firstHeadRow.children().each(function ()
    {
        var $this = $(this),
            data = $this.data(),
            column = {
                id: data.columnId,
                identifier: that.identifier == null && data.identifier || false,
                type: that.options.converters[data.type] && data.type || "string",
                text: $this.text(),
                align: data.align || "left",
                formatter: that.options.formatters[data.formatter] || null,
                order: (!sorted && (data.order === "asc" || data.order === "desc")) ? data.order : null,
                sortable: !(data.sortable === false), // default: true
                visible: !(data.visible === false), // default: true
                hdrClass: data.hdrClass || "",
                rowClass: data.rowClass || ""
            };
        that.columns.push(column);
        if (column.order != null)
        {
            that.sort[column.id] = column.order;
        }

        // Prevents multiple identifiers
        if (column.identifier)
        {
            that.identifier = column.id;
        }

        // ensures that only the first order will be applied in case of multi sorting is disabled
        if (!that.options.multiSort && column.order !== null)
        {
            sorted = true;
        }
    });
    /*jshint +W018*/
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

function loadData()
{
    var that = this,
        request = getRequest.call(this),
        url = getUrl.call(this);

    if (this.options.ajax && (url == null || typeof url !== "string" || url.length === 0))
    {
        throw new Error("Url setting must be a none empty string or a function that returns one.");
    }

    this.element.trigger("load" + namespace);
    showLoading.call(this);

    function containsPhrase(row)
    {
        var column;

        for (var i = 0; i < that.columns.length; i++)
        {
            column = that.columns[i];

            if (column.visible && that.options.converters[column.type]
                .to(row[column.id]).indexOf(that.searchPhrase) > -1)
            {
                return true;
            }
        }

        return false;
    }

    function update(rows, total)
    {
        that.currentRows = rows;
        that.total = total;
        that.totalPages = Math.ceil(total / that.rowCount);

        // clear multi selectbox state
        that.element.find("thead " + getCssSelector(that.options.css.selectBox)).prop("checked", false);

        renderRows.call(that, rows);
        renderInfos.call(that);
        renderPagination.call(that);

        that.element.trigger("loaded" + namespace);
    }

    if (this.options.ajax)
    {
        $.post(url, request, function (response)
        {
            if (typeof (response) === "string")
            {
                response = $.parseJSON(response);
            }

            that.current = response.current;

            update(response.rows, response.total);
        }).fail(function ()
        {
            // overrides loading mask
            renderNoResultsRow.call(that);
            that.element.trigger("loaded" + namespace);
        });
    }
    else
    {
        var rows = (this.searchPhrase.length > 0) ? this.rows.where(containsPhrase) : this.rows,
            total = rows.length;
        if (this.rowCount !== -1)
        {
            rows = rows.page(this.current, this.rowCount);
        }

        update(rows, total);
    }
}

function loadRows()
{
    if (!this.options.ajax)
    {
        var that = this,
            rows = this.element.find("tbody > tr");

        rows.each(function ()
        {
            var $this = $(this),
                cells = $this.children("td"),
                row = {};

            $.each(that.columns, function (i, column)
            {
                row[column.id] = that.options.converters[column.type].from(cells.eq(i).text());
            });

            appendRow.call(that, row);
        });

        this.total = this.rows.length;
        this.totalPages = (this.rowCount === -1) ? 1 :
            Math.ceil(this.total / this.rowCount);

        sortRows.call(this);
    }
}

function prepareTable()
{
    var tpl = this.options.templates;

    this.element.addClass(this.options.css.table);

    // checks whether there is an tbody element; otherwise creates one
    if (this.element.children("tbody").length === 0)
    {
        this.element.append(tpl.body);
    }

    if (this.options.navigation & 1)
    {
        this.header = $(tpl.header.resolve(getParams.call(this, { id: this.element._bgId() + "-header" })));
        this.element.before(this.header);
    }

    if (this.options.navigation & 2)
    {
        this.footer = $(tpl.footer.resolve(getParams.call(this, { id: this.element._bgId() + "-footer" })));
        this.element.after(this.footer);
    }
}

function renderActions()
{
    if (this.options.navigation !== 0)
    {
        var css = this.options.css,
            selector = getCssSelector(css.actions),
            headerActions = this.header.find(selector),
            footerActions = this.footer.find(selector);

        if ((headerActions.length + footerActions.length) > 0)
        {
            var that = this,
                tpl = this.options.templates,
                actions = $(tpl.actions.resolve(getParams.call(this)));

            // Refresh Button
            if (this.options.ajax)
            {
                var refreshIcon = tpl.icon.resolve(getParams.call(this, { iconCss: css.iconRefresh })),
                    refresh = $(tpl.actionButton.resolve(getParams.call(this,
                    { content: refreshIcon, text: this.options.labels.refresh })))
                        .on("click" + namespace, function (e)
                        {
                            // todo: prevent multiple fast clicks (fast click detection)
                            e.stopPropagation();
                            that.current = 1;
                            loadData.call(that);
                        });
                actions.append(refresh);
            }

            // Row count selection
            renderRowCountSelection.call(this, actions);

            // Column selection
            renderColumnSelection.call(this, actions);

            replacePlaceHolder.call(this, headerActions, actions, 1);
            replacePlaceHolder.call(this, footerActions, actions, 2);
        }
    }
}

function renderColumnSelection(actions)
{
    if (this.options.columnSelection && this.columns.length > 1)
    {
        var that = this,
            css = this.options.css,
            tpl = this.options.templates,
            icon = tpl.icon.resolve(getParams.call(this, { iconCss: css.iconColumns })),
            dropDown = $(tpl.actionDropDown.resolve(getParams.call(this, { content: icon }))),
            selector = getCssSelector(css.dropDownItem),
            checkboxSelector = getCssSelector(css.dropDownItemCheckbox),
            itemsSelector = getCssSelector(css.dropDownMenuItems);

        $.each(this.columns, function (i, column)
        {
            var item = $(tpl.actionDropDownCheckboxItem.resolve(getParams.call(that,
                { name: column.id, label: column.text, checked: column.visible })))
                    .on("click" + namespace, selector, function (e)
                    {
                        e.stopPropagation();

                        var $this = $(this),
                            checkbox = $this.find(checkboxSelector);
                        if (!checkbox.prop("disabled"))
                        {
                            column.visible = checkbox.prop("checked");
                            var enable = that.columns.where(isVisible).length > 1;
                            $this.parents(itemsSelector).find(selector + ":has(" + checkboxSelector + ":checked)")
                                ._bgEnableAria(enable).find(checkboxSelector)._bgEnableField(enable);

                            that.element.find("tbody").empty(); // Fixes an column visualization bug
                            renderTableHeader.call(that);
                            loadData.call(that);
                        }
                    });
            dropDown.find(getCssSelector(css.dropDownMenuItems)).append(item);
        });
        actions.append(dropDown);
    }
}

function renderInfos()
{
    if (this.options.navigation !== 0)
    {
        var selector = getCssSelector(this.options.css.infos),
            headerInfos = this.header.find(selector),
            footerInfos = this.footer.find(selector);

        if ((headerInfos.length + footerInfos.length) > 0)
        {
            var end = (this.current * this.rowCount),
                infos = $(this.options.templates.infos.resolve(getParams.call(this, {
                    end: (this.total === 0 || end === -1 || end > this.total) ? this.total : end,
                    start: (this.total === 0) ? 0 : (end - this.rowCount + 1),
                    total: this.total
                })));

            replacePlaceHolder.call(this, headerInfos, infos, 1);
            replacePlaceHolder.call(this, footerInfos, infos, 2);
        }
    }
}

function renderNoResultsRow()
{
    var tbody = this.element.children("tbody").first(),
        tpl = this.options.templates,
        count = this.columns.where(isVisible).length;

    if (this.options.selection && this.identifier != null)
    {
        count = count + 1;
    }
    tbody.html(tpl.noResults.resolve(getParams.call(this, { columns: count })));
}

function renderPagination()
{
    if (this.options.navigation !== 0)
    {
        var selector = getCssSelector(this.options.css.pagination),
            headerPagination = this.header.find(selector)._bgShowAria(this.rowCount !== -1),
            footerPagination = this.footer.find(selector)._bgShowAria(this.rowCount !== -1);

        if (this.rowCount !== -1 && (headerPagination.length + footerPagination.length) > 0)
        {
            var tpl = this.options.templates,
                current = this.current,
                totalPages = this.totalPages,
                pagination = $(tpl.pagination.resolve(getParams.call(this))),
                offsetRight = totalPages - current,
                offsetLeft = (this.options.padding - current) * -1,
                startWith = ((offsetRight >= this.options.padding) ?
                    Math.max(offsetLeft, 1) :
                    Math.max((offsetLeft - this.options.padding + offsetRight), 1)),
                maxCount = this.options.padding * 2 + 1,
                count = (totalPages >= maxCount) ? maxCount : totalPages;

            renderPaginationItem.call(this, pagination, "first", "&laquo;", "first")
                ._bgEnableAria(current > 1);
            renderPaginationItem.call(this, pagination, "prev", "&lt;", "prev")
                ._bgEnableAria(current > 1);

            for (var i = 0; i < count; i++)
            {
                var pos = i + startWith;
                renderPaginationItem.call(this, pagination, pos, pos, "page-" + pos)
                    ._bgEnableAria()._bgSelectAria(pos === current);
            }

            if (count === 0)
            {
                renderPaginationItem.call(this, pagination, 1, 1, "page-" + 1)
                    ._bgEnableAria(false)._bgSelectAria();
            }

            renderPaginationItem.call(this, pagination, "next", "&gt;", "next")
                ._bgEnableAria(totalPages > current);
            renderPaginationItem.call(this, pagination, "last", "&raquo;", "last")
                ._bgEnableAria(totalPages > current);

            replacePlaceHolder.call(this, headerPagination, pagination, 1);
            replacePlaceHolder.call(this, footerPagination, pagination, 2);
        }
    }
}

function renderPaginationItem(list, uri, text, markerCss)
{
    var that = this,
        tpl = this.options.templates,
        css = this.options.css,
        values = getParams.call(this, { css: markerCss, text: text, uri: "#" + uri }),
        item = $(tpl.paginationItem.resolve(values))
            .on("click" + namespace, getCssSelector(css.paginationButton), function (e)
            {
                e.stopPropagation();

                var $this = $(this),
                    parent = $this.parent();
                if (!parent.hasClass("active") && !parent.hasClass("disabled"))
                {
                    var commandList = {
                        first: 1,
                        prev: that.current - 1,
                        next: that.current + 1,
                        last: that.totalPages
                    };
                    var command = $this.attr("href").substr(1);
                    that.current = commandList[command] || +command; // + converts string to int
                    loadData.call(that);
                }
                $this.trigger("blur");
            });

    list.append(item);
    return item;
}

function renderRowCountSelection(actions)
{
    var that = this,
        rowCountList = this.options.rowCount;

    function getText(value)
    {
        return (value === -1) ? that.options.labels.all : value;
    }

    if ($.isArray(rowCountList))
    {
        var css = this.options.css,
            tpl = this.options.templates,
            dropDown = $(tpl.actionDropDown.resolve(getParams.call(this, { content: this.rowCount }))),
            menuSelector = getCssSelector(css.dropDownMenu),
            menuTextSelector = getCssSelector(css.dropDownMenuText),
            menuItemsSelector = getCssSelector(css.dropDownMenuItems),
            menuItemSelector = getCssSelector(css.dropDownItemButton);

        $.each(rowCountList, function (index, value)
        {
            var item = $(tpl.actionDropDownItem.resolve(getParams.call(that,
                { text: getText(value), uri: "#" + value })))
                    ._bgSelectAria(value === that.rowCount)
                    .on("click" + namespace, menuItemSelector, function (e)
                    {
                        e.preventDefault();

                        var $this = $(this),
                            newRowCount = +$this.attr("href").substr(1);
                        if (newRowCount !== that.rowCount)
                        {
                            // todo: sophisticated solution needed for calculating which page is selected
                            that.current = 1; // that.rowCount === -1 ---> All
                            that.rowCount = newRowCount;
                            $this.parents(menuItemsSelector).children().each(function ()
                            {
                                var $item = $(this),
                                    currentRowCount = +$item.find(menuItemSelector).attr("href").substr(1);
                                $item._bgSelectAria(currentRowCount === newRowCount);
                            });
                            $this.parents(menuSelector).find(menuTextSelector).text(getText(newRowCount));
                            loadData.call(that);
                        }
                    });
            dropDown.find(menuItemsSelector).append(item);
        });
        actions.append(dropDown);
    }
}

function renderRows(rows)
{
    if (rows.length > 0)
    {
        var that = this,
            css = this.options.css,
            tpl = this.options.templates,
            tbody = this.element.children("tbody").first(),
            selection = that.options.selection && that.identifier != null,
            html = "",
            cells = "";

        $.each(rows, function (i, row)
        {
            cells = "";

            if (selection)
            {
                var selectBox = tpl.select.resolve(getParams.call(that, 
                    { type: "checkbox", value: row[that.identifier] }));
                cells += tpl.cell.resolve(getParams.call(that, { content: selectBox, 
                    css: css.selectCell,
                    class: "" }));
            }

            $.each(that.columns, function (j, column)
            {
                if (column.visible)
                {
                    var value = ($.isFunction(column.formatter)) ?
                        column.formatter.call(that, column, row) :
                            that.options.converters[column.type].to(row[column.id]);
                    cells += tpl.cell.resolve(getParams.call(that, {
                        content: (value == null || value === "") ? "&nbsp;" : value,
                        css: (column.align === "right") ? css.right : 
                             (column.align === "center") ? css.center : css.left,
                        class: column.rowClass }));
                }
            });

            html += tpl.row.resolve(getParams.call(that, { cells: cells }));
        });

        tbody.html(html);

        if (selection)
        {
            var selectBoxSelector = getCssSelector(css.selectBox);
            tbody.off("click" + namespace, selectBoxSelector)
                .on("click" + namespace, selectBoxSelector, function(e)
                {
                    e.stopPropagation();

                    var $this = $(this),
                        converter = that.options.converters[that.columns.first(function (column) { return column.id === that.identifier; }).type],
                        id = converter.from($this.val()),
                        multiSelectBox = that.element.find("thead " + selectBoxSelector),
                        rows = that.currentRows.where(function (row) { return row[that.identifier] === id; });

                    if ($this.prop("checked"))
                    {
                        that.selectedRows.push(id);
                        if (that.selectedRows.length === that.currentRows.length)
                        {
                            multiSelectBox.prop("checked", true);
                        }
                        that.element.trigger("selected" + namespace, [rows]);
                    }
                    else
                    {
                        for (var i = 0; i < that.selectedRows.length; i++)
                        {
                            if (that.selectedRows[i] === id)
                            {
                                that.selectedRows.splice(i, 1);
                                break;
                            }
                        }
                        multiSelectBox.prop("checked", false);
                        that.element.trigger("deselected" + namespace, [rows]);
                    }
                });
        }
    }
    else
    {
        renderNoResultsRow.call(this);
    }
}

function renderSearchField()
{
    if (this.options.navigation !== 0)
    {
        var css = this.options.css,
            selector = getCssSelector(css.search),
            headerSearch = this.header.find(selector),
            footerSearch = this.footer.find(selector);

        if ((headerSearch.length + footerSearch.length) > 0)
        {
            var that = this,
                tpl = this.options.templates,
                timer = null, // fast keyup detection
                currentValue = "",
                searchFieldSelector = getCssSelector(css.searchField),
                search = $(tpl.search.resolve(getParams.call(this))),
                searchField = (search.is(searchFieldSelector)) ? search :
                    search.find(searchFieldSelector);

            searchField.on("keyup" + namespace, function (e)
            {
                e.stopPropagation();
                var newValue = $(this).val();
                if (currentValue !== newValue)
                {
                    currentValue = newValue;
                    window.clearTimeout(timer);
                    timer = window.setTimeout(function ()
                    {
                        that.search(newValue);
                    }, 250);
                }
            });

            replacePlaceHolder.call(this, headerSearch, search, 1);
            replacePlaceHolder.call(this, footerSearch, search, 2);
        }
    }
}

function renderTableHeader()
{
    var that = this,
        headerRow = this.element.find("thead > tr"),
        css = this.options.css,
        tpl = this.options.templates,
        html = "",
        sorting = this.options.sorting,
        selection = this.options.selection && this.identifier != null;

    if (selection)
    {
        var selectBox = (this.options.multiSelect) ? 
            tpl.select.resolve(getParams.call(that, { type: "checkbox", value: "all" })) : "";
        html += tpl.rawHeaderCell.resolve(getParams.call(that, { content: selectBox, 
            css: css.selectCell }));
    }

    $.each(this.columns, function (index, column)
    {
        if (column.visible)
        {
            var sortOrder = that.sort[column.id],
                iconCss = ((sorting && sortOrder && sortOrder === "asc") ? css.iconUp :
                    (sorting && sortOrder && sortOrder === "desc") ? css.iconDown : ""),
                icon = tpl.icon.resolve(getParams.call(that, { iconCss: iconCss }));
            html += tpl.headerCell.resolve(getParams.call(that,
                { column: column, icon: icon, sortable: sorting && column.sortable && css.sortable || "" }));
        }
    });

    headerRow.html(html);

    // todo: create a own function for that piece of code
    if (sorting)
    {
        var sortingSelector = getCssSelector(css.sortable),
            iconSelector = getCssSelector(css.icon);
        headerRow.off("click" + namespace, sortingSelector)
            .on("click" + namespace, sortingSelector, function (e)
            {
                e.preventDefault();
                var $this = $(this),
                    columnId = $this.data("column-id") || $this.parents("th").first().data("column-id"),
                    sortOrder = that.sort[columnId],
                    icon = $this.find(iconSelector);

                if (!that.options.multiSort)
                {
                    $this.parents("tr").first().find(iconSelector).removeClass(css.iconDown + " " + css.iconUp);
                    that.sort = {};
                }

                if (sortOrder && sortOrder === "asc")
                {
                    that.sort[columnId] = "desc";
                    icon.removeClass(css.iconUp).addClass(css.iconDown);
                }
                else if (sortOrder && sortOrder === "desc")
                {
                    if (that.options.multiSort)
                    {
                        var newSort = {};
                        for (var key in that.sort)
                        {
                            if (key !== columnId)
                            {
                                newSort[key] = that.sort[key];
                            }
                        }
                        that.sort = newSort;
                        icon.removeClass(css.iconDown);
                    }
                    else
                    {
                        that.sort[columnId] = "asc";
                        icon.removeClass(css.iconDown).addClass(css.iconUp);
                    }
                }
                else
                {
                    that.sort[columnId] = "asc";
                    icon.addClass(css.iconUp);
                }

                sortRows.call(that);
                loadData.call(that);
            });
    }

    function filterRows(rows, id)
    {
        return rows.where(function (row) { return row[that.identifier] !== id; });
    }

    // todo: create a own function for that piece of code
    if (selection && this.options.multiSelect)
    {
        var selectBoxSelector = getCssSelector(css.selectBox);
        headerRow.off("click" + namespace, selectBoxSelector)
            .on("click" + namespace, selectBoxSelector, function(e)
            {
                e.stopPropagation();

                var rowSelectBoxes = $(that.element.find("tbody " + selectBoxSelector));

                if ($(this).prop("checked"))
                {
                    var filteredRows = $.extend([], that.currentRows),
                        id,
                        i;

                    for (i = 0; i < that.selectedRows.length; i++)
                    {
                        filteredRows = filterRows(filteredRows, that.selectedRows[i]);
                    }
                    
                    for (i = 0; i < filteredRows.length; i++)
                    {
                        that.selectedRows.push(filteredRows[i][that.identifier]);
                    }

                    rowSelectBoxes.prop("checked", true);
                    that.element.trigger("selected" + namespace, [filteredRows]);
                }
                else
                {
                    that.selectedRows = [];
                    rowSelectBoxes.prop("checked", false);
                    that.element.trigger("deselected" + namespace, [that.currentRows]);
                }
            });
    }
}

function replacePlaceHolder(placeholder, element, flag)
{
    if (this.options.navigation & flag)
    {
        placeholder.each(function (index, item)
        {
            // todo: check how append is implemented. Perhaps cloning here is superfluous.
            $(item).before(element.clone(true)).remove();
        });
    }
}

function showLoading()
{
    var tpl = this.options.templates,
        thead = this.element.children("thead").first(),
        tbody = this.element.children("tbody").first(),
        firstCell = tbody.find("tr > td").first(),
        padding = (this.element.height() - thead.height()) - (firstCell.height() + 20),
        count = this.columns.where(isVisible).length;

    if (this.options.selection && this.identifier != null)
    {
        count = count + 1;
    }
    tbody.html(tpl.loading.resolve(getParams.call(this, { columns: count })));
    if (this.rowCount !== -1 && padding > 0)
    {
        tbody.find("tr > td").css("padding", "20px 0 " + padding + "px");
    }
}

function sortRows()
{
    var sortArray = [];

    function sort(x, y, current)
    {
        current = current || 0;
        var next = current + 1,
            item = sortArray[current];

        function sortOrder(value)
        {
            return (item.order === "asc") ? value : value * -1;
        }

        return (x[item.id] > y[item.id]) ? sortOrder(1) :
            (x[item.id] < y[item.id]) ? sortOrder(-1) :
                (sortArray.length > next) ? sort(x, y, next) : 0;
    }

    if (!this.options.ajax)
    {
        var that = this;

        for (var key in this.sort)
        {
            if (this.options.multiSort || sortArray.length === 0)
            {
                sortArray.push({
                    id: key,
                    order: this.sort[key]
                });
            }
        }

        if (sortArray.length > 0)
        {
            this.rows.sort(sort);
        }
    }
}