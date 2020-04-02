import { fetch as fetchPolyfill } from 'whatwg-fetch';
import * as index  from '../src/index';
require('jasmine-ajax');

const $ = require("jquery");

describe('index functions', () => {

  let originalFetch;
  const attributionJSON = {"requiredStatement": { "en": ["<div class=\"attribution\">text</div>"]}};


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

  describe('XYWH functions', () => {

    const imgW = 1000;
    const imgH = 1000;
    const halfW = imgW / 2;
    const halfH = imgH / 2;

    it('should validate xywh parameters (pixels)', () => {

      // Coords > 0
      expect(index.isValidXYWH(false, imgW, imgH, -1, 0, imgW, imgH)).toBeFalsy();
      expect(index.isValidXYWH(false, imgW, imgH, 0, -1, imgW, imgH)).toBeFalsy();
      expect(index.isValidXYWH(false, imgW, imgH, 0, 0,  imgW, imgH)).toBeTruthy();

      // Total W should not exceed imgW
      expect(index.isValidXYWH(false, imgW, imgH, halfW, 0, halfW + 1, imgH)).toBeFalsy();
      expect(index.isValidXYWH(false, imgW, imgH, halfW, 0, halfW, imgH)).toBeTruthy();

      // Total H should not exceed imgH
      expect(index.isValidXYWH(false, imgW, imgH, 0, halfH, imgW, halfH + 1)).toBeFalsy();
      expect(index.isValidXYWH(false, imgW, imgH, 0, halfH, imgW, halfH)).toBeTruthy();

      // PERCENT

      // Coords > 0
      expect(index.isValidXYWH(true, imgW, imgH, -1, 0, 100, 100)).toBeFalsy();
      expect(index.isValidXYWH(true, imgW, imgH, 0, -1, 100, 100)).toBeFalsy();
      expect(index.isValidXYWH(true, imgW, imgH, 0, 0,  100, 100)).toBeTruthy();

      // Total W should not exceed imgW
      expect(index.isValidXYWH(true, imgW, imgH, 50, 0, 51, 100)).toBeFalsy();
      expect(index.isValidXYWH(true, imgW, imgH, 50, 0, 50, 100)).toBeTruthy();

      // Total H should not exceed imgH
      expect(index.isValidXYWH(true, imgW, imgH, 0, 50, 100, 51)).toBeFalsy();
      expect(index.isValidXYWH(true, imgW, imgH, 0, 50, 100, 50)).toBeTruthy();
    });

    it('should calculate the pixel offset', () => {
      expect(index.getOffsetPixels(1000, 250, 0)).toEqual(0);
      expect(parseInt(index.getOffsetPixels(1000, 250, 250))).toEqual(33);
      expect(parseInt(index.getOffsetPixels(1000, 250, 500))).toEqual(66);
      expect(index.getOffsetPixels(1000, 250, 750)).toEqual(100);
    });

    it('should calculate the percentage offset', () => {
      expect(index.getOffsetPercent(0, 100)).toEqual(0);
      expect(parseInt(index.getOffsetPercent(25, 50))).toEqual(50);
      expect(parseInt(index.getOffsetPercent(25, 75))).toEqual(100);
      expect(parseInt(index.getOffsetPercent(50, 50))).toEqual(100);
    });

    it('should format the dimension data', () => {
      const d = index.dimensionData(1, 2, 3, 4);
      expect(d.size).toEqual(1);
      expect(d.position.x).toEqual(2);
      expect(d.position.y).toEqual(3);
      expect(d.top).toEqual(4);
    });

    it('should get pixel-defined fragment data', () => {
      let d = index.getFragmentPixel(imgW, imgH, 0, 0, imgW, imgH);
      expect(d.size).toEqual(100);
      expect(d.position.x).toEqual(0);
      expect(d.position.y).toEqual(0);
      expect(d.top).toEqual(100);

      d = index.getFragmentPixel(imgW, imgH, 0, 0, halfW, imgH);
      expect(d.size).toEqual(200);
      expect(d.position.x).toEqual(0);
      expect(d.position.y).toEqual(0);
      expect(d.top).toEqual(200);

      // q1 -> q4
      d = index.getFragmentPixel(imgW, imgH, 0, 0, halfW, halfH);
      expect(d.size).toEqual(200);
      expect(d.position.x).toEqual(0);
      expect(d.position.y).toEqual(0);
      expect(d.top).toEqual(100);

      d = index.getFragmentPixel(imgW, imgH, halfW, 0, halfW, halfH);
      expect(d.size).toEqual(200);
      expect(d.position.x).toEqual(100);
      expect(d.position.y).toEqual(0);
      expect(d.top).toEqual(100);

      d = index.getFragmentPixel(imgW, imgH, 0, halfH, halfW, halfH);
      expect(d.size).toEqual(200);
      expect(d.position.x).toEqual(0);
      expect(d.position.y).toEqual(100);
      expect(d.top).toEqual(100);

      d = index.getFragmentPixel(imgW, imgH, halfW, halfH, halfW, halfH);
      expect(d.size).toEqual(200);
      expect(d.position.x).toEqual(100);
      expect(d.position.y).toEqual(100);
      expect(d.top).toEqual(100);
    });

    it('should get percentage-defined fragment data', () => {
      let d = index.getFragmentPercent(imgW, imgH, 0, 0, 100, 100);
      expect(d.size).toEqual(100);
      expect(d.position.x).toEqual(0);
      expect(d.position.y).toEqual(0);
      expect(d.top).toEqual(100);

      d = index.getFragmentPercent(imgW, imgH, 50, 0, 50, 100);
      expect(d.size).toEqual(200);
      expect(d.position.x).toEqual(100);
      expect(d.position.y).toEqual(0);
      expect(d.top).toEqual(200);

      d = index.getFragmentPercent(imgW, imgH, 0, 50, 100, 50);
      expect(d.size).toEqual(100);
      expect(d.position.x).toEqual(0);
      expect(d.position.y).toEqual(100);
      expect(d.top).toEqual(50);

      d = index.getFragmentPercent(imgW, imgH, 50, 50, 50, 50);
      expect(d.size).toEqual(200);
      expect(d.position.x).toEqual(100);
      expect(d.position.y).toEqual(100);
      expect(d.top).toEqual(100);
    });

    it('should handle media fragment urls', () => {
      const params = {
        manifestUrl: '',
        xywh: [0, 0, imgW, imgH].join(',')
      }
      expect(index.handleMediaFragment('', imgW, imgH, params)).toBeTruthy();
      params.xywh = [imgW, imgH, imgW, imgH].join(',')
      expect(index.handleMediaFragment('', imgW, imgH, params)).toBeFalsy();
      params.xywh = 'percent:' + [0, 0, 100, 100].join(',')
      expect(index.handleMediaFragment('', imgW, imgH, params)).toBeTruthy();
      params.xywh = 'percent:' + [100, 100, 100, 100].join(',')
      expect(index.handleMediaFragment('', imgW, imgH, params)).toBeFalsy();
    });

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

  it('should load JSON (on load)', (done) => {

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
      expect(spy.cb).toHaveBeenCalledTimes(1);
      done();

      //index.fnOnLoad();
      //setTimeout(function(){
      //  expect(spy.cb).toHaveBeenCalledTimes(2);
      //  done();
      //}, 1);
    }, 1);
  });

  it('should initialise the attribution', () => {
    const fixture = '<div class="info"></div>';
    document.body.insertAdjacentHTML('afterbegin', fixture);

    expect($('.info .attribution').length).toBeFalsy();
    expect($('.info .btn-info').length).toBeFalsy();

    index.initialiseAttribution(attributionJSON, 'image');

    expect($('.info .attribution').length).toBeTruthy();
    expect($('.info .btn-info').length).toBeTruthy();
  });

  it('should show and hide the attribution', () => {
    index.initialiseAttribution(attributionJSON, 'image');

    expect($('.info .attribution').hasClass('showing')).toBeFalsy();
    $('.info .btn-info').click();
    expect($('.info .attribution').hasClass('showing')).toBeTruthy();
    $('.info .attribution').click();
    expect($('.info .attribution').hasClass('showing')).toBeFalsy();
  });

  it('should set link element data', () => {
    const url1 = 'http://www.europeana.eu/api/v2/record/abc/123.json-ld';
    const url2 = 'http://www.europeana.eu/portal/record/abc/123.html';
    const testTitle = 'Test Title';

    const $titleLink = $('<a class="title-link"></a>');

    expect($titleLink.text()).toBeFalsy();
    expect($titleLink.attr('href')).toBeFalsy();

    index.setLinkElementData($titleLink, {});

    expect($titleLink.text()).toBeFalsy();
    expect($titleLink.attr('href')).toBeFalsy();

    index.setLinkElementData($titleLink, {
      label: {en: [testTitle]},
      seeAlso: [{ id: url1 }]
    });

    expect($titleLink.text()).toEqual(testTitle);
    expect($titleLink.attr('href')).toEqual(url2);
  });

  it('should set the dimensions', () => {
    const fixture = '<div class="europeana-media-embed"></div>';
    document.body.insertAdjacentHTML('afterbegin', fixture);
    expect($('.europeana-media-embed').attr('style')).toBeFalsy();
    index.setEmbedDimensions(1, 2);
    expect($('.europeana-media-embed').attr('style')).toBeTruthy();
  });

});
