// GRID INTERNAL FIELDS
// ====================

var namespace = ".rs.jquery.bootgrid";

// GRID INTERNAL FUNCTIONS
// =====================

function appendRow(row){
  var that = this;

  function exists(item){
    return that.identifier && item[that.identifier] === row[that.identifier];
  }

  if (!this.rows.contains(exists)){
    this.rows.push(row);
    return true;
  }

  return false;
}

function findFooterAndHeaderItems(selector){
  var footer = (this.footer) ? this.footer.find(selector) : $(),
  header = (this.header) ? this.header.find(selector) : $();
  return $.merge(footer, header);
}

function getParams(context){
  return (context) ? $.extend({}, this.cachedParams, { ctx: context }) :
  this.cachedParams;
}

function getRequest(){
  var currentOffset = this.current - 1,
    customFiltersElement = $("[data-bootgrid-id='" + this.element.attr('id') + "']").length ? "[data-bootgrid-id='" + this.element.attr('id') + "'] [name]" : "[data-bootgrid='custom-filters'] [name]",
    post = this.options.post,
    params = {},
    request = {
      _offset: currentOffset * this.rowCount,
      _limit: this.rowCount,
      _order: this.sortDictionary,
      current: this.current,
      rowCount: this.rowCount,
      sort: this.sortDictionary
    };

  post = ($.isFunction(post)) ? post() : post;

  $('input[name=searchPhrase]').add(customFiltersElement).each(function(index, input){
    params[$(input).attr('name').replace('[]', '')] = $(input).val();
  });

  request = $.extend(true, request, params);
  return this.options.requestHandler($.extend(true, request, post));
}

function getCssSelector(css){
  return "." + $.trim(css).replace(/\s+/gm, ".");
}

function getUrl(){
  var url = this.options.url;
  return ($.isFunction(url)) ? url() : url;
}

function init(){
  this.element.trigger("initialize" + namespace);
  loadColumns.call(this); // Loads columns from HTML thead tag
  this.selection = this.options.selection && this.identifier !== null;
  this.rowCount = localStorage.getItem('rowCount[' + this.element.attr('id') + ']') || this.rowCount;
  this.current = parseInt(localStorage.getItem('current[' + this.element.attr('id') + ']')) || 1;
  loadRows.call(this); // Loads rows from HTML tbody tag if ajax is false
  prepareTable.call(this);
  renderTableHeader.call(this);
  renderCustomFilters.call(this);
  renderActions.call(this);
  renderSearchField.call(this);
  loadData.call(this);

  this.element.trigger("initialized" + namespace);
}

function highlightAppendedRows(rows){
  if (this.options.highlightRows){
    // todo: implement
  }
}

function isVisible(column){
  return column.visible;
}

function loadColumns(){
  var that = this,
  firstHeadRow = this.element.find("thead > tr").first(),
  sorted = false;
  /*jshint -W018*/
  firstHeadRow.children().each(function (){
    var $this = $(this),
      data = $this.data(),
      visibilityCache = localStorage.getItem('visibleColumns[' + that.element.attr('id') + '][' + data.columnId + ']'),
      column = {
        id: data.columnId,
        identifier: that.identifier === null && data.identifier || false,
        converter: that.options.converters[data.converter || data.type] || that.options.converters["string"],
        text: $this.text(),
        align: data.align || "left",
        headerAlign: data.headerAlign || "left",
        cssClass: data.cssClass || "",
        headerCssClass: data.headerCssClass || "",
        formatter: that.options.formatters[data.formatter] || null,
        htmlFormatter: data.htmlFormatter || '',
        actionLinks: data.actionLinks,
        order: (!sorted && (data.order === "asc" || data.order === "desc")) ? data.order : null,
        searchable: !(data.searchable === false), // default: true
        sortable: !(data.sortable === false), // default: true
        visible: visibilityCache === null ? !(data.visible === false) : (visibilityCache === 'true'), // default: true
        visibleInSelection: !(data.visibleInSelection === false), // default: true
        width: ($.isNumeric(data.width)) ? data.width + "px" : (typeof(data.width) === "string") ? data.width : null
      };
    that.columns.push(column);
    if (column.order !== null){
      that.sortDictionary[column.id] = column.order;
    }

    // Prevents multiple identifiers
    if (column.identifier){
      that.identifier = column.id;
      that.converter = column.converter;
    }

    // ensures that only the first order will be applied in case of multi sorting is disabled
    if (!that.options.multiSort && column.order !== null){
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

function loadData(){
  var that = this;

  this.element._bgBusyAria(true).trigger("load" + namespace);
  showLoading.call(this);
  function containsPhrase(row){
    var column,
    searchPattern = new RegExp(that.searchPhrase, (that.options.caseSensitive) ? "g" : "gi");

    for (var i = 0; i < that.columns.length; i++){
      column = that.columns[i];
      if (column.searchable && column.visible && column.converter.to(row[column.id]).search(searchPattern) > -1){
        return true;
      }
    }

    return false;
  }

  function update(rows, total){
    that.currentRows = rows;
    setTotals.call(that, total);

    if (!that.options.keepSelection){
      that.selectedRows = [];
    }

    replaceFilterButtonClass.call(that);
    renderRows.call(that, rows);
    updateLinks.call(that);
    renderInfos.call(that);
    renderPagination.call(that);


    that.element._bgBusyAria(false).trigger("loaded" + namespace);
  }

  if (this.options.ajax){
    var request = getRequest.call(this),
    url = getUrl.call(this);

    if (url === null || typeof url !== "string" || url.length === 0){
      throw new Error("Url setting must be a none empty string or a function that returns one.");
    }

    // aborts the previous ajax request if not already finished or failed
    if (this.xqr){
      this.xqr.abort();
    }

    var settings = {
      url: url,
      data: request,
      headers: {
        'Authorization': localStorage.getItem('ajax-authorization')
      },
      success: function(response, textStatus, jqXHR){
        that.xqr = null;

        if (typeof (response) === "string"){
          response = $.parseJSON(response);
        }

        response = that.options.responseHandler(response);
        response.rows = that.options.wrapper !== undefined ? (that.options.wrapper !== '' ? (validObject('response.' + that.options.wrapper) ? eval('response.' + that.options.wrapper) : null) : response) : response.rows
        response.total = response.total !== undefined ? response.total : parseInt(jqXHR.getResponseHeader('Total')) || response.rows.length
        update(response.rows, response.total);
      },
      error: function (jqXHR, textStatus, errorThrown){
        that.xqr = null;

        if (textStatus !== "abort"){
          renderNoResultsRow.call(that); // overrides loading mask
          that.element._bgBusyAria(false).trigger("loaded" + namespace);
        }
      }
    };
    settings = $.extend(this.options.ajaxSettings, settings);
    this.xqr = $.ajax(settings);
  } else {
    var rows = (this.searchPhrase.length > 0) ? this.rows.where(containsPhrase) : this.rows,
    total = rows.length;
    if (this.rowCount !== -1){
      rows = rows.page(this.current, this.rowCount);
    }

    // todo: improve the following comment
    // setTimeout decouples the initialization so that adding event handlers happens before
    window.setTimeout(function () { update(rows, total); }, 10);
  }
}

function validObject(s) {
  var regex = /^[\w$][\w.]+$/g;
  if(!regex.test(s)) {
    throw new Error("Could not get value of " + s);
  }
  return true;
}

function loadRows(){
  if (!this.options.ajax){
    var that = this,
    rows = this.element.find("tbody > tr");

    rows.each(function (){
      var $this = $(this),
      cells = $this.children("td"),
      row = {};

      $.each(that.columns, function (i, column){
        row[column.id] = column.converter.from(cells.eq(i).text());
      });

      appendRow.call(that, row);
    });

    setTotals.call(this, this.rows.length);
    sortRows.call(this);
  }
}

function setTotals(total){
  this.total = total;
  this.totalPages = (this.rowCount === -1) ? 1 :
  Math.ceil(this.total / this.rowCount);
}

function prepareTable(){
  var tpl = this.options.templates,
  wrapper = (this.element.parent().hasClass(this.options.css.responsiveTable)) ?
  this.element.parent() : this.element;

  this.element.addClass(this.options.css.table);

  // checks whether there is an tbody element; otherwise creates one
  if (this.element.children("tbody").length === 0){
    this.element.append(tpl.body);
  }

  if (this.options.navigation & 1){
    this.header = $(tpl.header.resolve(getParams.call(this, { id: this.element._bgId() + "-header" })));
    wrapper.before(this.header);
  }

  if (this.options.navigation & 2){
    this.footer = $(tpl.footer.resolve(getParams.call(this, { id: this.element._bgId() + "-footer" })));
    wrapper.after(this.footer);
  }
}

function renderCustomFilters(){
  var that = this,
    css = that.options.css,
    customFiltersCache = that.element.attr('id') + '-custom-filters',
    customFiltersState = localStorage.getItem(customFiltersCache) || 'hide',
    selector = getCssSelector(css.customFilters);
  if(customFiltersState === 'show'){
    $(selector).show();
  } else {
    $(selector).hide();
  }
}

function renderSearchInformation(){
  var that = this,
  customFiltersElement = $("[data-bootgrid-id='" + that.element.attr('id') + "']").length ? "[data-bootgrid-id='" + that.element.attr('id') + "'] [name]" : "[data-bootgrid='custom-filters'] [name]";
  $('input[name=searchPhrase]').add(customFiltersElement).each(function(index, input){
    var value = localStorage.getItem('custom-filter[' + that.element.attr('id') + '][' + $(input).attr('name').replace('[]', '') + ']');
    $(input).val(value).trigger('change');
  });
}

function clearFilters(){
  var that = this,
  customFiltersElement = $("[data-bootgrid-id='" + that.element.attr('id') + "']").length ? "[data-bootgrid-id='" + that.element.attr('id') + "'] [name]" : "[data-bootgrid='custom-filters'] [name]";
  $('input[name=searchPhrase]').add(customFiltersElement).each(function(index, input){
    var cleanInput = $(input).val('');
    $(input).attr('multiple') && $.isFunction(cleanInput.multiselect) ? cleanInput.multiselect("clearSelection") : cleanInput;
    $(input).hasClass('chosen') ? cleanInput.trigger("chosen:updated") : cleanInput;
    cleanInput.trigger('change')
  });
}

function replaceFilterButtonClass(){
  var that = this,
    state = 'default',
    customFiltersElement = $("[data-bootgrid-id='" + that.element.attr('id') + "']").length ? "[data-bootgrid-id='" + that.element.attr('id') + "'] [name]" : "[data-bootgrid='custom-filters'] [name]";
  $('input[name=searchPhrase]').add(customFiltersElement).each(function(index, input){
    var value = localStorage.getItem('custom-filter[' + that.element.attr('id') + '][' + $(input).attr('name').replace('[]', '') + ']');

    if(value !== null && value !== '' && state === 'default') {
      state = 'warning';
    }
  });
  $('#filter-button,#clear-filter-button').removeClass('btn-default btn-warning').addClass('btn-' + state);
}

function renderActions(){
  if (this.options.navigation !== 0){
    var css = this.options.css,
    selector = getCssSelector(css.actions),
    actionItems = findFooterAndHeaderItems.call(this, selector);

    if (actionItems.length > 0){
      var that = this,
      tpl = this.options.templates,
      actions = $(tpl.actions.resolve(getParams.call(this)));

      // Custom Filters Button
      if ($("[data-bootgrid='custom-filters']").length){
        var filterIcon = tpl.icon.resolve(getParams.call(this, { iconCss: css.iconFilter })),
        customFiltersCache = that.element.attr('id') + '-custom-filters',
        customFiltersState = localStorage.getItem(customFiltersCache) || 'hide',
        selector = getCssSelector(css.customFilters),
        customFiltersElement = $("[data-bootgrid-id='" + that.element.attr('id') + "']").length ? $("[data-bootgrid-id='" + that.element.attr('id') + "']") : $("[data-bootgrid='custom-filters']");

        $(selector).html(customFiltersElement.removeClass('customFilters'));

        var filter = $(tpl.actionButton.resolve(getParams.call(this, { id: 'filter-button', content: filterIcon, text: this.options.labels.filter }))).on("click" + namespace, function (e){
          customFiltersState = customFiltersState === 'show' ? 'hide' : 'show';
          localStorage.setItem(customFiltersCache, customFiltersState);
          renderCustomFilters.call(that);

          e.stopPropagation();

        });
        actions.append(filter);

        var clearfilterIcon = tpl.icon.resolve(getParams.call(this, { iconCss: css.iconClearFilter })),
        selector = getCssSelector(css.clearFilters);

        var clearFilter = $(tpl.actionButton.resolve(getParams.call(this, { id: 'clear-filter-button', content: clearfilterIcon, text: this.options.labels.clearFilter }))).on("click" + namespace, function (e){
          clearFilters.call(that);
          e.stopPropagation();
        });
        actions.append(clearFilter);
      }

      // Refresh Button
      if (this.options.ajax){
        var refreshIcon = tpl.icon.resolve(getParams.call(this, { iconCss: css.iconRefresh })),
        refresh = $(tpl.actionButton.resolve(getParams.call(this, { id: 'refresh-button', content: refreshIcon, text: this.options.labels.refresh }))).on("click" + namespace, function (e){
          // todo: prevent multiple fast clicks (fast click detection)
          e.stopPropagation();
          that.current = 1;
          localStorage.setItem('current[' + that.element.attr('id') + ']', that.current);
          loadData.call(that);
        });
        actions.append(refresh);
      }
      // Column selection
      renderColumnSelection.call(this, actions);

      // Row count selection
      renderRowCountSelection.call(this, actions);

      replacePlaceHolder.call(this, actionItems, actions);
    }
  }
}

function renderColumnSelection(actions){
  if (this.options.columnSelection && this.columns.length > 1){
    var that = this,
    css = this.options.css,
    tpl = this.options.templates,
    icon = tpl.icon.resolve(getParams.call(this, { iconCss: css.iconColumns })),
    dropDown = $(tpl.actionDropDown.resolve(getParams.call(this, { content: icon }))),
    selector = getCssSelector(css.dropDownItem),
    checkboxSelector = getCssSelector(css.dropDownItemCheckbox),
    itemsSelector = getCssSelector(css.dropDownMenuItems);

    $.each(this.columns, function (i, column){
      if (column.visibleInSelection){
        var item = $(tpl.actionDropDownCheckboxItem.resolve(getParams.call(that, { name: column.id, label: column.text, checked: column.visible }))).on("click" + namespace, selector, function (e){
          e.stopPropagation();

          var $this = $(this),
          checkbox = $this.find(checkboxSelector);
          localStorage.setItem('visibleColumns[' + that.element.attr('id') + '][' + column.id + ']', checkbox.prop("checked"));
          if (!checkbox.prop("disabled")){
            column.visible = localStorage.getItem('visibleColumns[' + that.element.attr('id') + '][' + column.id + ']') === 'true';
            var enable = that.columns.where(isVisible).length > 1;
            $this.parents(itemsSelector).find(selector + ":has(" + checkboxSelector + ":checked)")
            ._bgEnableAria(enable).find(checkboxSelector)._bgEnableField(enable);

            that.element.find("tbody").empty(); // Fixes an column visualization bug
            renderTableHeader.call(that);
            loadData.call(that);
          }
        });
        dropDown.find(getCssSelector(css.dropDownMenuItems)).append(item);
      }
    });
    actions.append(dropDown);
  }
}

function renderInfos(){
  if (this.options.navigation !== 0){
    var selector = getCssSelector(this.options.css.infos),
    infoItems = findFooterAndHeaderItems.call(this, selector);
    if (infoItems.length > 0){
      var end = (this.current * this.rowCount),
      infos = $(this.options.templates.infos.resolve(getParams.call(this, {
        end: (this.total === 0 || end === -1 || end > this.total) ? this.total : end,
        start: (this.total === 0) ? 0 : (end - this.rowCount + 1),
        total: this.total
      })));
      replacePlaceHolder.call(this, infoItems, infos);
    }
  }
}

function renderNoResultsRow(){
  if(this.current > 1) {
    this.current = localStorage.setItem('current[' + this.element.attr('id') + ']', 1);
    loadData.call(this);
  }

  var tbody = this.element.children("tbody").first(),
  tpl = this.options.templates,
  count = this.columns.where(isVisible).length;

  if (this.selection){
    count = count + 1;
  }
  tbody.html(tpl.noResults.resolve(getParams.call(this, { columns: count })));
}

function renderPagination(){
  if (this.options.navigation !== 0){
    var selector = getCssSelector(this.options.css.pagination),
    paginationItems = findFooterAndHeaderItems.call(this, selector)._bgShowAria(this.rowCount !== -1);
    if (this.rowCount !== -1 && paginationItems.length > 0){
      var tpl = this.options.templates,
      current = this.current,
      totalPages = this.totalPages,
      pagination = $(tpl.pagination.resolve(getParams.call(this))),
      offsetRight = totalPages - current,
      offsetLeft = (this.options.padding - current) * -1,
      startWith = ((offsetRight >= this.options.padding) ? Math.max(offsetLeft, 1) : Math.max((offsetLeft - this.options.padding + offsetRight), 1)),
      maxCount = this.options.padding * 2 + 1,
      count = (totalPages >= maxCount) ? maxCount : totalPages;

      renderPaginationItem.call(this, pagination, "first", "&laquo;", "first")
      ._bgEnableAria(current > 1);
      renderPaginationItem.call(this, pagination, "prev", "&lt;", "prev")
      ._bgEnableAria(current > 1);

      for (var i = 0; i < count; i++){
        var pos = i + startWith;
        renderPaginationItem.call(this, pagination, pos, pos, "page-" + pos)
        ._bgEnableAria()._bgSelectAria(pos === current);
      }

      if (count === 0){
        renderPaginationItem.call(this, pagination, 1, 1, "page-" + 1)._bgEnableAria(false)._bgSelectAria();
      }

      renderPaginationItem.call(this, pagination, "next", "&gt;", "next")._bgEnableAria(totalPages > current);
      renderPaginationItem.call(this, pagination, "last", "&raquo;", "last")._bgEnableAria(totalPages > current);

      replacePlaceHolder.call(this, paginationItems, pagination);
    }
  }
}

function renderPaginationItem(list, page, text, markerCss){
  var that = this,
  tpl = this.options.templates,
  css = this.options.css,
  values = getParams.call(this, { css: markerCss, text: text, page: page }),
  item = $(tpl.paginationItem.resolve(values)).on("click" + namespace, getCssSelector(css.paginationButton), function (e){
    e.stopPropagation();
    e.preventDefault();

    var $this = $(this),
    parent = $this.parent();
    if (!parent.hasClass("active") && !parent.hasClass("disabled")){
      var commandList = {
        first: 1,
        prev: that.current - 1,
        next: that.current + 1,
        last: that.totalPages
      };
      var command = $this.data("page");
      that.current = commandList[command] || (command > that.totalPages ? that.totalPages : command);
      localStorage.setItem('current[' + that.element.attr('id') + ']', that.current);
      loadData.call(that);
    }
    $this.trigger("blur");
  });

  list.append(item);
  return item;
}

function renderRowCountSelection(actions){
  var that = this,
  rowCountList = this.options.rowCount;

  function getText(value){
    return (value === -1) ? that.options.labels.all : value;
  }

  if ($.isArray(rowCountList)){
    var css = this.options.css,
    tpl = this.options.templates,
    dropDown = $(tpl.actionDropDown.resolve(getParams.call(this, { content: getText(this.rowCount) }))),
    menuSelector = getCssSelector(css.dropDownMenu),
    menuTextSelector = getCssSelector(css.dropDownMenuText),
    menuItemsSelector = getCssSelector(css.dropDownMenuItems),
    menuItemSelector = getCssSelector(css.dropDownItemButton);

    $.each(rowCountList, function (index, value){
      var item = $(tpl.actionDropDownItem.resolve(getParams.call(that, { text: getText(value), action: value })))._bgSelectAria(value === that.rowCount).on("click" + namespace, menuItemSelector, function (e){
        e.preventDefault();

        var $this = $(this),
        newRowCount = $this.data("action");
        localStorage.setItem('rowCount[' + that.element.attr('id') + ']', newRowCount);
        if (newRowCount !== that.rowCount){
          // todo: sophisticated solution needed for calculating which page is selected
          that.current = 1; // that.rowCount === -1 ---> All
          localStorage.setItem('current[' + that.element.attr('id') + ']', that.current);
          that.rowCount = newRowCount;
          $this.parents(menuItemsSelector).children().each(function (){
            var $item = $(this),
            currentRowCount = $item.find(menuItemSelector).data("action");
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

function renderRows(rows){
  if (rows.length > 0){
    var that = this,
    css = this.options.css,
    tpl = this.options.templates,
    tbody = this.element.children("tbody").first(),
    allRowsSelected = true,
    html = "";

    $.each(rows, function (index, row){
      var cells = "",
      rowAttr = " data-row-id=\"" + ((that.identifier === null) ? index : row[that.identifier]) + "\"",
      rowCss = "";

      if (that.selection){
        var selected = ($.inArray(row[that.identifier], that.selectedRows) !== -1),
        selectBox = tpl.select.resolve(getParams.call(that, { type: "checkbox", value: row[that.identifier], checked: selected }));
        cells += tpl.cell.resolve(getParams.call(that, { content: selectBox, css: css.selectCell }));
        allRowsSelected = (allRowsSelected && selected);
        if (selected){
          rowCss += css.selected;
          rowAttr += " aria-selected=\"true\"";
        }
      }

      var status = row.status !== null && that.options.statusMapping[row.status];
      if (status){
        rowCss += status;
      }

      $.each(that.columns, function (j, column){
        if (column.visible){
          var value = ($.isFunction(column.formatter)) ?
            column.formatter.call(that, column, row) :
            (column.htmlFormatter === undefined || column.htmlFormatter === '' ?
              (column.actionLinks === undefined || column.actionLinks === '' ?
                (validObject('row.' + column.id) ? column.converter.to(eval('row.' + column.id)) : null) :
              renderActionLinks.call(that, row, column)) :
            renderHtmlFormatter.call(that, row, column)),
          cssClass = (column.cssClass.length > 0) ? " " + column.cssClass : "";
          cells += tpl.cell.resolve(getParams.call(that, {
            content: (value === null || value === "") ?  "&nbsp;" : value,
            css: ((column.align === "right") ? css.right : (column.align === "center") ?
              css.center : css.left) + cssClass,
            style: (column.width === null) ? "" : "width:" + column.width + ";" }));
        }
      });

      if (rowCss.length > 0){
        rowAttr += " class=\"" + rowCss + "\"";
      }
      html += tpl.row.resolve(getParams.call(that, { attr: rowAttr, cells: cells }));
      appendRow.call(that, row);
    });

    // sets or clears multi selectbox state
    that.element.find("thead " + getCssSelector(that.options.css.selectBox)).prop("checked", allRowsSelected);

    tbody.html(html);

    registerRowEvents.call(this, tbody);
  } else {
    renderNoResultsRow.call(this);
  }
}

function updateLinks(rows){
  var elements = $("#" + this.element.attr('id') + " a[data-remote], #" + this.element.attr('id') + " a[data-confirm]");
  $.each(elements, function(index, data) {
    var href = $(this).attr("href"),
      $this = $(this),
      method = $(this).data("method") || "get";

    $this.attr("href", "javascript:void(0)");

    $(data).click(function(){
      if ($this.data("confirm") !== undefined){
        if (confirm($(this).data("confirm"))) {
          $.ajax(href, { method: method });
        }
      } else {
        $.ajax(href, { method: method });
      }
    });
  });
}

function renderHtmlFormatter(row, column){
  if(!$('div[data-html-formatter-id="' + column.htmlFormatter + '"]').length){
    return ''
  }

  var reg = new RegExp(/\{.*?\}/g),
    regVar = new RegExp(/bootgridExecute\[.*?\]/g),
    html = $('div[data-html-formatter-id="' + column.htmlFormatter + '"]').prop('innerHTML'),
    matches = html.match(reg);

  $.each(matches, function(j, variable) {
    html = html.replace(variable, (validObject('row.' + variable.replace(/{|}/g, '')) ? eval('row.' + variable.replace(/{|}/g, '')) : null));
  });

  var varMatches = html.match(regVar);

  $.each(varMatches, function(j, variable) {
    html = html.replace(variable, eval(variable.replace(/bootgridExecute\[|\]/g, '')));
  });

  return html;
}

function renderActionLinks(row, column){
  if(!$('div[data-action-links-id="' + column.actionLinks + '"]').length){
    return ''
  }

  var that = this,
    css = this.options.css,
    tpl = this.options.templates,
    identifier = row[that.identifier],
    dropDown = $(tpl.actionLinksDropDown.resolve(getParams.call(that, { content: '', dropDownId: 'dropDown-' + identifier })));

  $('[data-action-links-id="' + column.actionLinks + '"] a').each(function(i, link) {
    var reg = new RegExp(/\{.*?\}/g);
    var matches = link.outerHTML.match(reg);
    $.each(matches, function(j, variable) {
      link = $(link).prop('outerHTML').replace(variable, (validObject('row.' + variable.replace(/{|}/g, '')) ? eval('row.' + variable.replace(/{|}/g, '')) : null));
    });
    var item = '<li>' + $(link).prop('outerHTML') + '</li>';
    dropDown.find(getCssSelector(css.dropDownActionLinksItems)).append(item);
  });
  return dropDown.prop('outerHTML');
}

function registerRowEvents(tbody){
  var that = this,
  selectBoxSelector = getCssSelector(this.options.css.selectBox);

  if (this.selection){
    tbody.off("click" + namespace, selectBoxSelector).on("click" + namespace, selectBoxSelector, function(e){
      e.stopPropagation();

      var $this = $(this),
      id = that.converter.from($this.val());

      if ($this.prop("checked")){
        that.select([id]);
      } else {
        that.deselect([id]);
      }
    });
  }

  tbody.off("click" + namespace, "> tr").on("click" + namespace, "> tr", function(e){
    e.stopPropagation();

    var $this = $(this),
    id = (that.identifier === null) ? $this.data("row-id") :
    that.converter.from($this.data("row-id") + ""),
    row = (that.identifier === null) ? that.currentRows[id] :
    that.currentRows.first(function (item) { return item[that.identifier] === id; });

    if (that.selection && that.options.rowSelect){
      if ($this.hasClass(that.options.css.selected)){
        that.deselect([id]);
      } else {
        that.select([id]);
      }
    }

    that.element.trigger("click" + namespace, [that.columns, row]);
  });
}

function renderSearchField(){
  if (this.options.navigation !== 0){
    var css = this.options.css,
      selector = getCssSelector(css.search),
      searchItems = findFooterAndHeaderItems.call(this, selector);

    if (searchItems.length > 0){
      var that = this,
        tpl = this.options.templates,
        timer = null, // fast keyup detection
        currentValue = {},
        btnNewElement = $('div[data-bootgrid-buttons-id=' + that.element.attr('id') + ']'),
        btnNewContent = btnNewElement.length ? btnNewElement.html() : '',
        search = $(tpl.search.resolve(getParams.call(this, { btnNew: "<div class='col-xs-12 col-sm-12 col-md-6 col-lg-6'>" + btnNewContent + '</div>' }))),
        searchFieldSelector = getCssSelector(css.searchField),
        customFiltersElement = $("[data-bootgrid-id='" + that.element.attr('id') + "']").length ? "[data-bootgrid-id='" + that.element.attr('id') + "'] [name]" : "[data-bootgrid='custom-filters'] [name]",
        searchField = (search.is(searchFieldSelector)) ? search : search.find(searchFieldSelector).add(customFiltersElement);

      $('div[data-bootgrid-buttons-id=' + that.element.attr('id') + ']').remove();

      searchField.on("keyup" + namespace + " change" + namespace, function (e){
        e.stopPropagation();
        var newValue = {},
          inputName = $(this).attr('name').replace('[]', '');

        newValue[inputName] = $(this).val() || '';
        currentValue[inputName] = localStorage.getItem('custom-filter[' + that.element.attr('id') + '][' + inputName + ']') || '';
        if (currentValue[inputName] !== newValue[inputName] || (e.which === 13 && newValue[inputName] !== ""))
        {
          currentValue[inputName] = newValue[inputName] || '';
          if(inputName == 'searchPhrase'){
            that.searchPhrase = currentValue[inputName];
          }
          localStorage.setItem('custom-filter[' + that.element.attr('id') + '][' + inputName + ']', currentValue[inputName]);

          if (e.which === 13 || newValue[inputName].length === 0 || newValue[inputName].length >= that.options.searchSettings.characters)
          {
            window.clearTimeout(timer);
            timer = window.setTimeout(function ()
            {
              executeSearch.call(that, newValue[inputName]);
            }, that.options.searchSettings.delay);
          }
        }
      });

      replacePlaceHolder.call(this, searchItems, search);
      renderSearchInformation.call(that);
    }
  }
}

function executeSearch(phrase){
  this.current = 1;
  localStorage.setItem('current[' + this.element.attr('id') + ']', this.current);
  loadData.call(this);
}

function renderTableHeader(){
  var that = this,
  headerRow = this.element.find("thead > tr"),
  css = this.options.css,
  tpl = this.options.templates,
  html = "",
  sorting = this.options.sorting;

  if (this.selection){
    var selectBox = (this.options.multiSelect) ?
    tpl.select.resolve(getParams.call(that, { type: "checkbox", value: "all" })) : "";
    html += tpl.rawHeaderCell.resolve(getParams.call(that, { content: selectBox,
      css: css.selectCell }));
  }

  $.each(this.columns, function (index, column){
    if (column.visible){
      var sortOrder = that.sortDictionary[column.id],
      iconCss = ((sorting && sortOrder && sortOrder === "asc") ? css.iconUp :
        (sorting && sortOrder && sortOrder === "desc") ? css.iconDown : ""),
      icon = tpl.icon.resolve(getParams.call(that, { iconCss: iconCss })),
      align = column.headerAlign,
      cssClass = (column.headerCssClass.length > 0) ? " " + column.headerCssClass : "";
      html += tpl.headerCell.resolve(getParams.call(that, {
        column: column, icon: icon, sortable: sorting && column.sortable && css.sortable || "",
        css: ((align === "right") ? css.right : (align === "center") ?
          css.center : css.left) + cssClass,
        style: (column.width === null) ? "" : "width:" + column.width + ";" }));
    }
  });

  headerRow.html(html);

  if (sorting){
    var sortingSelector = getCssSelector(css.sortable);
    headerRow.off("click" + namespace, sortingSelector).on("click" + namespace, sortingSelector, function (e){
      e.preventDefault();

      setTableHeaderSortDirection.call(that, $(this));
      sortRows.call(that);
      loadData.call(that);
    });
  }

  // todo: create a own function for that piece of code
  if (this.selection && this.options.multiSelect){
    var selectBoxSelector = getCssSelector(css.selectBox);
    headerRow.off("click" + namespace, selectBoxSelector).on("click" + namespace, selectBoxSelector, function(e){
      e.stopPropagation();

      if ($(this).prop("checked")){
        that.select();
      } else {
        that.deselect();
      }
    });
  }
}

function setTableHeaderSortDirection(element){
  var css = this.options.css,
  iconSelector = getCssSelector(css.icon),
  columnId = element.data("column-id") || element.parents("th").first().data("column-id"),
  sortOrder = this.sortDictionary[columnId],
  icon = element.find(iconSelector);

  if (!this.options.multiSort){
    element.parents("tr").first().find(iconSelector).removeClass(css.iconDown + " " + css.iconUp);
    this.sortDictionary = {};
  }

  if (sortOrder && sortOrder === "asc"){
    this.sortDictionary[columnId] = "desc";
    icon.removeClass(css.iconUp).addClass(css.iconDown);
  } else if (sortOrder && sortOrder === "desc"){
    if (this.options.multiSort){
      var newSort = {};
      for (var key in this.sortDictionary){
        if (key !== columnId){
          newSort[key] = this.sortDictionary[key];
        }
      }
      this.sortDictionary = newSort;
      icon.removeClass(css.iconDown);
    } else {
      this.sortDictionary[columnId] = "asc";
      icon.removeClass(css.iconDown).addClass(css.iconUp);
    }
  } else {
    this.sortDictionary[columnId] = "asc";
    icon.addClass(css.iconUp);
  }
}

function replacePlaceHolder(placeholder, element){
  placeholder.each(function (index, item){
    // todo: check how append is implemented. Perhaps cloning here is superfluous.
    $(item).before(element.clone(true)).remove();
  });
}

function showLoading(){
  var that = this;

  window.setTimeout(function(){
    if (that.element._bgAria("busy") === "true"){
      var tpl = that.options.templates,
      thead = that.element.children("thead").first(),
      tbody = that.element.children("tbody").first(),
      firstCell = tbody.find("tr > td").first(),
      padding = (that.element.height() - thead.height()) - (firstCell.height() + 20),
      count = that.columns.where(isVisible).length;

      if (that.selection){
        count = count + 1;
      }

      tbody.html(tpl.loading.resolve(getParams.call(that, { columns: count })));
    }
  }, 250);
}

function sortRows(){
  var sortArray = [];

  function sort(x, y, current){
    current = current || 0;
    var next = current + 1,
    item = sortArray[current];

    function sortOrder(value){
      return (item.order === "asc") ? value : value * -1;
    }

    return (x[item.id] > y[item.id]) ? sortOrder(1) :
    (x[item.id] < y[item.id]) ? sortOrder(-1) :
    (sortArray.length > next) ? sort(x, y, next) : 0;
  }

  if (!this.options.ajax){
    var that = this;

    for (var key in this.sortDictionary){
      if (this.options.multiSort || sortArray.length === 0){
        sortArray.push({
          id: key,
          order: this.sortDictionary[key]
        });
      }
    }

    if (sortArray.length > 0){
      this.rows.sort(sort);
    }
  }
}