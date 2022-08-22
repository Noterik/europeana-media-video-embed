import Placeload from 'placeload.js'

import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min.js';

require('./icons/euscreen-logo.png');
require('./icons/speech.svg');
require('./icons/note.svg');
require('./icons/title.svg');
require('./icons/spotlight.svg');
require('./icons/label.svg');
require('./icons/pause.svg');

const EuropeanaMediaPlayer = require("@europeana/media-player");

//var options = {embedid: "6FFlHN"}; 
//var options = {embedid: "WZpDVT"};
//var options = {embedid: "qBUhte"};
//var options = {embedid: "6BGMFG"};
//var options = {embedid: "Y1pbs4"};
var options = {embedid: "hT71Rp"};
var manifest;
var manifests = [];
var width;
var height;
var videoLoader;
var player;
var manifestJsonld = {};
var manifestMetadata = {};
var subtitles = {};
var currentMediaItem = 1;
var timeupdate;
var videoLoaderActive = false;
var tabsInstance;
var start = 0;
var duration = -1;
var language;

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

  var hash = window.location.hash;
  if (hash.length > 1) {
    language = hash.substr(1);
  }
});

function getEmbedInfo() {
  let link = "https://embd.eu/api/embed/"+options.embedid;

  fetch(
      link, { 
          method: 'GET',
          mode: 'cors',
          headers: { "Content-Type": "application/json; charset=utf-8" }
      })
  .then(res => res.json())
  .then(response => {
      if (Array.isArray(response.videoid)) {
        manifests = response.videoid;
        manifest = manifests[0].vid;
      } else {
        manifest = response.videoid;
      }
      width = response.width;
      height = response.height;

      loadVideo();

  })
  .catch(err => {
      console.error("Could not retrieve embed info");
      console.log(err);
  });
}

function loadVideo() {
  $(".content-wrapper").css({"width": width});
  $(".player-wrapper").css({"width": width, "height": height});

  videoLoaderActive = true;

  if ($(".content-wrapper").width() > 700) {
    videoLoader = Placeload
      .$('.place-loader')
      .config({speed: '1s'})
      .line((element) => element.width(width).height(height))
      .config({spaceBetween: '30px'})
      .line((element) => element.width(45).height(20))
      .config({spaceBetween: '13px'})
      .line((element) => element.width(width).height(20))
      .config({spaceBetween: '7px'})
      .line((element) => element.width(width).height(20))
      .config({spaceBetween: '7px'})
      .line((element) => element.width(width).height(20))
      .fold(
        err => console.log('error: ', err),
        allElements => {}
      );
  } else {
    videoLoader = Placeload
      .$('.place-loader')
      .config({speed: '1s'})
      .line((element) => element.width(width).height(height))
      .config({spaceBetween: '10px'})
      .line((element) => element.width(80).height(30))
      .config({spaceBetween: '13px'})
      .line((element) => element.width(60).height(20))
      .config({spaceBetween: '13px'})
      .line((element) => element.width(width).height(20))
      .config({spaceBetween: '7px'})
      .line((element) => element.width(width).height(20))
      .config({spaceBetween: '7px'})
      .line((element) => element.width(width).height(20))
      .fold(
        err => console.log('error: ', err),
        allElements => {}
      );
  }

  if (options.temporal) {
    manifest = "https://embd.eu/api/embed/"+options.embedid+"/t/"+options.temporal;
  }

  let vObj = {manifest: manifest};
  let opt = {mode: "player"};
  opt.manifest = manifest;
  if (language != undefined && language.length > 0) {
    opt.language = language;
  }

  getAnnotations();

  setTimeout(function() { 
    let p = new EuropeanaMediaPlayer($(".player-wrapper"), vObj, opt);
    player = p.player;

    player.avcomponent.on('mediaerror', function() {
      initializeEmbed();
    });

    player.avcomponent.on('mediaready', function() {
      initializeEmbed();
      /*videoLoader.remove();
      $(".player-wrapper").show();

      getSubtitles();

      manifestJsonld = player.manifest.__jsonld;
      manifestMetadata = manifestJsonld.metaData;
  
      if ($(".content-wrapper").width() > 700) {
        $(".widecolumn").each(function() {
          $(this).removeClass("smallrow");
        })
        $(".widecolumn").show();
      } else {
        $(".smallrow").each(function() {
          $(this).removeClass("widecolumn");
        });
        $(".smallrow").show();

        let tabs = document.querySelectorAll('.tabs')[0];
        let tabOptions = {duration: 300}
        let tabsInstance = M.Tabs.init(tabs, tabOptions);

        var hash = window.location.hash;
        if (hash.length > 1) {
          hash = hash.indexOf("?") > -1 ? hash.substring(0, hash.indexOf("?")) : hash;
          tabsInstance.select(hash.substr(1));
        }
      }

      let langCode = manifestMetadata.find(obj => obj.label.en[0] == "language").value[Object.keys(manifestMetadata.find(obj => obj.label.en[0] == "language").value)[0]][0];
      $(".video-title").text(manifestJsonld.label[Object.keys(manifestJsonld.label)[0]]);
      $(".video-description").text(manifestJsonld.description[Object.keys(manifestJsonld.description)[0]]);*/
    });
  }, 500);
}

function initializeEmbed() {
  if (videoLoaderActive) {
    videoLoader.remove();
    videoLoaderActive = false;
  }
  $(".player-wrapper").show();

  timeupdate = setInterval(() => mediaHasEnded(player.hasEnded()), 50);

  getSubtitles();

  manifestJsonld = player.manifest.__jsonld;
  manifestMetadata = manifestJsonld.metaData;

  $(".smallrow").each(function() {
    $(this).removeClass("widecolumn");
  });

  //let langCode = manifestMetadata.find(obj => obj.label.en[0] == "language").value[Object.keys(manifestMetadata.find(obj => obj.label.en[0] == "language").value)[0]][0];
  if (manifestJsonld.label) {
    $(".video-title").text(manifestJsonld.label[Object.keys(manifestJsonld.label)[0]]);
  } 

  console.log(manifestJsonld.metaData);
  let euscreenId, provider;
  if (manifestMetadata.find(obj => obj.label.en[0] == "euscreenIdentifier")) {
    euscreenId = manifestMetadata.find(obj => obj.label.en[0] == "euscreenIdentifier").value[Object.keys(manifestMetadata.find(obj => obj.label.en[0] == "euscreenIdentifier").value)[0]][0];
    $(".video-title").wrap('<a href="http://www.euscreen.eu/item.html?id='+euscreenId+'" target="_blank"/>')
  }
  if (manifestMetadata.find(obj => obj.label.en[0] == "provider")) {
    provider = manifestMetadata.find(obj => obj.label.en[0] == "provider").value[Object.keys(manifestMetadata.find(obj => obj.label.en[0] == "provider").value)[0]][0];
    $(".video-provider").text(provider);
  }


  /*if (manifestJsonld.description) {
    $(".video-description").text(manifestJsonld.description[Object.keys(manifestJsonld.description)[0]]);
  }*/

  if (duration == -1 && manifestJsonld.items[0].duration) {
     duration = manifestJsonld.items[0].duration;
  }
}

function getAnnotations() {
  let link = "https://embd.eu/api/embed/"+options.embedid+"/annotations";

  if (options.temporal) {
    link = "https://embd.eu/api/embed/"+options.embedid+"/annotations/t/"+options.temporal;
  }

  fetch(
      link, { 
          method: 'GET',
          mode: 'cors',
          headers: { "Content-Type": "application/json; charset=utf-8" }
      })
  .then(res => res.json())
  .then(response => {
      let  annotations = response;
      if (annotations.length > 0) {
        $(".header-row").show();
        $(".header-body-separate-row").hide();

        let tabs = document.querySelectorAll('.tabs')[0];
        let tabOptions = {duration: 300}
        tabsInstance = M.Tabs.init(tabs, tabOptions);

        var hash = window.location.hash;
        if (hash.length > 1) {
          hash = hash.indexOf("?") > -1 ? hash.substring(0, hash.indexOf("?")) : hash;
          tabsInstance.select(hash.substr(1));
        } else {
          tabsInstance.select("metadata");
        }
      }
      annotations.forEach(function(annotation) {
        addAnnotation(annotation);
      });
  })
  .catch(err => {
      console.error("Could not retrieve annotations");
      console.log(err);
  });
}

function addAnnotation(annotation) {
  $(".annotations").append("<div class='row annotation-row' data-start='"+annotation.start+"'><div class='annotation-timing col s2'>"+formatTime(annotation.start)+" - "+formatTime(annotation.end)+"</div><div class='annotation-text col s10'><img src='"+annotation.type+".svg' class='annotation-icon'/><span class='annotation-text-inline'>"+annotation.text+"</span></div></div>");

  $(".annotation-row").on("click", function() {
    player.avcomponent._getCurrentCanvas().setCurrentTime(($(this).data("start") / 1000));
  });
}

function getSubtitles() {
  let link = "https://embd.eu/api/embed/"+options.embedid+"/subtitles";

  if (options.temporal) {
    link = "https://embd.eu/api/embed/"+options.embedid+"/subtitles/t/"+options.temporal;
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
      player.initLanguages(player.elem.find('video')[0].textTracks);
  })
  .catch(err => {
      console.error("Could not retrieve subtitles");
      console.log(err);
  });
}

function mediaHasEnded(ended) {
  if ((ended || player.avcomponent._getCurrentCanvas().getCurrentTime() == duration) && currentMediaItem < manifests.length) {
    //load next playlist item
    manifest = manifests[currentMediaItem].vid;
    currentMediaItem++;

    //clear 
    $("#embed-player").empty();
    $(".annotations").empty();

    let vObj = {manifest: manifest};
    let opt = {mode: "player"};
    opt.manifest = manifest;

    let p = new EuropeanaMediaPlayer($(".player-wrapper"), vObj, opt);
    player = p.player;

    player.avcomponent.on('mediaerror', function() {
      initializeEmbed();
    });

    player.avcomponent.on('mediaready', function() {
      initializeEmbed();
    });
  }
}

function getAllUrlParams(url) {
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
}

function formatTime(time, millis = false, threeDigitMillis = false) {
  time = time < 0 ? 0 : time;

  let hours = Math.floor(time / 3600000);
  let minutes = Math.floor(time / 60000);
  let seconds;
  if (millis) {
    seconds = Math.floor((time % 60000) / 1000);
  } else {
    seconds = Math.ceil((time % 60000) / 1000);
  }

  let timestring = hours > 0 ? hours+":" : "";
  timestring += minutes < 10 ? "0"+minutes+":" : minutes+":";
  timestring += seconds < 10 ? "0"+seconds : seconds;

  if (millis) {
    let milliseconds = threeDigitMillis ? Math.floor(time % 1000) : Math.floor((time % 1000) / 10);
    if (threeDigitMillis) {
      if (milliseconds < 10) { 
        timestring += ".00" + milliseconds;
      } else if (milliseconds < 100) {
        timestring += ".0" + milliseconds;
      } else {
        timestring += "." + milliseconds
      }
    } else {
      if (milliseconds < 10) {
        timestring += ".0" + milliseconds;
      } else {
        timestring += "." + milliseconds;
      }
    }
  }

  return timestring;
}

