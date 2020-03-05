import * as index  from '../src/index';

var $ = require("jquery");

describe('index functions', () => {

  beforeAll(() => {
    //const fixture = '<div class="player-wrapper loading"></div>';
    //document.body.insertAdjacentHTML('afterbegin', fixture);
  });

  it('should get the url parameters', () => {
    let testUrl = 'http://video-embed?t=25,33';
    let params = index.getAllUrlParams(testUrl);
    expect(params).toBeTruthy();
    expect(params.t).toEqual('25,33');
  });

  it('should increment the currentMediaItem when done', () => {
    index.currentMediaItem = -1;
    //expect(index.currentMediaItem).toEqual(0);
    index.mediaHasEnded(true);
    //expect(index.currentMediaItem).toEqual(1);
  });

  it('should initialise the embed', () => {
    const fixture = '<div class="player-wrapper loading"></div>';
    document.body.insertAdjacentHTML('afterbegin', fixture);
    let wrapperEl = document.querySelector('.player-wrapper');
    expect(wrapperEl.classList.contains('loading')).toBeTruthy();
    //index.initializeEmbed();
    //expect(wrapperEl.classList.contains('loading')).toBeFalsy();
  });
});
