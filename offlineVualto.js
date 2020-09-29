//Enter a token to use with DRM enabled content. Ensure that "{"liccache":"yes"}" is added to the Policy before generating a token in VUDRM admin.
const token = "vualto-demo|2020-09-29T09:41:19Z|Ej3GRU8dDJmZ8+ni1rcV4Hoo3rjQh7IJUldVUT+TY4U=|7f2ebd62243276e43de1f2b3624bd70db7367248"

var widevineLaURL = "https://widevine-license.vudrm.tech/proxy?token=" + encodeURIComponent(token);

function initApp() {
  shaka.polyfill.installAll();

  if (shaka.Player.isBrowserSupported()) {
    initPlayer();
  } else {
    console.error('Browser not supported!');
  }
}

function initPlayer() {
  const video = document.getElementById('video');
  const player = new shaka.Player(video);

  window.player = player;

  player.addEventListener('error', onErrorEvent);

  player.configure({
    usePersistentLicense: true,
    drm: {
        servers: {
            'com.widevine.alpha': widevineLaURL
        }
    }
  });

  console.log(widevineLaURL);

  initStorage(player);

  const downloadButton = document.getElementById('download-button');
  downloadButton.onclick = onDownloadClick;

  refreshContentList();
}

function onErrorEvent(event) {
  onError(event.detail);
}

function onError(error) {
  console.error('Error code', error.code, 'object', error);
}

function selectTracks(tracks) {
  const found = tracks
      .filter(function(track) { return track.type == 'variant'; })
      .sort(function(a, b) { return a.bandwidth - b.bandwidth; })
      .pop();
  console.log('Offline Track bandwidth: ' + found.bandwidth);
  return [ found ];
}

function initStorage(player) {
  window.storage = new shaka.offline.Storage(player);
  window.storage.configure({
    trackSelectionCallback: selectTracks
  });
}

function listContent() {
  return window.storage.list();
}

function playContent(content) {
  window.player.load(content.offlineUri);
}

function removeContent(content) {
  return window.storage.remove(content.offlineUri);
}

function downloadContent(manifestUri, title) {
  const metadata = {
    'title': title,
    'downloaded': Date()
  };

  return window.storage.store(manifestUri, metadata);
}

function onDownloadClick() {
  const downloadButton = document.getElementById('download-button');
  const manifestUri = document.getElementById('asset-uri-input').value;
  const title = document.getElementById('asset-title-input').value;

  downloadButton.disabled = true;

  downloadContent(manifestUri, title)
    .then(function() {
      return refreshContentList();
    })
    .then(function(content) {
      downloadButton.disabled = false;
    })
    .catch(function(error) {
      downloadButton.disabled = false;
      onError(error);
    });
}

function refreshContentList() {
  const contentTable = document.getElementById('content-table');

  while (contentTable.rows.length) {
    contentTable.deleteRow(0);
  }

  const addRow = function(content) {
    const append = -1;

    const row = contentTable.insertRow(append);
    row.insertCell(append).innerHTML = content.offlineUri;
    Object.keys(content.appMetadata)
        .map(function(key) {
          return content.appMetadata[key];
        })
        .forEach(function(value) {
          row.insertCell(append).innerHTML = value;
        });

    row.insertCell(append).appendChild(createButton(
        'PLAY',
        function() { playContent(content); }));

    row.insertCell(append).appendChild(createButton(
        'REMOVE',
        function() {
          removeContent(content)
              .then(function() { refreshContentList() });
        }));
  };

  return listContent()
      .then(function(content) { content.forEach(addRow); });
};

function createButton(text, action) {
  const button = document.createElement('button');
  button.innerHTML = text;
  button.onclick = action;
  return button;
}

document.addEventListener('DOMContentLoaded', initApp);
