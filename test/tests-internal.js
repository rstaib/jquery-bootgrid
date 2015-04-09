/*jshint -W024 */
/*jshint -W117 */

module("internal functions", {
    setup: function ()
    {
        $("#qunit-fixture").html("<table id=\"test\"><thead><tr><th data-column-id=\"id\"></th></tr></thead><tfoot><tr><td></td></tr></tfoot></table>");
    },
    teardown: function ()
    {
        $("#qunit-fixture").empty();
    }
});

test("findFooterAndHeaderItems test", 1, function ()
{
    // given
    var instance = {
        footer: $("#test > tfoot"),
        header: $("#test > thead")
    };
    var selector = "tr";

    // when
    var result = findFooterAndHeaderItems.call(instance, selector);

    // then
    equal(result.length, 2, "Found two elements as expected");
});

test("findFooterAndHeaderItems test (footer is null)", 1, function ()
{
    // given
    var instance = {
        footer: null,
        header: $("#test > thead")
    };
    var selector = "tr";

    // when
    var result = findFooterAndHeaderItems.call(instance, selector);

    // then
    equal(result.length, 1, "Found one element as expected");
});

test("findFooterAndHeaderItems test (header is null)", 1, function ()
{
    // given
    var instance = {
        footer: $("#test > tfoot"),
        header: null
    };
    var selector = "tr";

    // when
    var result = findFooterAndHeaderItems.call(instance, selector);

    // then
    equal(result.length, 1, "Found one element as expected");
});

test("findFooterAndHeaderItems test (footer and header is string empty)", 2, function ()
{
    // given
    var instance = {
        footer: "",
        header: ""
    };
    var selector = "tr";

    // when
    var result = findFooterAndHeaderItems.call(instance, selector);

    // then
    equal(result.length, 0, "Foundd one element as expecte");
    ok(result.find, "Got an empty jQuery array as expected");
});

test("findFooterAndHeaderItems test (footer and header is null)", 2, function ()
{
    // given
    var instance = {
        footer: null,
        header: null
    };
    var selector = "tr";

    // when
    var result = findFooterAndHeaderItems.call(instance, selector);

    // then
    equal(result.length, 0, "Found no elements as expected");
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
            sortDictionary: [],
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
            sortDictionary: [],
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
