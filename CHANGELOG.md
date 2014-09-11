# Changelog

## 1.1.0

### Enhancements & Features
- (Done) New option to switch the search behaviour from case sensitive to case insensitive.
- Individual column filters
- (Done) Custom CSS classes for header and body cells (solved issue [#7](http://github.com/rstaib/jquery-bootgrid/issues/7))
- (Done) New data attribute `data-toggle` to initialize bootgrid without writing any line of code (like bootstrap controls support)
- (Done) Request and response handler to support JSON object transformation (solved issue [#3](http://github.com/rstaib/jquery-bootgrid/issues/3))
- (Done) WIA-ARIA busy attribute to indicate that the table is loading
- (Done) New behaviour to maintain row selection during filtering, paging and sorting
- (Done) Entire row click selection
- (Done) New event (`click`)
- (Done) Responsive table support
- (Done) New methods (`select` and `deselect`)
- (Done) New `data-row-id` attribute for data rows (contains the row ID if `identifier` is enabled; otherwise an index of the visible rows)
- (Done) New CSS class for data rows to indicate that the row is selected (`selected`)
- (Done) New column option `data-searchable="true"` to exclude column from search (solved issue [#23](http://github.com/rstaib/jquery-bootgrid/issues/23))

### Bug Fixes
- (Done) Fixed an AJAX issue where multiple fast clicks could lead to strange results
- (Done) Fixed multi select issue

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