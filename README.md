# Offline Shaka Player - DRM Media Playback Guide

This guide will show you how to setup Shaka Player and test DRM encrypted media offline.

On line 2 in offlineVualto.js , replace the const token value to a token generated by the VUDRM admin site. Ensure that {“liccache”:”yes”} is added to the Policy before generating the token. This will enable the Widevine license to be used with offline content.

To test offline DRM encrypted playback, https is needed due to Chrome using EME. The easiest way to set this up is to follow the below:

Ensure Visual Studio Code is installed.

Install the “Live Server” extension: https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer

To enable https, you must create a certificate to self authenticate for local host: 

- Create a private key - ensure openssl is installed and input the following command: openssl genrsa -aes256 -out localhost.key 2048 

- Provide a password. This will create the localhost.key.

- Create the certificate by inputting the following command: openssl req -days 3650 -new -newkey rsa:2048 -key localhost.key -x509 -out localhost.pem

- Input the password from the above, complete all prompts.This creates locahost.pem 

- In the root of the project, create a .vscode folder.

- Within that folder, create a settings.json file and add the following:

{
    "liveServer.settings.https": {
    "enable": true,
    "cert": "<location of localhost.pem>",
    "key": "<location of localhost.key>",
    "passphrase": "<password when creating the localhost.key>"
    }
}

- You may get a warning saying the certificate is not secure. Click advanced and go continue to the site.

Assuming everything has been set up correctly, you should now see the Shaka Player working locally with https

By default, Content Name is set to “vualto-drm-encrypted-video”

By default, Content Manifest is set to “https://d1chyo78gdexn4.cloudfront.net/vualto-demo/tomorrowland2015/tomorrowland2015.ism/manifest.mpd” - this is a DRM encrypted video.

The above can be changed to download the content you wish to test. This will work with DRM encrypted / unencrypted media.

Click download and the media will appear underneath the player where you can play or remove it.

Close Chrome, disconnect from the internet, re-open Chrome and go to the same local address where the video should still appear underneath the player. Press play and if the content is playing, the offline Shaka Player is working correctly.

