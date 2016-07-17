/**
 * Created by stefan on 08.05.16.
 */

 function loadPositions(projectId, targetElementId) {
     loadData("/user/myprojects/project/"+projectId+"/positionsShortInfo", targetElementId);
 }

 function loadData(url, targetElementId) {
     $('#'+targetElementId).load(url);
 }

$(document).ready(function () {
    var socket = io().connect("http://localhost:8855");
    
    $("#clearNotifications").click(function(){
        socket.emit("clearNotifications", {});
        $('#notificationDropdown > .notification:not(:last-child)').remove();
        $("#notificationIcon").addClass("white-text");
    });

    $("#notificationIcon").click(function(){
        socket.emit("readNotifications", {});
        $("#notificationIcon").addClass("white-text");
    });

    $("form select").material_select();

    $("input[type=checkbox]").change(function() {
        var inputElem = $(this);
        inputElem.val(inputElem.prop("checked"));
    });

    socket.on("notification", function(data) {
        $("#notificationDropdown").append("<li>" + data + "</li>");
        $("#notificationIcon").removeClass("white-text");
    });

    socket.on("chat-message", function(message) {
        $("#conversationWindow").append("<li class='collection-item'><p>" + message.content + "</p></li>");
    });

    $('#chat-button').click(function(){
      socket.emit('message-sent', {
          receiver: $('#otherUserId').val(),
          content: $('#messageField').val()
      });
      $("#conversationWindow").append('<li class="collection-item grey lighten-3"><p>'+ $('#messageField').val() +'</p></li>');
      $('#messageField').val('');
    });

    $('.projectView').hide();
    $('.projectViewToggle').click(function () {
        $('#'+$(this).attr("data-target")).toggle();
    });
});


function goto(location) {
    window.location.href = location;
}