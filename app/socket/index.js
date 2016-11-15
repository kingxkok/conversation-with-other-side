const utils = require('../utils')

module.exports = (io, app) => {
  /**
   * store the rooms list in a variable called `allrooms`
   */
  let allrooms = app.locals.chatrooms

  /**
   * define a namespace /roomslist on io
   * handle the 'connect' event
   * handler function gets one argument: socket
   */
  io.of('/roomslist').on('connect', socket => {
    /**
     * TODO #1
     * Handle socket event 'getChatRooms'
     *  In response, emit event 'chatRoomsList' and send back `allrooms`
     */
     socket.on('getChatRooms', () => {
      socket.emit('chatRoomsList', allrooms);
    });

    /**
     * TODO #2
     * Handle socket event 'createNewRoom' (takes one argument: newRoomInput)
     *  Check if newRoomInput is not in allrooms like this:
     *  if (!utils.findRoomByName(allrooms, newRoomInput)) { ... }
     * 
     *    if the condition above is true:
     *      add the following object to allrooms:
     *        {
     *          room: newRoomInput,
     *          roomID: utils.randomHex(),
     *          users: [],
     *          history: []  
     *        }
     *      emit the event 'chatRoomList' with `allrooms` to the creator 
     *      emit the event 'chatRoomList' with `allrooms` to everyone   
     */
     socket.on('createNewRoom', (newRoomInput) => {
      if(!utils.findRoomByName(allrooms, newRoomInput)) {
        allrooms.push(  
          {
           room: newRoomInput,
           roomID: utils.randomHex(),
           users: [],
           history: []
          } 
        )
      }

      socket.emit('chatRoomsList', allrooms);
      socket.broadcast.emit('chatRoomsList', allrooms);
     });

     socket.on('makeChatRoom', ()  => {
      let alphanum = "QWERTYUIOPASDFGHJKLZXCVBNM qwertyuiopasdfghjklzxcvbnm 1234567890"
      let word = "";
      var len = Math.random()*8+5;
      var alphanumLen = alphanum.length;
      for(var i = 0; i<len; i++) word+= alphanum.charAt(Math.random()*alphanumLen);
      allrooms.push(
          {
            room: word,
            roomID: utils.randomHex(),
            users: [],
            history: []
          }
        )

      socket.emit('newRoom', allrooms[allrooms.length-1]);

     })



  })

  /**
   * define a namespace /chatroom on io and handle the 'connection' event
   * pass the handler one argument: socket 
   */
  io.of('/chatroom').on('connection', socket => {
    /**
     * TODO #3
     * handle the 'join' event on socket. the handler gets passed argument 'data'
     *   get the room returned by calling utils.addUserToRoom(allrooms, data, socket)
     *   emit the event 'updateRoom' on socket.to(data.roomID) with the room from above
     *   emit the event 'updateRoom' on socket with the room from above
     */
    socket.on('join', data => {
      let roomReturned = utils.addUserToRoom(allrooms, data, socket)
      socket.to(data.roomID).emit('updateRoom', roomReturned)
      socket.emit('updateRoom', roomReturned)
    });
    



    /**
     * TODO #4
     * Handle the 'disconnect' event on socket
     *   get the room returned by calling utils.removeUserFromRoom(allrooms, socket)
     *   emit the event 'updateRoom' on socket.to(data.roomID) with room.users
     */

     socket.on('disconnect', () => {
      let roomReturned = utils.removeUserFromRoom(allrooms, socket)
      socket.to(roomReturned.roomID).emit('updateRoom', roomReturned)
   //   socket.to(data.roomID).broadcast.emit('updateRoom', roomReturned)
     }) 
    
    


    /**
     * TODO #5
     * Handle the 'newMessage' event on socket, and pass it one argument: msg
     *   get the room returned by calling utils.findRoomById(allrooms, msg.roomID)
     *   add `msg` to the `history` array (on the room object from above)
     *   emit the event 'inMessage' on socket.to(msg.roomID) with msg
     */
     socket.on('newMessage', (msg) => {
      let  roomReturned = utils.findRoomById(allrooms, msg.roomID)
      roomReturned.history.push(msg);
      socket.to(msg.roomID).emit('inMessage', msg);
     })
    
    


  })
}
