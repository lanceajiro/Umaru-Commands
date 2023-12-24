import request from 'request';
import fs from 'fs';

export const setup = {
  name: "qr",
  version: "1.0",
  permission: "Users",
  creator: "Ncs",
  description: "Generate a QR code to share links/text easily",
  category: "utility",
  usages: "[text]",
  cooldown: 0,
  isPrefix: true,
};

export const domain = { "qr": setup.name };

export const execCommand = async function ({ api, event, args }) {
  if (args.length < 1) {
    return api.sendMessage("You must add text to your command, so I can convert it to a QR code.\nEg: `-qr This message is now encoded as a QR code`", event.threadID, event.messageID);
  } else {
    // Necessary for choosing random colours for rich embeds
    var colour_array = ["1211996", "3447003", "13089792", "16711858", "1088163", "16098851", "6150962"];
    var randomNumber = getRandomNumber(0, colour_array.length - 1);
    var randomColour = colour_array[randomNumber];
    var user_text = args.join(" ").split(" ").join("%20");
    var qr_generator = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${user_text}`;

    // Use request to fetch the QR code image from the API endpoint
    request(qr_generator, { encoding: 'binary' }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        // Save the image as a file on the server
        fs.writeFile('qr.png', body, 'binary', function (err) {
          if (err) {
            console.error(err);
            return api.sendMessage("An error occurred while generating the QR code.", event.threadID, event.messageID);
          }
          // Send the saved image file using sendLocalImage function
          api.sendMessage(
            {
              attachment: fs.createReadStream('qr.png')
            },
            event.threadID,
            (err) => {
              if (err) {
                console.error(err);
                return api.sendMessage("An error occurred while sending the QR code image.", event.threadID, event.messageID);
              }
              // Remove the saved image file
              fs.unlink('qr.png', function (err) {
                if (err) console.error(err);
              });
            }
          );
        });
      } else {
        return api.sendMessage("An error occurred while generating the QR code.", event.threadID, event.messageID);
      }
    });
  }

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};
