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

test("getFirstDictionaryItem test", 1, function ()
{
    // given
    var dictionary = {
        "first": 1,
        "second": 2,
        "third": 3
    };

    // when
    var result = getFirstDictionaryItem(dictionary);

    // then
    propEqual(result, { key: "first", value: 1 }, "Valid dictionary item");
});

test("getFirstDictionaryItem passing wrong type test", 1, function ()
{
    // given
    var number = 1;

    // when
    var errorMessage;
    try
    {
        getFirstDictionaryItem(number);
    }
    catch (e)
    {
        errorMessage = e.message;
    }

    // then
    equal(errorMessage, "Is not a dictionary!", "Invalid call");
});

test("getFirstDictionaryItem by value test", 1, function ()
{
    // given
    var dictionary = {
        "first": 1,
        "second": 2,
        "third": 3
    };

    // when
    var result = getFirstDictionaryItem(dictionary, 2);

    // then
    propEqual(result, { key: "second", value: 2 }, "Valid dictionary item");
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
                }
            },
            current: 1,
            rowCount: 5,
            sort: []
        },
        expected = {
            current: 1,
            id: "test",
            rowCount: 5,
            sort: []
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
                }
            },
            current: 1,
            rowCount: 5,
            sort: []
        },
        expected = {
            current: 1,
            id: "test",
            rowCount: 5,
            sort: []
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