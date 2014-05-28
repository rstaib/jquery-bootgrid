/*! 
 * jQuery Bootgrid v0.9.6-rc1 - 05/28/2014
 * Copyright (c) 2014 Rafael Staib (http://www.jquery-bootgrid.com)
 * Licensed under MIT http://www.opensource.org/licenses/MIT
 */
;(function ($, window, undefined)
{
    "use strict";

    // GRID INTERNAL FIELDS    
    // ====================    
    
    var namespace = ".rs.jquery.bootgrid",    
        paginationType = {    
            "none": 0,    
            "bottom": 1,    
            "top": 2    
        };    
    
    // GRID INTERNAL FUNCTIONS    
    // =====================    
    
    function getFirstDictionaryValue(dictionary)    
    {    
        if (typeof dictionary === "object")    
        {    
            for (var key in dictionary)    
            {    
                return dictionary[key];    
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
                rowCount: options.rowCount,    
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
        instance.header = $(tpl.header.resolve(getParams(context, { id: element._bgId() + "-header" })));    
        instance.footer = $(tpl.footer.resolve(getParams(context, { id: element._bgId() + "-footer" })));    
        element.addClass(css.table).before(instance.header).after(instance.footer).after(instance.loading);    
    
        renderActions(element, options, context);    
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
                        .one("click" + namespace, function (e)    
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
                    { end: end, start: (end - context.rowCount + 1), total: context.total }))),    
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
                tpl = options.templates,    
                current = context.current,    
                totalPages = context.totalPages,    
                pagination = $(tpl.pagination.resolve(getParams(context))),    
                offsetRight = totalPages - current,    
                offsetLeft = (options.padding - current) * -1,    
                startWith = ((offsetRight >= options.padding) ?    
                    Math.max(offsetLeft, 1) :    
                    Math.max((offsetLeft - options.padding + offsetRight), 1)),    
                maxCount = options.padding * 2 + 1,    
                count = (totalPages >= maxCount) ? maxCount : totalPages,    
                selector = getSelector(options.css.pagination);    
    
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
    
            renderPaginationItem(element, options, context, pagination, "next", "&gt;", "next")    
                ._bgEnableAria(totalPages > current);    
            renderPaginationItem(element, options, context, pagination, "last", "&raquo;", "last")    
                ._bgEnableAria(totalPages > current);    
    
            replacePlaceHolder(options, instance.header.find(selector), pagination, 1);    
            replacePlaceHolder(options, instance.footer.find(selector), pagination, 2);    
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
            rowCount: (typeof rowCount === "object") ? getFirstDictionaryValue(rowCount) : rowCount,    
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
        navigation: 3,          // it's a flag: 0 = none, 1 = top, 2 = bottom, 3 = both (top and bottom)    
        multiSort: false,    
        padding: 2,             // page padding (pagination)    
        post: {},               // or use function () { return {}; }    
        rowCount: {             // rows per page    
            "10": 10,    
            "25": 25,    
            "50": 50,    
            "All": -1    
        },    
        url: "",                // or use function () { return ""; }    
    
        // todo: implement cache    
    
        // note: The following properties are not available via data-api attributes    
        css: {    
            actions: "actions btn-group",        // must be a unique class name or constellation of class names within the header and footer    
            dropDown: "btn dropdown-toggle",    
            footer: "bootgrid-footer container-fluid",    
            icon: "glyphicon",    
            iconDown: "glyphicon-chevron-down",    
            iconRefresh: "glyphicon-refresh",    
            iconUp: "glyphicon-chevron-up",    
            infos: "infos",                      // must be a unique class name or constellation of class names within the header and footer    
            loading: "bootgrid-loading",    
            pagination: "pagination",            // must be a unique class name or constellation of class names within the header and footer    
            paginationButton: "button",          // must be a unique class name or constellation of class names within the pagination    
            header: "bootgrid-header container-fluid",    
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
            actionButton: "<button class=\"btn\" type=\"button\" title=\"{{ctx.text}}\">{{tpl.icon}}</button>",    
            actionDropDown: "<button class=\"btn dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\">{{ctx.text}} <span class=\"caret\"></span></button><ul class=\"dropdown-menu\" role=\"menu\"></ul>",    
            actions: "<div class=\"{{css.actions}}\"></div>",    
            cell: "<td>{{ctx.content}}</td>",    
            header: "<div id=\"{{ctx.id}}\" class=\"{{css.header}}\"><div class=\"row\"><div class=\"col-sm-12 actionBar\"><p class=\"{{css.actions}}\"></p></div></div></div>",    
            footer: "<div id=\"{{ctx.id}}\" class=\"{{css.footer}}\"><div class=\"row\"><div class=\"col-sm-6\"><p class=\"{{css.pagination}}\"></p></div><div class=\"col-sm-6 infoBar\"><p class=\"{{css.infos}}\"></p></div></div></div>",    
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
                init(instance.element, instance.options, instance.context);    
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
                    key = (prefixes) ? prefixes.join(".") + "." + key : key;    
                    var pattern = new RegExp("\\{\\{" + key + "\\}\\}", "gm");    
                    result = result.replace(pattern, value);    
                }    
            });    
            return result;    
        };    
    }
})(jQuery, window);