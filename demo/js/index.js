$(function(){
  $("#grid").bootgrid().on("loaded.rs.jquery.bootgrid", function () {
    $(this).find('[data-toggle=dropdown]').dropdown();
  });
});