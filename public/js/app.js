// CLIENT-SIDE JAVASCRIPT

$(document).ready(function(){
  console.log('Hey, Earth!')
  // io is listening
  var socket = io();

  socket.on('message', function(msg){
    //console.log("this msg is ", msg)
    $('#messages').append($('<p>').text(msg.Body));
  });

  $("#newConversation").on("submit", function(e){
    // prevent form submission
    e.preventDefault();
    var formData = $(this).serialize();
    //console.log('form data is: ', formData);

    $.post("/chats", formData, function(data){
      // append new chatroom to the page
      var newChat = chatroom;
      // clear new food form
      var chatroomName = "<p><a href='/chats/" + data._id + "'>" + data.name + " " + data.number + "</a><span data-id='<%= chat._id %>' class='glyphicon glyphicon-hdd pull-right'></span><p>"
      //console.log(chatroomName)
      $("#chats-ul").append(chatroomName);
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
          
          $('#message-list').append(newMessage);
          $("#new-message")[0].reset();
          $("#textbody").focus();
        })
      })
//Delete listener, but should be a move to archive 
      $('.chatrooms').on('click', '.glyphicon', function(e) {
        e.preventDefault();
//        console.log("deleteing");

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
        //  console.log("Failed to terminate a chat !")
        })
      })
});
