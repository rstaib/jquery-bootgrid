jQuery Bootgrid Plugin [![Build Status](http://img.shields.io/travis/rstaib/jquery-bootgrid/master.svg?style=flat-square)](https://travis-ci.org/rstaib/jquery-bootgrid) ![Bower version](http://img.shields.io/bower/v/jquery.bootgrid.svg?style=flat-square) ![NuGet version](http://img.shields.io/nuget/v/jquery.bootgrid.svg?style=flat-square) ![NPM version](http://img.shields.io/npm/v/jquery-bootgrid.svg?style=flat-square)
============

Nice, sleek and intuitive. A grid control especially designed for bootstrap.

## Getting Started

**jQuery Bootgrid** is a UI component written for **jQuery** and **Bootstrap** (Bootstrap isn't necessarily required).

Everything you need to start quickly is:

1. Include **jQuery**, **jQuery Bootgrid** and **Bootstrap** libraries in your HTML code.
2. Define your table layout and your data columns by adding the `data-column-id` attribute.
3. Specify your data URL used to fill your data table and set ajax option to `true` directly on your table via data API.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>jQuery Bootgrid Demo</title>
    <link href="bootstrap.css" rel="stylesheet" />
    <link href="fontawesome.css" rel="stylesheet">
    <link href="jquery.bootgrid.css" rel="stylesheet" />
  </head>
  <body>
    <div class="container-fluid">
      <table id="grid" data-toggle="bootgrid" data-url="data.json" data-ajax="true" data-wrapper="" class="table">
        <thead>
          <tr>
            <th data-column-id="actions" data-width="50"></th>
            <th data-column-id="id" data-identifier="true" data-type="numeric">ID</th>
            <th data-column-id="sender.email">Sender</th>
            <th data-column-id="received">Received</th>
          </tr>
        </thead>
      </table>
    </div>

    <script src="jquery.js"></script>
    <script src="bootstrap.js"></script>
    <script src="jquery.bootgrid.js"></script>
  </body>
</html>
```

### New features

Set Authorization header to ajax response
```html
localStorage.setItem("ajax-authorization", "my-api-authorization");
```

Replace default row wrapper from ajax response by changing wrapper option.
<code>data-wrapper=""</code> indicates that json rows will be in root directory.

Add action links to your table adding a action-links option like this:

```html
<th data-column-id="actions" data-width="50" data-action-links="myActionLinks"></th>
```
and this column will call a referenced div with the same action links id like this one:

```html
<div data-action-links-id="myActionLinks">
  <a href="link_to_view/{id}">View {sender.email}</a>
  <a href="link_to_edit/{id}">Edit {sender.email}</a>
</div>
```

Add a html formatter by adding the html-formatter option to your column like this:
```html
<th data-column-id="sender.email" data-html-formatter="myHtmlFormatter">Sender</th>
```
and this column will call a referenced div with the same html formatter. You can also execute javascript wrapped in <code>bootgridExecute[javascript code here]</code> like this:
```html
<div data-html-formatter-id="myHtmlFormatter">
  <span class="label label-bootgridExecute['{sender.email}' == 'sender4@test.de' ? 'success' : 'warning']">{sender.email}</span>
</div>
```

Everything inside a div with bootgrid-buttons-id option will be placed in the header row, example:
```html
<div data-bootgrid-buttons-id="grid">
  <a href="link_to_new" class="btn btn-info">New</a>
</div>
```

Add advanced filters by adding a div with options data-bootgrid="custom-filters" and bootgrid-id referencing the table id, example:
```html
<div data-bootgrid="custom-filters" data-bootgrid-id='grid' class="custom-filters">
  <div class="row">
    <div class="col-sm-1">
      <input type="text" id="id" name="id" class="form-control" placeholder="ID">
    </div>
  </div>
</div>
```

> For more information [check the documentation](http://www.jquery-bootgrid.com/Documentation).

### Examples

Examples you find [here](http://www.jquery-bootgrid.com/Examples).

## Reporting an Issue

Instructions will follow soon!

## Asking questions

I'm always happy to help answer your questions. The best way to get quick answers is to go to [stackoverflow.com](http://stackoverflow.com) and tag your questions always with **jquery-bootgrid**.

## Contributing

Instructions will follow soon!

## License

Copyright (c) 2014-2015 Rafael J. Staib Licensed under the [MIT license](https://github.com/rstaib/jquery-bootgrid/blob/master/LICENSE.txt).
