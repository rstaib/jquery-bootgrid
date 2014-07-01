/*jshint -W024 */
/*jshint -W117 */

module("render functions", {
    setup: function ()
    {
        $("#qunit-fixture").append($("<div id=\"header\"><div class=\"infos\"></div></div><div id=\"table\"></div><div id=\"footer\"><div class=\"infos\"></div></div>"));
    },
    teardown: function ()
    {
        $("#test").remove();
    }
});

function renderInfosTest(expected, message, context)
{
    // given
    var header = $("#header"),
        footer = $("#footer"),
        element = $("#table").data(namespace, {
            header: header,
            footer: footer
        }),
        options = {
            navigation: 1,
            css: {
                infos: "infos"
            },
            templates: {
                infos: "<div class=\"infos\">{{ctx.start}}{{ctx.end}}{{ctx.total}}</div>"
            }
        };

    // when
    renderInfos(element, options, context);

    // then
    var infos = header.find(".infos").text();
    equal(infos, expected, message);
}

test("renderInfos all test", 1, function ()
{
    renderInfosTest("11010", "Valid infos", {
        current: 1,
        rowCount: -1,
        total: 10
    });
});

test("renderInfos paged test", 1, function ()
{
    renderInfosTest("1510", "Valid infos", {
        current: 1,
        rowCount: 5,
        total: 10
    });
});