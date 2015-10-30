// CLIENT-SIDE JAVASCRIPT
// On page load



$(document).ready(function(){
  console.log('Hey, Earth!')

  
  /*$('#new-message').submit(function(){
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });*/

  var socket = io();

  socket.on('message', function(msg){
    console.log("this msg is ", msg)
    $('#messages').append($('<li>').text(msg.Body));
  });

  $("#newConversation").on("submit", function(e){
    // prevent form submission
    e.preventDefault();

    var formData = $(this).serialize();
    console.log('form data is: ', formData);

    $.post("/chats", formData, function(data){
      // append new chatroom to the page
      var newChat = chatroom;
      // clear new food form
      var chatroomName = "<p><a 'href='/chats/" + data._id + "'>" + data.name + " " + data.number + "</a><p>"
      console.log(chatroomName)
      $("#chats-ul").prepend(chatroomName);
      // reset the form 
      $("#newConversation")[0].reset();
      $("#chatroom").focus();
    });
  });

      $('#new-message').on('submit', function(e) {
        e.preventDefault();
  
        var messageData = $("[name='messagebody']", this).val();
        console.log("t is ",messageData)
        var input = { "message" : messageData,
        chatId : $(this).data().id
        }
        console.log("input is ", input);

        var url = "/chats/" + $(this).data().id + "/messages"
        $.post(url, input, function(message) {
          // make HTML string to append to page
          var newMessage = "<p>" + message.Body + "</p>";
          
  // append the HTML string to the element with an id of 'comment-list' in the DOM
          $('#message-list').append(newMessage);
        })
      })

      $('.chatrooms').on('click', '.glyphicon', function(e) {
        e.preventDefault();
        console.log("deleteing");

        var chatId = $(this).data().id;
        console.log(chatId);
        var chat = $(this).closest('p');

        $.ajax({
          type: "DELETE",
          url: '/chats/' + chatId
        })
        .done(function(data) {
          console.log(data);
          $(chat).remove();
        })
        .fail(function(data){
          console.log("Failed to terminate a chat !")
        })
      })
});
