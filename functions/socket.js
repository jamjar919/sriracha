var request = require('request');

module.exports = function Server(io, server) {

  // socket.io operations
  io.on('connection', function(socket) {
    console.log("a new human has connected")
    // send the clients id to the client itself.
    socket.send(socket.id);

    socket.on('imageupload', function(img_json) {
        // console.log("upload this pls:", img);

      console.log("received an image to upload");
      console.log(img_json.id)

      console.log(img_json.src)
      // dude = img_json.src.split(',')[1];
      // img_json.src = img_json.src.replace("data:image/png;base64,", "");
      img_json.src = img_json.src.split(',')[1];
      console.log(img_json.src);

      upload(img_json.src, function(err, response) {
          console.log(response.data.link)
          var resp_img = {
              'id': img_json.id,
              'url': response.data.link.replace("http", "https")
          }
          socket.emit('img_uploaded', resp_img);
          console.log("sent back image uploaded.");
      })

    });

  });

  return this;
};

function upload(file, done) {
    var options = {
        url: 'https://api.imgur.com/3/upload',
        headers: {
            'Authorization': 'Client-ID d61bcbe808b131a'
        }
    };
    var post = request.post(options, function(err, req, body) {
        try {
            done(err, JSON.parse(body));
        } catch (e) {
            console.log("something bad happened")
            done(err, body);
        }
    });
    var upload = post.form();
    upload.append('type', 'base64');
    upload.append('image', file);
}
