/**
 * Created by Jakob on 12/06/2016.
 */

$(document).ready(function () {
    $('.rating').each(function () {
        var iRating = $(this).data("ratingRating");
        console.log(iRating);
        $(this).barrating('show', {
            theme: 'fontawesome-stars-o',
            initialRating: iRating,
            onSelect: function (value, text, event) {
                if (typeof(event) !== 'undefined') {

                    var userId = $(this.$elem[0]).data("userId");
                    var posId = $(this.$elem[0]).data("positionId");

                    $.ajax({
                        url: "/user/rate",
                        method: "POST",
                        datatype: "json",
                        data: {
                            "userId": userId,
                            "rating": value,
                            "positionId": posId
                        },
                        success: function (data) {
                            Materialize.toast("Success!", 3000, "rounded projectr-pink-bg");
                        }
                    });
                } else {
                    // rating was selected programmatically
                    // by calling `set` method
                }
            }
        });
    });
    renderRatings();
});


function renderRatings() {
    $('.showrating').each(function (index) {
        var elem = $(this);
        var id = elem.attr('data-target');
        elem.barrating('show', {
            theme: 'fontawesome-stars-o',
            initialRating: $("#" + id).val(),
            readonly: true,
            showSelectedRating: true
        });
    });
}




