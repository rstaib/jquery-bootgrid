/*jshint -W024 */
/*jshint -W117 */

module("internal functions", {
    setup: function ()
    {
        $("#qunit-fixture").append($("<table id=\"test\"><thead><th><td data-column-id=\"id\"></td></th></thead></table>"));
    },
    teardown: function ()
    {
        $("#test").remove();
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

test("getInstance test", 1, function ()
{
    // given
    var element = $("#test").data(namespace, true);

    // when
    var result = getInstance(element);

    // then
    ok(result, "Valid instance");
});

test("getRequest post function test", 1, function ()
{
    // given
    var options = {
            post: function()
            {
                return {
                    id: "test"
                };
            }
        },
        context = {
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
    var result = getRequest(options, context);

    // then
    propEqual(result, expected, "Valid request object");
});

test("getRequest post object test", 1, function ()
{
    // given
    var options = {
            post: {
                id: "test"
            }
        },
        context = {
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
    var result = getRequest(options, context);

    // then
    propEqual(result, expected, "Valid request object");
});

test("getSelector test", 1, function ()
{
    // given
    var classNames = "       itallic bold  normal   ";

    // when
    var result = getSelector(classNames);

    // then
    equal(result, ".itallic.bold.normal", "Valid css selector");
});

test("getUrl function test", 1, function ()
{
    // given
    var options = {
        url: function()
        {
            return "url/test/1";
        }
    };

    // when
    var result = getUrl(options);

    // then
    equal(result, "url/test/1", "Valid URL");
});

test("getUrl string test", 1, function ()
{
    // given
    var options = {
        url: "url/test/1"
    };

    // when
    var result = getUrl(options);

    // then
    equal(result, "url/test/1", "Valid URL");
});

module("extensions");

test("String.resolve basic (one dimension) test", 1, function ()
{
    // given
    var values = {
            first: "test",
            second: "case"
        },
        stringToResolve = "{{first}} {{second}}";

    // when
    var result = stringToResolve.resolve(values);

    // then
    equal(result, "test case", "Valid string");
});

test("String.resolve advanced (n dimension) test", 1, function ()
{
    // given
    var values = {
            first: {
                sub: "this is"
            },
            second: "a",
            third: {
                more: "more",
                adv: {
                    test: "advanced test"
                },
                "case": "case"
            }
        },
        stringToResolve = "{{first.sub}} {{second}} {{third.more}} {{third.adv.test}} {{third.case}}";

    // when
    var result = stringToResolve.resolve(values);

    // then
    equal(result, "this is a more advanced test case", "Valid string");
});