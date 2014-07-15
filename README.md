jQuery Bootgrid Plugin [![Build Status](https://travis-ci.org/rstaib/jquery-bootgrid.png?branch=master)](https://travis-ci.org/rstaib/jquery-bootgrid)
============

Nice, sleek and intuitive. A grid control especially designed for bootstrap.

## Getting Started

**jQuery Bootgrid** is a UI component written for **jQuery** and **Bootstrap** (Bootstrap isn't necessarily required).

Everything you need to start quickly is:

1. Include **jQuery**, **jQuery Bootgrid** and **Bootstrap** libraries in your HTML code.
2. Define your table layout and your data columns by adding the `data-column-id` attribute.
3. Then select the previously defined `table` element represents your data table and initialize the `bootgrid` plugin.
4. Specify your data url used to fill your data table.

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Demo</title>
        <meta charset="utf-8">
		<!-- Styles -->
		<link href="bootstrap.css" rel="stylesheet">
        <link href="jquery.bootgrid.css" rel="stylesheet">
    </head>
    <body>
        <script>
		    $(function ()
			{
				$("#grid").bootgrid({
    				url: "/api/data/basic"
				});
			});
        </script>
        <table id="grid" class="table table-condensed table-hover table-striped">
            <thead>
                <tr>
                    <th data-column-id="id">ID</th>
                    <th data-column-id="name">Sender</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
		<!-- Scripts -->
        <script src="jquery.js"></script> 
        <script src="jquery.bootgrid.js"></script>
    </body>
</html>
```

> For more information [check the documentation](https://github.com/rstaib/jquery-bootgrid/wiki).

### Examples

Examples you find [here](https://github.com/rstaib/jquery-bootgrid/wiki#demo).

## Reporting an Issue

Instructions will follow soon!

## Asking questions

I'm always happy to help answer your questions. The best way to get quick answers is to go to [stackoverflow.com](http://stackoverflow.com) and tag your questions always with **jquery-bootgrid**.

## Contributing

Instructions will follow soon!

## License

Copyright (c) 2013 Rafael J. Staib Licensed under the [MIT license](https://github.com/rstaib/jquery-bootgrid/blob/master/LICENSE.txt).
