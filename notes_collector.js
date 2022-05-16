const { channel } = require("diagnostics_channel");
const Discord = require("discord.js");
const intents = new Discord.Intents(32767);
const client = new Discord.Client({
  intents,
});
const { DiscordAPIError } = require("discord.js");
const fs = require("fs");
var https = require("https");
var Token = "OTAzMjc1MTY4MDkxMjM4NDIx.YXqmjg.AmNLCEShtb40iVoXFZmoDqVlowI";

var event = "No event";
var folder = "No destination";
var category_name = "";
var channel_name = "";
var attachment_name = "";
var new_attachment_name = "";
var event_mode = 0;
var total_submissions = 0;

var download = function (url, dest, cb) {
  var file = fs.createWriteStream(dest);
  https.get(url, function (response) {
    response.pipe(file);
    file.on("finish", function () {
      //fs.renameSync(attachment_name, new_attachment_name);
      console.log("File Downloaded");
      var log =
        "New submission for **" +
        event +
        ":**\nName: " +
        category_name +
        "\nRegd. No: " +
        channel_name +
        "\nOriginal Attachment: " +
        attachment_name +
        "\nModified to: " +
        new_attachment_name +
        "\nSaved to directory: " +
        folder + "\n===================";
      client.channels.cache.get("941363148827557898").send(log);
      total_submissions++;
    });
  });
};

client.login(Token);
client.on("ready", () => {
  console.log("Ready!");
});

client.on("messageCreate", (message) => {
  if (!message.author.bot) {
    if (message.author.id === "396251038807752714" && message.content.startsWith("?event")) {
      if (message.content.endsWith("?event")) {
        message.reply("Current event: " + event);
        return;
      }
      var command = message.content.substring(7);
      message.reply(
        "**Event updated:**\n`FROM: " + event + "`\n`TO: " + command + "`"
      );
      event = command;
    }
    if (
      message.author.id === "396251038807752714" &&
      message.content.startsWith("?dir")
    ) {
      if (message.content.endsWith("?dir")) {
        message.reply("Current directory: " + folder);
        return;
      }
      var input_folder = message.content.substring(5);
      if (!fs.existsSync("./" + input_folder)) {
        fs.mkdirSync("./" + input_folder);
      }
      message.reply(
        "**Updated saving directory:**\n`TO: " + input_folder + "`"
      );
      folder = input_folder;
    }
    if(message.content === "?status"){
        message.reply("Accepting Responses: " + event_mode + "\nCurrent Event: " + event + "\nSaving to: " + folder + "\nTotal Submissions: "+total_submissions);
    }
    if (
      message.author.id === "396251038807752714" &&
      message.content === "?start"
    ) {
      message.reply("**Submission mode : Active**");
      event_mode = 1;
    }
    if (
      message.author.id === "396251038807752714" &&
      message.content === "?stop"
    ) {
      message.reply("**Submission mode : Inactive**");
      event_mode = 0;
    }
    if (
      message.attachments.size > 0 &&
      message.attachments.first().name.endsWith(".pdf") == true
    ) {
      if (
        event_mode === 1 &&
        event == "No event" &&
        folder == "No destination"
      ) {
        message.reply(
          "The event has not been updated yet. <@396251038807752714>, update me bruh."
        );
        return;
      }
      if (
        event_mode === 1 &&
        !(event == "No event" && folder == "No destination")
      ) {
        url = message.attachments.first().url;
        category_name = message.channel.parent.name;
        channel_name = message.channel.name;
        attachment_name = message.attachments.first().name;
        new_attachment_name = category_name + "_" + channel_name + ".pdf";
        download(url, ".//" + folder + "//" + new_attachment_name);
        message.reply(
          "Thank you, " +
            message.author.username +
            "!\nYour " +
            event +
            " submission has been recorded and following changes have been made to it:" +
            "\n**File name changed:**\n```From: " +
            attachment_name +
            "\nTo: " +
            new_attachment_name +
            "```"
        );
        //console.log("The channel name is " + channel_name);
        console.log("Data received by " + category_name);
        //console.log("The attachment name is " + attachment_name);
        //console.log("The new attachment name is " + new_attachment_name);
      }
      if (event_mode === 0) {
        message.reply("The submissions are closed.");
        return;
      }
    }
  }
});
