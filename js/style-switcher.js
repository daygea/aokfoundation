
// if($.cookie("css")) {
// 	$("link").attr("href",$.cookie("css"));
// }

$(document).on('ready', function() {
    $(".versions a").click(function() {
        $("#default").attr("href",$(this).attr('data-colors'));
        $.cookie("css",$(this).attr('data-colors'), {expires: 365, path: '/'});
        return false;
    });
});
