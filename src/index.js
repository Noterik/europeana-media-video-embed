import './index.scss';

let mediaMode = '';

const embedHost = 'https://embd.eu/api/embed/';
const EuropeanaMediaPlayer = require("europeanamediaplayer").default;

//var options = {embedid: "6FFlHN"}; mediaMode = 'video';
//var options = {embedid: "WZpDVT"}; mediaMode = 'video';
//var options = {embedid: "qBUhte"}; mediaMode = 'video';
//var options = {embedid: "6BGMFG"}; mediaMode = 'video';
const options = {embedid: "Y1pbs4"}; mediaMode = 'video';

//const options = {embedid: "7FQEZr"}; mediaMode = 'image'

var manifest;
var manifests = [];
var embedWidth;
var embedHeight;
var player;
var manifestJsonld = {};
var manifestMetadata = {};
var subtitles = {};
let currentMediaItem = 1;
export { currentMediaItem };

let timeUpdate;
export { timeUpdate };

var start = 0;
var duration = -1;
var playing = false;

window.addEventListener('load', () => {

  if (window.location.pathname.length > 1) {
    options.embedid = window.location.pathname.substring(1);
  }

  getEmbedInfo();

  if (getAllUrlParams(window.location.href).t != undefined) {
    options.temporal = decodeURIComponent(getAllUrlParams(window.location.href).t);
    //construct start and duration of the temporal fragment
    if (options.temporal.indexOf(",") > -1) {
      let parts = options.temporal.split(",");
      start = parts[0];
      duration = parts[1] - parts[0];
    }
  }
});

function getEmbedInfo() {
  let link = `${embedHost}${options.embedid}`;
  fetch(
      link, {
          method: 'GET',
          mode: 'cors',
          headers: { "Content-Type": "application/json; charset=utf-8" }
      })
  .then(res => res.json())
  .then(response => {

      $('body').addClass(mediaMode);

      if(mediaMode === 'image'){
        console.log('TODO: handle images');
      }
      else if(mediaMode === 'video'){
        if (Array.isArray(response.videoid)) {
          manifests = response.videoid;
          manifest = manifests[0].vid;
        } else {
          manifest = response.videoid;
        }
        embedWidth = response.width;
        embedHeight = response.height;
        loadVideo();
      }
  })
  .catch(err => {
      console.error("Could not retrieve embed info");
      console.log(err);
  });
}

function loadVideo() {
  $(".player-wrapper").css({"max-width": embedWidth + 'px', "max-height": embedHeight + 'px' });
  $(".aspect-ratio").width(embedWidth);

  if (options.temporal) {
    manifest = `${embedHost}${options.embedid}/t/${options.temporal}`;
  }

  let vObj = {manifest: manifest};
  let opt = {mode: "player"};
  opt.manifest = manifest;

  setTimeout(function() {
    let p = new EuropeanaMediaPlayer($('.player-wrapper'), vObj, opt);
    player = p.player;

    player.avcomponent.on('mediaerror', function() {
      initializeEmbed();
    });

    player.avcomponent.on('mediaready', function() {
      initializeEmbed();
      initializeAttribution();
    });

    player.avcomponent.on('play', function() {
      playing = true;
      $('.player-wrapper').addClass('playing');
    });

    player.avcomponent.on('pause', function() {
      playing = false;
      $('.player-wrapper').removeClass('playing');
    });

  }, 50);
}

export const urlIcons = (url) => {
  if(url.match(/https:\/\/creativecommons.org\/licenses\/by-nc\//)){
    return ['cc', 'by', 'nc']
  }
  else if(url.match(/https:\/\/creativecommons.org\/licenses\/by\//)){
    return ['cc', 'by']
  }
  else if(url.match(/https:\/\/creativecommons.org\/licenses\/by-sa\//)){
    return ['cc', 'by', 'sa']
  }
  else if(url.match(/https:\/\/creativecommons.org\/licenses\/by-nc\//)){
    return ['cc', 'by', 'nc']
  }
  else if(url.match(/https:\/\/creativecommons.org\/licenses\/by-nd\//)){
    return ['cc', 'by', 'nd']
  }
  else if(url.match(/https:\/\/creativecommons.org\/publicdomain\/mark\//)){
    return ['cc', 'pd']
  }
  else if(url.match(/http:\/\/rightsstatements.org\/vocab\/InC\//)){
    return ['Inc']
  }
}

export const initializeAttribution = () => {

  let btnInfo         = $('<div class="btn icon-info">&#128712;</div>').appendTo($('.controls-container'));
  let htmlAttribution = manifestJsonld.attribution.en;

  if(typeof htmlAttribution !== 'string'){
    htmlAttribution = ['Title', 'Creator', 'Date', 'Institution', 'Country'].map((name) => {
      return `
        <div class="field">
          <span class="fname">${name}</span>
          <span class="fvalue">${name === 'Title' ? manifestJsonld.label[Object.keys(manifestJsonld.label)[0]] :
              name === 'Institution' ? '<a href="http:europeana.eu">' + name + ' goes here</a>' :
              name + ' goes here'
            }
          </span>
        </div>`;
    }).join('');

    let about      = 'https://www.europeana.eu/portal/record/2022362/_Royal_Museums_Greenwich__http___collections_rmg_co_uk_collections_objects_573492';
    let rightItems = urlIcons('https://creativecommons.org/publicdomain/mark/1.0/').map((key) => `<li class="icon-license-${key}"></li>`).join('');

    htmlAttribution += `
      <div class="field">
        <span class="fname">Rights</span>
        <div class="fvalue">
          <ul class="rights-list">${rightItems}</ul>
          <a href='http://rightsstatements.org/vocab/InC/1.0/' rel='xhv:license http://www.europeana.eu/schemas/edm/rights'>In Copyright</a>
        </div>
      </div>`;
    htmlAttribution = `<div class="attribution" about="${about}">${htmlAttribution}</div>`;
  }

  let attribution = $(htmlAttribution).appendTo($('.info'));

  attribution.on('click', ()=> {
    attribution.removeClass('showing');
  });
  btnInfo.on('click', ()=> {
    attribution.addClass('showing');
  });
  attribution.addClass('showing');
};

export const initializeEmbed = () => {

  $('.player-wrapper').removeClass('loading');

  if(timeUpdate){
    window.clearInterval(timeUpdate);
  }
  timeUpdate = setInterval(() => mediaHasEnded(player.hasEnded()), 50);

  getSubtitles();

  manifestJsonld = player.manifest.__jsonld;
  manifestMetadata = manifestJsonld.metaData;

  //let langCode = manifestMetadata.find(obj => obj.label.en[0] == "language").value[Object.keys(manifestMetadata.find(obj => obj.label.en[0] == "language").value)[0]][0];
  if (manifestJsonld.label) {
    $('.title').text(manifestJsonld.label[Object.keys(manifestJsonld.label)[0]]);
    $('.logo').removeAttr('style');
  }

  if (duration == -1 && manifestJsonld.items[0].duration) {
     duration = manifestJsonld.items[0].duration;
  }
}

function getSubtitles() {
  let link = `${embedHost}${options.embedid}/subtitles`

  if (options.temporal) {
    link += `/t/${options.temporal}`;
  }

  fetch(
      link, {
          method: 'GET',
          mode: 'cors',
          headers: { "Content-Type": "application/json; charset=utf-8" }
      })
  .then(res => res.json())
  .then(response => {
      let   subs = response;
      subs.forEach(function(subtitle) {
        let language = subtitle.language;
        //check if track already exists
        if (!subtitles.hasOwnProperty(language)) {
          subtitles[language] = [];
        }
        subtitles[language].push(subtitle);
      });

      for (var language of Object.keys(subtitles)) {
        let track = $("#embed-player video")[0].addTextTrack("subtitles", "user_subitles", language);

        subtitles[language].forEach(function(subtitle) {
          var cue = new VTTCue(subtitle.start/1000, subtitle.end/1000, subtitle.text);
          cue.id = subtitle.id;
          cue.line = -4;
          cue.size = 90;
          track.addCue(cue);
        });
      }
      player.initLanguages();
  })
  .catch(err => {
      console.error("Could not retrieve subtitles");
      console.log(err);
  });
}

export const mediaHasEnded = (ended) => {
  if ((ended || player.avcomponent.getCurrentTime() == duration) && currentMediaItem < manifests.length) {
    //load next playlist item
    manifest = manifests[currentMediaItem].vid;
    currentMediaItem ++;

    //clear
    $('.player-wrapper').empty();

    let vObj = {manifest: manifest};
    let opt = {mode: "player"};
    opt.manifest = manifest;

    let p = new EuropeanaMediaPlayer($('.player-wrapper'), vObj, opt);
    player = p.player;

    player.avcomponent.on('mediaerror', function() {
      initializeEmbed();
    });

    player.avcomponent.on('mediaready', function() {
      initializeEmbed();
    });
  }
};

export const getAllUrlParams = (url) => {
  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i = 0; i < arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // set parameter name and value (use 'true' if empty)
      var paramName = a[0];
      var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      //if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

      // if the paramName ends with square brackets, e.g. colors[] or colors[2]
      if (paramName.match(/\[(\d+)?\]$/)) {

        // create key if it doesn't exist
        var key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];

        // if it's an indexed array e.g. colors[2]
        if (paramName.match(/\[\d+\]$/)) {
          // get the index value and add the entry at the appropriate position
          var index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          // otherwise add the value to the end of the array
          obj[key].push(paramValue);
        }
      } else {
        // we're dealing with a string
        if (!obj[paramName]) {
          // if it doesn't exist, create property
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string'){
          // if property does exist and it's a string, convert it to an array
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          // otherwise add the property
          obj[paramName].push(paramValue);
        }
      }
    }
  }
  return obj;
};
