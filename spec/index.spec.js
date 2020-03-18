import { fetch as fetchPolyfill } from 'whatwg-fetch';
import * as index  from '../src/index';
require('jasmine-ajax');

const $ = require("jquery");

describe('index functions', () => {

  let originalFetch;

  beforeEach(function() {
    // mock window.fetch (see here: https://www.damirscorner.com/blog/posts/20200110-MockingFetchCallsWithJasmine.html)
    originalFetch = window.fetch;
    window.fetch = fetchPolyfill
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
    window.fetch = originalFetch;
  });

  it('should get the url parameters', () => {
    const tParams = '25,33';
    let testUrl = `http://video-embed?t=${tParams}`;
    let params = index.getAllUrlParams(testUrl);

    expect(params.t).toEqual(tParams);

    let manifestUrl = 'https://iiif.europeana.eu//presentation//08609//fe9c5449_9522_4a70_951b_ef0b27893ae9//manifest?format=3&wskey=api2demo';
    testUrl = 'localhost:9001?manifest=' + encodeURIComponent(manifestUrl);
    params = index.getAllUrlParams(testUrl);

    expect(params.manifest).toEqual(manifestUrl);
  });

  it('should load JSON', (done) => {

    const doneFn = jasmine.createSpy('success');
    const url = 'http://123.com';
    const spy = { cb: () => {}};

    spyOn(spy, 'cb');

    jasmine.Ajax.stubRequest(url).andReturn({
      responseJSON: { "a": 123 },
      contentType: 'application/json',
      status: 200
    });

    index.loadJSON(url, spy.cb);

    setTimeout(function(){
      expect(spy.cb).toHaveBeenCalled();
      done();
    }, 1);
  });

  it('should initialise the attribution', () => {
    const fixture = '<div class="info"></div>';
    document.body.insertAdjacentHTML('afterbegin', fixture);

    expect($('.info .attribution').length).toBeFalsy();
    expect($('.info .btn-info').length).toBeFalsy();

    index.initialiseAttribution({attribution: { en: '<dic class="attribution">text</div>'}});

    expect($('.info .attribution').length).toBeTruthy();
    expect($('.info .btn-info').length).toBeTruthy();
  });

  it('should show and hide the attribution', () => {
    index.initialiseAttribution({attribution: { en: '<dic class="attribution">text</div>'}});

    expect($('.info .attribution').hasClass('showing')).toBeFalsy();
    $('.info .btn-info').click();
    expect($('.info .attribution').hasClass('showing')).toBeTruthy();
    $('.info .attribution').click();
    expect($('.info .attribution').hasClass('showing')).toBeFalsy();
  });

  it('should set the dimensions', () => {
    const fixture = '<div class="player-wrapper loading"></div>';
    document.body.insertAdjacentHTML('afterbegin', fixture);
    expect($('.player-wrapper').attr('style')).toBeFalsy();
    index.setEmbedDimensions(1, 2);
    expect($('.player-wrapper').attr('style')).toBeTruthy();
  });

});
