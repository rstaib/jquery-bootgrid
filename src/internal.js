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

function findFooterAndHeaderItems(selector)
{
    var footer = (this.footer) ? this.footer.find(selector) : $(),
        header = (this.header) ? this.header.find(selector) : $();
    return $.merge(footer, header);
}

const getParams = (context)=> (context) ? $.extend({}, this.cachedParams, { ctx: context }) : this.cachedParams;

function getRequest()
{
    var request = {
            current: this.current,
            rowCount: this.rowCount,
            sort: this.sortDictionary,
            searchPhrase: this.searchPhrase
        },
        post = this.options.post;

    post = ($.isFunction(post)) ? post() : post;
    return this.options.requestHandler($.extend(true, request, post));
}

const getCssSelector = (css)=> "." + $.trim(css).replace(/\s+/gm, ".");

const getUrl = ()=>{
    const url = this.options.url;
    return ($.isFunction(url)) ? url() : url;
}

function init()
{
    this.element.trigger("initialize" + namespace);

    loadColumns.call(this); // Loads columns from HTML thead tag
    this.selection = this.options.selection && this.identifier != null;
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
const isVisible = (column)=> column.visible;

function loadColumns() {
    const that = this;
    const firstHeadRow = this.element.find("thead > tr").first();

    firstHeadRow.children().each(function () {
        const $this = $(this);
        const data = $this.data();
        const column = {
            id: data.columnId,
            identifier: that.identifier == null && data.identifier || false,
            converter: that.options.converters[data.converter || data.type] || that.options.converters["string"],
            text: $this.text(),
            align: data.align || "left",
            headerAlign: data.headerAlign || "left",
            cssClass: data.cssClass || "",
            headerCssClass: data.headerCssClass || "",
            formatter: that.options.formatters[data.formatter] || null,
            order: data.order != null ? data.order : null,
            searchable: data.searchable !== false, // default: true
            sortable: data.sortable !== false, // default: true
            visible: data.visible !== false, // default: true
            visibleInSelection: data.visibleInSelection !== false, // default: true
            width: data.width || null
        };
        that.columns.push(column);

        // Prevents multiple identifiers
        if (column.identifier) {
            that.identifier = column.id;
            that.converter = column.converter;
        }

        // Update the sortDictionary
        if (column.order != null) {
            that.sortDictionary[column.id] = column.order;
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

function loadData() {
    const that = this;
    const options = this.options;
    const searchPhrase = this.searchPhrase;
    const current = this.current;

    this.element._bgBusyAria(true).trigger("load" + namespace);
    showLoading.call(this);

    function containsPhrase(row) {
        const columns = that.columns;
        const searchPattern = new RegExp(searchPhrase, options.caseSensitive ? "g" : "gi");

        for (let i = 0; i < columns.length; i++) {
            const column = columns[i];
            if (column.searchable && column.visible &&
                column.converter.to(row[column.id]).search(searchPattern) > -1) {
                return true;
            }
        }

        return false;
    }

    function update(rows, total) {
        that.currentRows = rows;
        setTotals.call(that, total);

        if (!options.keepSelection) {
            that.selectedRows = [];
        }

        renderRows.call(that, rows);
        renderInfos.call(that);
        renderPagination.call(that);

        that.element._bgBusyAria(false).trigger("loaded" + namespace);
    }

    if (options.ajax) {
        const request = getRequest.call(this);
        const url = getUrl.call(this);

        if (!url || typeof url !== "string" || url.length === 0) {
            throw new Error("Url setting must be a non-empty string or a function that returns one.");
        }

        // aborts the previous ajax request if not already finished or failed
        if (this.xqr) {
            this.xqr.abort();
        }

        const ajaxSettings = $.extend({}, options.ajaxSettings, {
            url: url,
            data: request,
            success: function (response) {
                that.xqr = null;

                if (typeof response === "string") {
                    response = $.parseJSON(response);
                }

                response = options.responseHandler(response);

                that.current = response.current;
                update(response.rows, response.total);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                that.xqr = null;

                if (textStatus !== "abort") {
                    renderNoResultsRow.call(that); // overrides loading mask
                    that.element._bgBusyAria(false).trigger("loaded" + namespace);
                }
            }
        });

        this.xqr = $.ajax(ajaxSettings);
    } else {
        let rows = this.rows;
        let total = rows.length;

        if (searchPhrase.length > 0) {
            rows = rows.where(containsPhrase);
            total = rows.length;
        }

        if (this.rowCount !== -1) {
            rows = rows.page(current, this.rowCount);
        }

        // setTimeout decouples the initialization so that adding event handlers happens before
        setTimeout(function () { update(rows, total); }, 10);
    }
}


function loadRows() {
    if (!this.options.ajax) {
        const that = this;
        const rows = this.element.find("tbody > tr");
        const rowsData = rows.map(function () {
            const cells = $(this).children("td");
            const row = {};

            that.columns.forEach(function (column, i) {
                row[column.id] = column.converter.from(cells.eq(i).text());
            });

            return row;
        }).get();

        rowsData.forEach(function (row) {
            appendRow.call(that, row);
        });

        setTotals.call(this, this.rows.length);
        sortRows.call(this);
    }
}


function setTotals(total)
{
    this.total = total;
    this.totalPages = (this.rowCount === -1) ? 1 : Math.ceil(this.total / this.rowCount);
}

function prepareTable() {
    const tpl = this.options.templates;
    const wrapper = this.element.parent().hasClass(this.options.css.responsiveTable)
        ? this.element.parent() : this.element;

    this.element.addClass(this.options.css.table);

    // Create tbody element if it doesn't exist
    if (!this.element.children("tbody").length) {
        this.element.append(tpl.body);
    }

    if (this.options.navigation & 1) {
        const headerId = this.element._bgId() + "-header";
        this.header = $(tpl.header.resolve(getParams.call(this, { id: headerId })));
        wrapper.before(this.header);
    }

    if (this.options.navigation & 2) {
        const footerId = this.element._bgId() + "-footer";
        this.footer = $(tpl.footer.resolve(getParams.call(this, { id: footerId })));
        wrapper.after(this.footer);
    }
}


function renderActions() {
    if (this.options.navigation !== 0) {
        const { css, templates, labels, ajax } = this.options;
        const selector = getCssSelector(css.actions);
        const actionItems = findFooterAndHeaderItems.call(this, selector);

        if (actionItems.length > 0) {
            const actions = $(templates.actions.resolve(getParams.call(this)));

            // Refresh Button
            if (ajax) {
                const refreshIcon = $(templates.icon.resolve(getParams.call(this, { iconCss: css.iconRefresh })));
                const refresh = $(templates.actionButton.resolve(getParams.call(this,
                    { content: refreshIcon, text: labels.refresh })))
                    .on("click" + namespace, function (e) {
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

            replacePlaceHolder.call(this, actionItems, actions);
        }
    }
}


function renderColumnSelection(actions) {
    if (this.options.columnSelection && this.columns.length > 1) {
        const { css, templates } = this.options;
        const icon = $(templates.icon.resolve(getParams.call(this, { iconCss: css.iconColumns })));
        const dropDown = $(templates.actionDropDown.resolve(getParams.call(this, { content: icon })));
        const checkboxSelector = getCssSelector(css.dropDownItemCheckbox);

        this.columns.forEach(column => {
            if (column.visibleInSelection) {
                const item = $(`<li class="${css.dropDownItem}">
                                <label class="${css.dropDownItemCheckboxLabel}">
                                    <input type="checkbox" class="${css.dropDownItemCheckbox}" 
                                           name="${column.id}" ${column.visible ? 'checked' : ''}>
                                    ${column.text}
                                </label>
                            </li>`);

                item.on("click" + namespace, checkboxSelector, function (e) {
                    e.stopPropagation();
                    const checkbox = $(this);
                    if (!checkbox.prop("disabled")) {
                        column.visible = checkbox.prop("checked");
                        const enable = that.columns.filter(col => col.visible).length > 1;
                        checkbox.closest(`.${css.dropDownMenuItems}`)
                            .find(checkboxSelector + ":checked").prop("disabled", !enable);

                        that.element.find("tbody").empty(); // Fixes a column visualization bug
                        renderTableHeader.call(that);
                        loadData.call(that);
                    }
                });

                dropDown.find(`.${css.dropDownMenuItems}`).append(item);
            }
        });

        actions.append(dropDown);
    }
}


function renderInfos() {
    if (this.options.navigation !== 0) {
        const selector = getCssSelector(this.options.css.infos);
        const infoItems = findFooterAndHeaderItems.call(this, selector);

        if (infoItems.length > 0) {
            const end = this.total === 0 || this.current * this.rowCount > this.total ? this.total : this.current * this.rowCount;
            const start = this.total === 0 ? 0 : end - this.rowCount + 1;
            const infos = $(this.options.templates.infos.resolve(getParams.call(this, {
                end: end,
                start: start,
                total: this.total
            })));

            replacePlaceHolder.call(this, infoItems, infos);
        }
    }
}


function renderNoResultsRow() {
    const tbody = this.element.children("tbody").first();
    const tpl = this.options.templates;
    const visibleColumns = this.columns.filter(column => column.visible);
    const count = this.selection ? visibleColumns.length + 1 : visibleColumns.length;

    tbody.html(tpl.noResults.resolve(getParams.call(this, { columns: count })));
}


function renderPagination() {
    if (this.options.navigation !== 0 && this.rowCount !== -1) {
        const selector = getCssSelector(this.options.css.pagination);
        const paginationItems = findFooterAndHeaderItems.call(this, selector)._bgShowAria();

        if (paginationItems.length > 0) {
            const tpl = this.options.templates;
            const current = this.current;
            const totalPages = this.totalPages;
            const pagination = $(tpl.pagination.resolve(getParams.call(this)));
            const maxCount = this.options.padding * 2 + 1;
            const count = Math.min(totalPages, maxCount);

            const startWith = Math.max(current - this.options.padding, 1);
            const endWith = Math.min(startWith + maxCount - 1, totalPages);

            renderPaginationItem.call(this, pagination, "first", "&laquo;", "first")
                ._bgEnableAria(current > 1);
            renderPaginationItem.call(this, pagination, "prev", "&lt;", "prev")
                ._bgEnableAria(current > 1);

            for (let pos = startWith; pos <= endWith; pos++) {
                renderPaginationItem.call(this, pagination, pos, pos, "page-" + pos)
                    ._bgSelectAria(pos === current);
            }

            if (count === 0) {
                renderPaginationItem.call(this, pagination, 1, 1, "page-" + 1);
            }

            renderPaginationItem.call(this, pagination, "next", "&gt;", "next")
                ._bgEnableAria(totalPages > current);
            renderPaginationItem.call(this, pagination, "last", "&raquo;", "last")
                ._bgEnableAria(totalPages > current);

            replacePlaceHolder.call(this, paginationItems, pagination);
        }
    }
}


function renderPaginationItem(list, page, text, markerCss) {
    const { templates, css } = this.options;
    const values = getParams.call(this, { css: markerCss, text: text, page: page });
    const item = $(templates.paginationItem.resolve(values));
    const $paginationButton = item.find(getCssSelector(css.paginationButton));

    list.append(item);

    $paginationButton.on("click" + namespace, function (e) {
        e.stopPropagation();
        e.preventDefault();

        const $this = $(this);
        const parent = $this.parent();
        if (!parent.hasClass("active") && !parent.hasClass("disabled")) {
            const commandList = {
                first: 1,
                prev: this.current - 1,
                next: this.current + 1,
                last: this.totalPages
            };
            const command = $this.data("page");
            this.current = commandList[command] || command;
            loadData.call(this);
        }
        $this.trigger("blur");
    }.bind(this));

    return item;
}


function renderRowCountSelection(actions) {
    const { css, templates, rowCount } = this.options;

    function getText(value) {
        return value === -1 ? this.options.labels.all : value;
    }

    if ($.isArray(rowCount)) {
        const dropDown = $(templates.actionDropDown.resolve(getParams.call(this, { content: getText(this.rowCount) })));
        const menuItems = rowCount.map(value => {
            return templates.actionDropDownItem
                .resolve(getParams.call(this, { text: getText(value), action: value }))
                ._bgSelectAria(value === this.rowCount);
        }).join('');

        dropDown.find(getCssSelector(css.dropDownMenuItems)).append(menuItems);

        dropDown.on("click" + namespace, getCssSelector(css.dropDownItemButton), function (e) {
            e.preventDefault();

            const newRowCount = $(this).data("action");
            if (newRowCount !== this.rowCount) {
                this.current = 1; // this.rowCount === -1 ---> All
                this.rowCount = newRowCount;
                const menuItems = dropDown.find(getCssSelector(css.dropDownItemButton));
                menuItems.each(function () {
                    const $item = $(this);
                    const currentRowCount = $item.data("action");
                    $item._bgSelectAria(currentRowCount === newRowCount);
                });

                dropDown.find(getCssSelector(css.dropDownMenuText)).text(getText(newRowCount));

                loadData.call(this);
            }
        }.bind(this));

        actions.append(dropDown);
    }
}

function renderRows(rows) {
    if (rows.length > 0) {
        const { css, templates } = this.options;
        const tbody = this.element.children("tbody").first();
        let html = "";

        function createCell(column, row) {
            if (column.visible) {
                const value = $.isFunction(column.formatter) ? column.formatter.call(this, column, row) : column.converter.to(row[column.id]);
                const cssClass = column.cssClass.length > 0 ? " " + column.cssClass : "";
                const content = value == null || value === "" ? "&nbsp;" : value;
                const cellCss = ((column.align === "right") ? css.right : (column.align === "center") ? css.center : css.left) + cssClass;
                const cellStyle = column.width == null ? "" : "width:" + column.width + ";";
                return templates.cell.resolve(getParams.call(this, { content, css: cellCss, style: cellStyle }));
            }
            return "";
        }

        $.each(rows, function (index, row) {
            let cells = "";
            let rowAttr = " data-row-id=\"" + ((this.identifier == null) ? index : row[this.identifier]) + "\"";
            let rowCss = "";

            if (this.selection) {
                const selected = $.inArray(row[this.identifier], this.selectedRows) !== -1;
                const selectBox = templates.select.resolve(getParams.call(this, { type: "checkbox", value: row[this.identifier], checked: selected }));
                cells += templates.cell.resolve(getParams.call(this, { content: selectBox, css: css.selectCell }));
                if (selected) {
                    rowCss += css.selected;
                    rowAttr += " aria-selected=\"true\"";
                }
            }

            const status = row.status != null && this.options.statusMapping[row.status];
            if (status) {
                rowCss += status;
            }

            cells += this.columns.map(column => createCell.call(this, column, row)).join("");

            if (rowCss.length > 0) {
                rowAttr += " class=\"" + rowCss + "\"";
            }
            html += templates.row.resolve(getParams.call(this, { attr: rowAttr, cells }));
        });

        // sets or clears multi-selectbox state
        this.element.find("thead " + getCssSelector(css.selectBox))
            .prop("checked", rows.length > 0 && rows.every(row => $.inArray(row[this.identifier], this.selectedRows) !== -1));

        tbody.html(html);
        registerRowEvents.call(this, tbody);
    } else {
        renderNoResultsRow.call(this);
    }
}


function registerRowEvents(tbody) {
    const { css, rowSelect } = this.options;
    const selectBoxSelector = getCssSelector(css.selectBox);

    if (this.selection) {
        tbody.off("click" + namespace, selectBoxSelector)
            .on("click" + namespace, selectBoxSelector, function (e) {
                e.stopPropagation();

                const $this = $(this);
                const id = that.converter.from($this.val());
                const isChecked = $this.prop("checked");

                that[isChecked ? "select" : "deselect"]([id]);
            });
    }

    tbody.off("click" + namespace, "> tr")
        .on("click" + namespace, "> tr", function (e) {
            e.stopPropagation();

            const $this = $(this);
            const id = (that.identifier == null) ? $this.data("row-id") : that.converter.from(`${$this.data("row-id")}`);
            const row = (that.identifier == null) ? that.currentRows[id] :
                that.currentRows.first((item) => item[that.identifier] === id);

            if (that.selection && rowSelect) {
                $this.toggleClass(css.selected);
                that[$this.hasClass(css.selected) ? "select" : "deselect"]([id]);
            }

            that.element.trigger("click" + namespace, [that.columns, row]);
        });
}


function renderSearchField() {
    if (this.options.navigation !== 0) {
        const css = this.options.css;
        const selector = getCssSelector(css.search);
        const searchItems = findFooterAndHeaderItems.call(this, selector);

        if (searchItems.length > 0) {
            const tpl = this.options.templates;
            let timer = null; // fast keyup detection
            let currentValue = "";
            const searchFieldSelector = getCssSelector(css.searchField);
            const search = $(tpl.search.resolve(getParams.call(this)));
            const searchField = search.is(searchFieldSelector) ? search : search.find(searchFieldSelector);

            searchField.on("keyup" + namespace, function (e) {
                e.stopPropagation();
                const newValue = $(this).val();
                if (currentValue !== newValue || (e.which === 13 && newValue !== "")) {
                    currentValue = newValue;
                    if (e.which === 13 || newValue.length === 0 || newValue.length >= this.options.searchSettings.characters) {
                        window.clearTimeout(timer);
                        timer = window.setTimeout(() => {
                            executeSearch.call(this, newValue);
                        }, this.options.searchSettings.delay);
                    }
                }
            });

            replacePlaceHolder.call(this, searchItems, search);
        }
    }
}


function executeSearch(phrase){
    if(this.searchPhrase === phrase) return;
        this.current = 1;
        this.searchPhrase = phrase;
        loadData.call(this);
}

function renderTableHeader() {
    const that = this;
    const css = this.options.css;
    const tpl = this.options.templates;
    const headerRow = this.element.find("thead > tr");
    const sorting = this.options.sorting;
    const selectBoxSelector = getCssSelector(css.selectBox);
    const sortingSelector = getCssSelector(css.sortable);

    let html = "";

    function createHeaderCell(column) {
        if (!column.visible) return "";

        const sortOrder = that.sortDictionary[column.id];
        const iconCss = (sorting && sortOrder && sortOrder === "asc") ? css.iconUp :
                        (sorting && sortOrder && sortOrder === "desc") ? css.iconDown : "";
        const icon = tpl.icon.resolve(getParams.call(that, { iconCss }));
        const align = column.headerAlign;
        const cssClass = column.headerCssClass.length > 0 ? " " + column.headerCssClass : "";

        return tpl.headerCell.resolve(getParams.call(that, {
            column: column,
            icon: icon,
            sortable: sorting && column.sortable && css.sortable || "",
            css: ((align === "right") ? css.right : (align === "center") ?
                css.center : css.left) + cssClass,
            style: column.width == null ? "" : "width:" + column.width + ";",
        }));
    }

    if (this.selection) {
        const selectBox = (this.options.multiSelect) ? tpl.select.resolve(getParams.call(that, {
            type: "checkbox",
            value: "all",
        })) : "";

        html += tpl.rawHeaderCell.resolve(getParams.call(that, {
            content: selectBox,
            css: css.selectCell,
        }));
    }

    html += this.columns.filter(column => column.visible).map(createHeaderCell).join("");

    headerRow.html(html);

    attachSortingClickHandler();

    if (this.selection && this.options.multiSelect) {
        attachSelectBoxClickHandler();
    }

    function attachSortingClickHandler() {
        headerRow.off("click" + namespace, sortingSelector)
            .on("click" + namespace, sortingSelector, function (e) {
                e.preventDefault();

                setTableHeaderSortDirection($(this));
                sortRows();
                loadData();
            });
    }

    function attachSelectBoxClickHandler() {
        headerRow.off("click" + namespace, selectBoxSelector)
            .on("click" + namespace, selectBoxSelector, function (e) {
                e.stopPropagation();

                if ($(this).prop("checked")) {
                    that.select();
                } else {
                    that.deselect();
                }
            });
    }
}

function setTableHeaderSortDirection(element) {
    const { css } = this.options;
    const iconSelector = getCssSelector(css.icon);
    const columnId = element.data("column-id") || element.parents("th").first().data("column-id");
    const sortOrder = this.sortDictionary[columnId];
    const icon = element.find(iconSelector);

    if (!this.options.multiSort) {
        element.parents("tr").first().find(iconSelector).removeClass(`${css.iconDown} ${css.iconUp}`);
        this.sortDictionary = {};
    }

    if (sortOrder === "asc") {
        this.sortDictionary[columnId] = "desc";
        icon.removeClass(css.iconUp).addClass(css.iconDown);
    } else if (sortOrder === "desc" && this.options.multiSort) {
        const newSort = {};
        for (const key in this.sortDictionary) {
            if (key !== columnId) {
                newSort[key] = this.sortDictionary[key];
            }
        }
        this.sortDictionary = newSort;
        icon.removeClass(css.iconDown);
    } else {
        this.sortDictionary[columnId] = sortOrder ? "asc" : "asc";
        icon.toggleClass(css.iconUp, !sortOrder).toggleClass(css.iconDown, sortOrder);
    }
}

function replacePlaceHolder(placeholder, element)
{
    placeholder.each(function (index, item)
    {
        // todo: check how append is implemented. Perhaps cloning here is superfluous.
        $(item).before(element.clone(true)).remove();
    });
}

function showLoading() {
    const { element, options } = this;
    const tpl = options.templates;
    const thead = element.children("thead").first();
    const tbody = element.children("tbody").first();
    const firstCell = tbody.find("tr > td").first();
    const isVisible = (col) => col.visible !== false;
    const columnsCount = this.columns.filter(isVisible).length + (this.selection ? 1 : 0);

    window.setTimeout(function () {
        if (element._bgAria("busy") === "true") {
            const padding = element.height() - thead.height() - (firstCell.height() + 20);

            tbody.empty().append(tpl.loading.resolve(getParams.call(this, { columns: columnsCount })));
            if (padding > 0) {
                tbody.find("tr > td").css("padding", `20px 0 ${padding}px`);
            }
        }
    }.bind(this), 250);
}
function sortRows() {
    const sortArray = [];

    function sort(x, y, current = 0) {
        const item = sortArray[current];
        const sortOrder = item.order === "asc" ? 1 : -1;

        if (x[item.id] > y[item.id]) return sortOrder;
        if (x[item.id] < y[item.id]) return -sortOrder;
        return sortArray.length > current + 1 ? sort(x, y, current + 1) : 0;
    }

    if (!this.options.ajax) {
        for (const key in this.sortDictionary) {
            if (this.options.multiSort || sortArray.length === 0) {
                sortArray.push({
                    id: key,
                    order: this.sortDictionary[key],
                });
            }
        }

        if (sortArray.length > 0) {
            this.rows.sort((x, y) => sort(x, y));
        }
    }
}
