/*! 
 * jQuery Bootgrid v1.0.0-beta - 07/23/2014
 * Copyright (c) 2014 Rafael Staib (http://www.jquery-bootgrid.com)
 * Licensed under MIT http://www.opensource.org/licenses/MIT
 */
;(function ($, window, undefined)
{
    /*jshint validthis: true */
    "use strict";

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

    function getParams(context)
    {
        var staticParams = {
            tpl: this.options.templates,
            lbl: this.options.labels,
            css: this.options.css,
            ctx: {}
        };
        return $.extend({}, staticParams, { ctx: context || {} });
    }

    function getRequest()
    {
        var request = {
                current: this.current,
                rowCount: this.rowCount,
                sort: this.sort
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

        loadColumns.call(this);
        prepareTable.call(this);
        renderTableHeader.call(this);
        renderActions.call(this);
        loadData.call(this);

        this.element.trigger("initialized" + namespace);
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

        firstHeadRow.children().each(function()
        {
            var $this = $(this),
                order = $this.data("order"),
                sortable = $this.data("sortable"),
                visible = $this.data("visible"),
                column = {
                    id: $this.data("column-id"),
                    text: $this.text(),
                    formatter: that.options.formatters[$this.data("formatter")],
                    order: (!sorted && (order === "asc" || order === "desc")) ? order : null,
                    sortable: !(sortable === false || sortable === 0), // default: true
                    visible: !(visible === false || visible === 0) // default: true
                };
            that.columns.push(column);
            if (column.order != null)
            {
                that.sort[column.id] = column.order;
            }

            // ensures that only the first order will be applied in case of multi sorting is disabled
            if (!that.options.multiSort && column.order !== null)
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

    function loadData()
    {
        var that = this,
            request = getRequest.call(this),
            url = getUrl.call(this);

        if (url == null || typeof url !== "string" || url.length === 0)
        {
            throw new Error("Url setting must be a none empty string or a function that returns one.");
        }

        this.element.trigger("load" + namespace);
        showLoading.call(this);
        // todo: support static data (no ajax)
        $.post(url, request, function (response)
        {
            if (typeof (response) === "string")
            {
                response = $.parseJSON(response);
            }

            that.rows = response.rows;
            that.current = response.current;
            that.total = response.total;
            that.totalPages = Math.ceil(that.total / that.rowCount);

            renderRows.call(that);
            renderInfos.call(that);
            renderPagination.call(that);
            that.element.trigger("loaded" + namespace);
        }).fail(function()
        {
            // overrides loading mask
            renderNoResultsRow.call(that);
        });
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
                    refresh = $(tpl.actionButton.resolve(getParams.call(this, 
                        { iconCss: css.iconRefresh, text: this.options.labels.refresh })))
                            .on("click" + namespace, function (e)
                            {
                                // todo: prevent multiple fast clicks (fast click detection)
                                e.stopPropagation();
                                that.current = 1;
                                loadData.call(that);
                            }),
                    actions = $(tpl.actions.resolve(getParams.call(this))).append(refresh);

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
        var that = this,
            css = this.options.css,
            tpl = this.options.templates,
            icon = tpl.icon.resolve(getParams.call(this, { iconCss: css.iconColumns })),
            dropDown = $(tpl.actionDropDown.resolve(getParams.call(this, { content: icon }))),
            selector = getCssSelector(css.dropDownItemCheckbox);

        $.each(this.columns, function(i, column)
        {
            var item = $(tpl.actionDropDownCheckboxItem.resolve(getParams.call(that, 
                { name: column.id, label: column.text, checked: column.visible })))
                    .on("click" + namespace, selector, function (e)
                    {
                        e.stopPropagation();
                        column.visible = $(this).find("input").prop("checked");
                        renderTableHeader.call(that);
                        renderRows.call(that);
                    });
            dropDown.find(getCssSelector(css.dropDownMenuItems)).append(item);
        });
        actions.append(dropDown);
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
            tpl = this.options.templates;

        tbody.html(tpl.noResults.resolve(getParams.call(this, { columns: this.columns.where(isVisible).length })));
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
            item = $(tpl.paginationItem.resolve(values)).addClass(css)
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
        if (typeof this.options.rowCount === "object")
        {
            var that = this,
                css = this.options.css,
                tpl = this.options.templates,
                currentKey = getFirstDictionaryItem(this.options.rowCount, this.rowCount).key,
                rowCount = $(tpl.actionDropDown.resolve(getParams.call(this, { content: currentKey })));
            
            $.each(this.options.rowCount, function(key, value)
            {
                var item = $(tpl.actionDropDownItem.resolve(getParams.call(that, { key: key, uri: "#" + value })))
                    ._bgSelectAria(key === currentKey)
                    .on("click" + namespace, getCssSelector(css.dropDownItemButton), function (e)
                    {
                        e.preventDefault();

                        var $this = $(this),
                            currentKey = getFirstDictionaryItem(that.options.rowCount, that.rowCount).key,
                            newKey = $this.text();
                        if (newKey !== currentKey)
                        {
                            // todo: sophisticated solution needed for calculating which page is selected
                            that.current = 1; // that.rowCount === -1 ---> All
                            that.rowCount = +$this.attr("href").substr(1);
                            $this.parents(getCssSelector(css.dropDownMenuItems)).children()
                                .each(function()
                                {
                                    var $item = $(this);
                                    $item._bgSelectAria($item.text() === newKey);
                                });
                            $this.parents(getCssSelector(css.dropDownMenu))
                                .find(getCssSelector(css.dropDownMenuText)).text(newKey);
                            loadData.call(that);
                        }
                    });
                rowCount.find(getCssSelector(css.dropDownMenuItems)).append(item);
            });
            actions.append(rowCount);
        }
    }

    function renderRows()
    {
        if (this.rows.length > 0)
        {
            var that = this,
                tpl = this.options.templates,
                tbody = this.element.children("tbody").first(),
                html = "",
                cells = "";

            $.each(this.rows, function(i, row)
            {
                cells = "";

                $.each(that.columns, function(j, column)
                {
                    if (column.visible)
                    {
                        var value = ($.isFunction(column.formatter)) ? 
                            column.formatter.call(that, column, row) : row[column.id];
                        cells += tpl.cell.resolve(getParams.call(that, { content: 
                            (value == null || value === "") ? "&nbsp;" : value }));
                    }
                });

                html += tpl.row.resolve(getParams.call(that, { cells: cells }));
            });

            tbody.html(html);
        }
        else
        {
            renderNoResultsRow.call(this);
        }
    }

    function renderTableHeader()
    {
        var that = this,
            headerRow = this.element.find("thead > tr"),
            css = this.options.css,
            tpl = this.options.templates,
            html = "";

        $.each(this.columns, function(index, column)
        {
            if (column.visible)
            {
                var sortOrder = that.sort[column.id],
                    iconCss = ((sortOrder && sortOrder === "asc") ? css.iconUp : 
                        (sortOrder && sortOrder === "desc") ? css.iconDown : ""),
                    icon = tpl.icon.resolve(getParams.call(that, { iconCss: iconCss }));
                html += tpl.headerCell.resolve(getParams.call(that, 
                    { content: column.text, icon: icon, columnId: column.id,
                        sortable: (column.sortable) ? css.sortable : "" }));
            }
        });

        headerRow.html(html).off("click" + namespace)
            .on("click" + namespace, getCssSelector(css.sortable), function(e)
            {
                e.preventDefault();
                var $this = $(this),
                    columnId = $this.data("column-id") || $this.parents("th").first().data("column-id"),
                    sortOrder = that.sort[columnId],
                    icon = $this.find(getCssSelector(css.icon));

                if (!that.options.multiSort)
                {
                    $this.parents("tr").first().find(getCssSelector(css.icon)).removeClass(css.iconDown + " " + css.iconUp);
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
                        delete that.sort[columnId];
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

                loadData.call(that);
            });
    }

    function replacePlaceHolder(placeholder, element, flag)
    {
        if (this.options.navigation & flag)
        {
            placeholder.each(function(index, item)
            {
                // todo: check how append is implemented. Perhaps cloning here is superfluous.
                $(item).before(element.clone(true)).remove();
            });
        }
    }

    function showLoading()
    {
        var tpl = this.options.templates,
            tbody = this.element.children("tbody").first(),
            firstCell = tbody.find("tr > td").first(),
            padding = Math.ceil((tbody.height() || 0) - (firstCell.height() + 20));

        tbody.html(tpl.loading.resolve(getParams.call(this, { columns: this.columns.where(isVisible).length })));
        if (this.rowCount !== -1 && padding > 0)
        {
            tbody.find("tr > td").css("padding", "20px 0 " + padding + "px");
        }
    }

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

    // GRID PLUGIN DEFINITION
    // =====================

    var old = $.fn.bootgrid;

    $.fn.bootgrid = function (option)
    {
        return this.each(function ()
        {
            var $this = $(this),
                instance = $this.data(namespace),
                options = typeof option === "object" && option;

            if (!instance && option === "destroy")
            {
                return;
            }
            if (!instance)
            {
                $this.data(namespace, (instance = new Grid(this, options)));
                init.call(instance);
            }
            if (typeof option === "string")
            {
                return instance[option]();
            }
        });
    };

    $.fn.bootgrid.Constructor = Grid;

    // GRID NO CONFLICT
    // ===============

    $.fn.bootgrid.noConflict = function ()
    {
        $.fn.bootgrid = old;
        return this;
    };

    // GRID DATA-API
    // ============

    /*
    $(document).on("click" + namespace + ".data-api", "[data-toggle=\"bootgrid\"]", function(e)
    {
        e.preventDefault();
        $(this).bootgrid("show");
    });
*/

    // GRID COMMON TYPE EXTENSIONS
    // ============

    $.fn.extend({
        _bgAria: function (name, value)
        {
            return this.attr("aria-" + name, value);
        },

        _bgRemoveAria: function (name)
        {
            return this.removeAttr("aria-" + name);
        },

        _bgEnableAria: function (enable)
        {
            return (enable == null || enable) ? 
                this.removeClass("disabled")._bgAria("disabled", "false") : 
                this.addClass("disabled")._bgAria("disabled", "true");
        },

        _bgShowAria: function (show)
        {
            return (show == null || show) ? 
                this.show()._bgAria("hidden", "false") :
                this.hide()._bgAria("hidden", "true");
        },

        _bgSelectAria: function (select)
        {
            return (select == null || select) ? 
                this.addClass("active")._bgAria("selected", "true") : 
                this.removeClass("active")._bgAria("selected", "false");
        },

        _bgId: function (id)
        {
            return (id) ? this.attr("id", id) : this.attr("id");
        }
    });

    if (!String.prototype.resolve)
    {
        var formatter = {
            "checked": function(value)
            {
                if (typeof value === "boolean")
                {
                    return (value) ? "checked=\"checked\"" : "";
                }

                return value;
            }
        };

        String.prototype.resolve = function (substitutes, prefixes)
        {
            var result = this;
            $.each(substitutes, function (key, value)
            {
                if (typeof value === "object")
                {
                    var keys = (prefixes) ? $.extend([], prefixes) : [];
                    keys.push(key);
                    result = result.resolve(value, keys);
                }
                else
                {
                    if ($.isFunction(formatter[key]))
                    {
                        value = formatter[key](value);
                    }
                    key = (prefixes) ? prefixes.join(".") + "." + key : key;
                    var pattern = new RegExp("\\{\\{" + key + "\\}\\}", "gm");
                    result = result.replace(pattern, value);
                }
            });
            return result;
        };
    }

    if (!Array.prototype.where)
    {
        Array.prototype.where = function (predicate)
        {
            var result = [];
            for (var i = 0; i < this.length; i++)
            {
                var item = this[i];
                if (predicate(item))
                {
                    result.push(item);
                }
            }
            return result;
        };
    }
})(jQuery, window);