import './index.scss';

const embedHost = 'https://embd.eu/api/embed/';
const EuropeanaMediaPlayer = require("europeanamediaplayer").default;

//localhost:9001?manifest=https%3A%2F%2Fiiif.europeana.eu%2F%2Fpresentation%2F%2F08609%2F%2Ffe9c5449_9522_4a70_951b_ef0b27893ae9%2F%2Fmanifest%3Fformat%3D3%26wskey%3Dapi2demo
//const options = {embedid: "6FFlHN"};
//const options = {embedid: "WZpDVT"};
//const options = {embedid: "qBUhte"};
//const options = {embedid: "6BGMFG"};
//const options = {embedid: "Y1pbs4"};

// VIDEO
//http://localhost:9001/?width=960&height=720&manifest=https%3A%2F%2Fiiif.europeana.eu%2F%2Fpresentation%2F%2F08609%2F%2Ffe9c5449_9522_4a70_951b_ef0b27893ae9%2F%2Fmanifest%3Fformat%3D3%26wskey%3Dapi2demo
// IMAGE
//http://localhost:9001/?width=260&height=520&manifest=https%3A%2F%2Fiiif.europeana.eu%2Fpresentation%2F2021672%2Fresource_document_mauritshuis_670%2Fmanifest%3Fformat%3D3%26wskey%3Dapi2demo
// AUDIO
//http://localhost:9001/?width=260&height=520&manifest=https%3A%2F%2Fiiif.europeana.eu%2Fpresentation%2F22%2F_72315%2Fmanifest%3Fformat%3D3%26wskey%3Dapi2demo

var manifest;

let player;
export { player };

var duration = -1;
var playing = false;

window.addEventListener('load', () => {

  const urlParams = getAllUrlParams(window.location.href);

  if(urlParams.manifest){

    loadJSON(urlParams.manifest, (manifestData) => {

      let mediaMode = manifestData.items[0].items[0].items[0].body.type.toLowerCase();
      $('.player-wrapper').addClass(mediaMode);

      manifest = urlParams.manifest;

      if(urlParams.width && urlParams.height){
        setEmbedDimensions(urlParams.width, urlParams.height, mediaMode === 'image');
      }

      if(['audio', 'video'].indexOf(mediaMode) > -1){
        initialisePlayer($('.player-wrapper'), manifest, mediaMode);
      }
      else{
        if(mediaMode === 'image'){
          $('.player-wrapper').append(`<img src="${manifestData.items[0].items[0].items[0].body.id}">`);
        }
        $('.player-wrapper').removeClass('loading');
        initialiseAttribution(manifestData.items[0], mediaMode);
      }
    });
  }
  else{
    console.log('no manifest supplied');
  }

  if (urlParams.t !== undefined) {
    //options.temporal = urlParams.t;
    //construct start and duration of the temporal fragment
    let parts = urlParams.t.split(',');
    if(split.length > 1){
      duration = parts[1] - parts[0];
    }
  }
});

export const loadJSON = (jsonUrl, cb) => {

  fetch(jsonUrl, {
    mode: 'cors',
    method: 'GET',
    headers: { "Content-Type": "application/json; charset=utf-8" }
  })
  .then(res => res.json())
  .then(response => {
    cb(response);
  })
  .catch((err) => {
    console.error(`Could not load ${jsonUrl}`);
    console.log(err);
  });
};

export const setEmbedDimensions = (w, h, noRatio) => {
  const dimensionCss = {'max-width': w + 'px', 'max-height': h + 'px' };
  $('.europeana-media-embed').css(dimensionCss);
  if(!noRatio){
    const pct = (h / w) * 100;
    $('.player-wrapper').css('padding-top', `${pct}%`);
  }
};

/*
export const loadVideo = () => {
  if (options.temporal) {
    manifest = `${embedHost}${options.embedid}/t/${options.temporal}`;
  }
  initialisePlayer($('.player-wrapper'));
};
*/

export const initialiseAttribution = (manifestJsonld, mediaMode) => {

  let htmlAttribution = manifestJsonld.attribution.en;
  let btnInfo         = $('<span class="btn btn-info"></span>').appendTo(
    ['audio', 'video'].indexOf(mediaMode) > -1 ? $('.controls-container') : $('.info')
  );

  // TODO: temp code until API supplies this markup
  if(typeof htmlAttribution !== 'string'){
    const generateRightsList = () => {
      let rightItems = ['cc', 'by', 'sa'].map((key) => `<li class="icon-${key}"></li>`).join('');
      return `<ul class="rights-list">${rightItems}</ul>`;
    };

    let testLicense = 'https://creativecommons.org/licenses/by-sa/2.0/';
    let about      = 'https://www.europeana.eu/portal/record/2022362/_Royal_Museums_Greenwich__http___collections_rmg_co_uk_collections_objects_573492';
    htmlAttribution = ['Title', 'Creator', 'Date', 'Institution', 'Country', 'Rights'].map((name) => {
      return `
        <span class="field">
          <span class="fname">${name}</span>
          <span class="fvalue"
            ${name === 'Rights' ? 'property="cc:License"' : '' }
          >${name === 'Title' ? '<a data-name="title"></a>' :
            name === 'Institution' ? '<a href="http://europeana.eu" target="_blank" rel="noopener">' + name + ' goes here</a>' :
            name === 'Rights' ? generateRightsList() + `<a href="${testLicense}" target="_blank" rel="noopener">Copyright</a>` :
              name + ' goes here'}</span></span>`;
    }).join('');
    htmlAttribution = `<div class="attribution" about="${about}">${htmlAttribution}</div>`;
    htmlAttribution = `<style type="text/css">
      @import url('/icons/style.css');
      .field:not(:last-child)::after{
        content: ', ';
      }
      .fname{
        display: none;
      }
      .rights-list{
        display: inline;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .rights-list li{
        display: inline;
        margin-right: 4px;
      }
      .rights-list li a{
        text-transform: uppercase;
      }
      </style>` + htmlAttribution;
  }
  // end temp code

  let attribution = $(htmlAttribution).appendTo($('.info'));

  setLinkElementData($('[data-name=title]'), manifestJsonld);

  attribution.on('click', (e) => {
    if((e.target.nodeName.toUpperCase() === 'A')){
      e.stopPropagation();
      return;
    }
    attribution.removeClass('showing');
  });

  btnInfo.on('click', () => {
    attribution.toggleClass('showing');
  });
};

export const setLinkElementData = ($el, manifest) => {
  if(manifest.label) {
    const text = manifest.label[Object.keys(manifest.label)[0]];
    $el.text(text);
  }
  if(manifest.seeAlso && manifest.seeAlso.length > 0 && manifest.seeAlso[0].id){
    let url = manifest.seeAlso[0].id;
    url = url.replace('api/v2', 'portal').replace('json-ld', 'html');
    $el.attr('href', url);
    $el.attr('target', '_blank');
    $el.attr('rel', 'noopener');
  }
};

export const initialiseEmbed = (mediaMode) => {

  $('.player-wrapper').removeClass('loading');
  // getSubtitles();

  let manifestJsonld = player.manifest.__jsonld;

  initialiseAttribution(manifestJsonld, mediaMode);

  setLinkElementData($('.title-link'), manifestJsonld);
  $('.logo-link').removeAttr('style');

  if (duration == -1 && manifestJsonld.items[0].duration) {
    duration = manifestJsonld.items[0].duration;
  }
}

/*
function getSubtitles() {
  let subtitles = {};
  let link = `${embedHost}${options.embedid}/subtitles`
  if (options.temporal) {
    link += `/t/${options.temporal}`;
  }

  loadJSON(link, (response) => {
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
  });
}
*/

export const initialisePlayer = (playerWrapper, mediaUrl, mediaMode) => {
  let p = new EuropeanaMediaPlayer(playerWrapper, {manifest: mediaUrl}, {mode: "player", manifest: mediaUrl});
  player = p.player;

  player.avcomponent.on('mediaerror', function() {
    console.log('mediaerror (reinit)')
    initialiseEmbed(mediaMode);
  });
  player.avcomponent.on('mediaready', function() {
    console.log('mediaready (reinit)')
    if(mediaMode === 'audio'){
      $('.eups-player').removeAttr('style');
    }
    initialiseEmbed(mediaMode);
  });
  player.avcomponent.on('play', () => {
    playing = true;
    playerWrapper.addClass('playing');
  });
  player.avcomponent.on('pause', () => {
    playing = false;
    playerWrapper.removeClass('playing');
  });
}

export const getAllUrlParams = (url) => {
  // get query string from url (optional) or window
  let queryString = url ? url.split('?')[1] : window.location.search.slice(1);
  let obj = {};
  if (queryString) {

    // remove hash param
    queryString = queryString.split('#')[0];

    var arr = queryString.split('&');

    for (var i = 0; i < arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // set parameter name and value (use 'true' if empty)
      var paramName = a[0];
      var paramValue = typeof (a[1]) === 'undefined' ? true : decodeURIComponent(a[1]);

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
