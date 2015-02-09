/*jshint -W024 */
/*jshint -W117 */

module("internal functions", {
    setup: function ()
    {
        $("#qunit-fixture").html("<table id=\"test\"><thead><th><td data-column-id=\"id\"></td></th></thead></table>");
    },
    teardown: function ()
    {
        $("#qunit-fixture").empty();
    }
});

test("findFooterItem test", 1, function ()
{
    // given
    var instance = {
        footer: $("#test")
    };
    var selector = "thead";

    // when
    var result = findFooterItem.call(instance, selector);

    // then
    equal(result.length, 1, "Found as expected one element");
});

test("findFooterItem test (header is null)", 2, function ()
{
    // given
    var instance = {
        footer: null
    };
    var selector = "b";

    // when
    var result = findFooterItem.call(instance, selector);

    // then
    equal(result.length, 0, "Found as expected one element");
    ok(result.find, "Got an empty jQuery array as expected");
});

test("findFooterItem test (header is string empty)", 2, function ()
{
    // given
    var instance = {
        footer: ""
    };
    var selector = "b";

    // when
    var result = findFooterItem.call(instance, selector);

    // then
    equal(result.length, 0, "Found as expected one element");
    ok(result.find, "Got an empty jQuery array as expected");
});

test("findHeaderItem test", 1, function ()
{
    // given
    var instance = {
        header: $("#test")
    };
    var selector = "thead";

    // when
    var result = findHeaderItem.call(instance, selector);

    // then
    equal(result.length, 1, "Found as expected one element");
});

test("findHeaderItem test (header is null)", 2, function ()
{
    // given
    var instance = {
        header: null
    };
    var selector = "b";

    // when
    var result = findHeaderItem.call(instance, selector);

    // then
    equal(result.length, 0, "Found as expected one element");
    ok(result.find, "Got an empty jQuery array as expected");
});

test("findHeaderItem test (header is string empty)", 2, function ()
{
    // given
    var instance = {
        header: ""
    };
    var selector = "b";

    // when
    var result = findHeaderItem.call(instance, selector);

    // then
    equal(result.length, 0, "Found as expected one element");
    ok(result.find, "Got an empty jQuery array as expected");
});

test("getRequest post function test", 1, function ()
{
    // given
    var instance = {
            options: {
                post: function()
                {
                    return {
                        id: "test"
                    };
                },
                requestHandler: function (request) { return request; }
            },
            current: 1,
            rowCount: 5,
            sort: [],
            searchPhrase: ""
        },
        expected = {
            current: 1,
            id: "test",
            rowCount: 5,
            sort: [],
            searchPhrase: ""
        };

    // when
    var result = getRequest.call(instance);

    // then
    propEqual(result, expected, "Valid request object");
});

test("getRequest post object test", 1, function() {
    // given
    var instance = {
            options: {
                post: {
                    id: "test"
                },
                requestHandler: function (request) { return request; }
            },
            current: 1,
            rowCount: 5,
            sort: [],
            searchPhrase: ""
        },
        expected = {
            current: 1,
            id: "test",
            rowCount: 5,
            sort: [],
            searchPhrase: ""
        };

    // when
    var result = getRequest.call(instance);

    // then
    propEqual(result, expected, "Valid request object");
});

test("getCssSelector test", 1, function ()
{
    // given
    var classNames = "       itallic bold  normal   ";

    // when
    var result = getCssSelector(classNames);

    // then
    equal(result, ".itallic.bold.normal", "Valid css selector");
});

test("getUrl function test", 1, function ()
{
    // given
    var instance = {
        options: {
            url: function()
            {
                return "url/test/1";
            }
        }
    };

    // when
    var result = getUrl.call(instance);

    // then
    equal(result, "url/test/1", "Valid URL");
});

test("getUrl string test", 1, function ()
{
    // given
    var instance = {
        options: {
            url: "url/test/1"
        }
    };

    // when
    var result = getUrl.call(instance);

    // then
    equal(result, "url/test/1", "Valid URL");
});