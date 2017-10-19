# Changelog

## 1.3.1

### Enhancements & Features
- Replaced href attributes in order to prevent hash tags so *angular JS* works proper; see issue [#69](http://github.com/rstaib/jquery-bootgrid/issues/69) for more details

### Breaking Changes
There are no breaking changes but some HTML templates changed during development. In case you want to use the full new feature set be sure you did not override any affected (actionDropDownItem and paginationItem) templates.

## 1.3.0

### Enhancements & Features
- Option to hide column from the selection box; see issue [#62](http://github.com/rstaib/jquery-bootgrid/issues/62) for more details

## 1.2.0

### Enhancements & Features
- Configurable column width; see issue [#22](http://github.com/rstaib/jquery-bootgrid/issues/22) for more details
- Contextual classes to color rows; see issue [#72](http://github.com/rstaib/jquery-bootgrid/issues/72) for more details
- *FontAwesome* iconset overload
- Clear search filter method [#89](http://github.com/rstaib/jquery-bootgrid/issues/89)
- Overridable ajax request settings; see issue [#27](http://github.com/rstaib/jquery-bootgrid/issues/27) for more details
- Adjusting search input field to perform search not on every key [#109](http://github.com/rstaib/jquery-bootgrid/issues/109)
- Public getters for internal variables; see issues [#121](http://github.com/rstaib/jquery-bootgrid/issues/121) and [#116](http://github.com/rstaib/jquery-bootgrid/issues/116) for more details
- Noticeable flicker on any table update [#118](http://github.com/rstaib/jquery-bootgrid/issues/118) (Partially improved by deferring loading mask)

### Bug Fixes
- Fixed bug [#120](http://github.com/rstaib/jquery-bootgrid/issues/120)
- Fixed bug [#58](http://github.com/rstaib/jquery-bootgrid/issues/58) by using the pull request [#65](http://github.com/rstaib/jquery-bootgrid/issues/65)
- Fixing sort method for jQuery plugin [#84](http://github.com/rstaib/jquery-bootgrid/issues/84)

### Breaking Changes
There are no breaking changes but some HTML templates changed during development. In case you want to use the full new feature set be sure you did not override any affected templates.

## 1.1.4

### Enhancements & Features
- Improved Bower and NPM packages
- Added minified version for CSS file

## 1.1.3

### Enhancements & Features
- Improved destroy method behaviour

### Bug Fixes
- Fixed bug [#40](http://github.com/rstaib/jquery-bootgrid/issues/40)

## 1.1.2

### Bug Fixes
- Fixed bug [#32](http://github.com/rstaib/jquery-bootgrid/issues/32)

## 1.1.1

### Bug Fixes
- Fixed issue [#25](http://github.com/rstaib/jquery-bootgrid/issues/25)

## 1.1.0

### Enhancements & Features
- New option to switch the search behaviour from case sensitive to case insensitive.
- Custom CSS classes for header and body cells (solved issue [#7](http://github.com/rstaib/jquery-bootgrid/issues/7))
- New data attribute `data-toggle` to initialize bootgrid without writing any line of code (like bootstrap controls support)
- Request and response handler to support JSON object transformation (solved issue [#3](http://github.com/rstaib/jquery-bootgrid/issues/3))
- WIA-ARIA busy attribute to indicate that the table is loading
- New behaviour to maintain row selection during filtering, paging and sorting
- Entire row click selection
- New row event (`click`)
- Responsive table support
- New methods (`select` and `deselect`)
- New `data-row-id` attribute for data rows (contains the row ID if `identifier` is enabled; otherwise an index of the visible rows)
- New CSS class for data rows to indicate that the row is selected (`selected`)
- New column option `data-searchable="true"` to exclude column from search (solved issue [#23](http://github.com/rstaib/jquery-bootgrid/issues/23))

### Bug Fixes
- Fixed an AJAX issue where multiple fast clicks could lead to strange results
- Fixed multi select issue

### Breaking Changes
There are no breaking changes but some HTML templates changed during development. In case you want to use the full new feature set be sure you did not override any affected templates.

## 1.0.0

### Enhancements & Features
- Public functions for dynamic manipulation such as append and remove row(s)
- Client-side data support (without ajax calls)
- Row selecton (multi and single)
- Show/Hide column headers
- Improved formatters (former know as `data-custom="true"`)
- Added type converters per column (`data-converter="string|numeric|custom"`)
- Added new events (selected, deselected, appended, removed, cleared, initialize, initialized)
- Added column attribute `data-header-align` to set the alignment of the header cell independent from the body cells (solved issue [#10](http://github.com/rstaib/jquery-bootgrid/issues/10))

### Bug Fixes
- Fixed multi sorting issue

### Breaking Changes
- `data-custom` is now `data-formatter` and instead of being a `bool` it is a event name

## 0.9.7

### Bug Fixes
- Fixed a column header visualization bug regarding sorting