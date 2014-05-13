/*! 
 * jQuery Bootgrid v0.9.5-alpha - 05/13/2014
 * Copyright (c) 2014 Rafael Staib (http://www.jquery-bootgrid.com)
 * Licensed under MIT http://www.opensource.org/licenses/MIT
 */
;(function ($, window, undefined)
{
    "use strict";

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
        $(window).off(namespace);    
    }    
    
    function init(instance)    
    {    
        var options = instance.options;    
        instance.loading = $(options.templates.loading.resolve({    
            css: options.css.loading,     
            text: options.labels.loading    
        })).insertAfter(instance.element);    
    
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
                position = element.position();    
            instance.loading.css("left", position.left).css("top", position.top)    
                .height(element.height()).width(element.width());    
        }).resize();    
        instance.loading.fadeIn(300);    
    }

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
        $(window).off(namespace);    
        this.element.off(namespace).removeData(namespace);    
    };    
    
    Grid.prototype.reload = function()    
    {    
        this.state.current = 1; // reset    
        // todo: support static data (no ajax)    
        loadData(this);    
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

    // GRID PLUGIN DEFINITION    
    // =====================    
    
    var old = $.fn.bootgrid;    
    
    $.fn.bootgrid = function (option)    
    {    
        return this.each(function ()    
        {    
            var $this = $(this),    
                data = $this.data(namespace),    
                options = typeof option === "object" && option;    
    
            if (!data && option === "destroy")    
            {    
                return;    
            }    
            if (!data)    
            {    
                $this.data(namespace, (data = new Grid(this, options)));    
            }    
            if (typeof option === "string")    
            {    
                return data[option]();    
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
    $(document).on("click." + namespace + ".data-api", "[data-toggle=\"bootgrid\"]", function(e)    
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
        String.prototype.resolve = function (substitutes)    
        {    
            var result = this;    
            $.each(substitutes, function (key, value)    
            {    
                var pattern = new RegExp("\\{\\{" + key + "\\}\\}", "gm");    
                result = result.replace(pattern, value);    
            });    
            return result;    
        };    
    }
})(jQuery, window);