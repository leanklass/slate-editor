'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var httpPreffixStrategy = exports.httpPreffixStrategy = function httpPreffixStrategy(href) {
  return href.search('https?://') >= 0 ? href : 'http://' + href;
};
var hasLinks = exports.hasLinks = function hasLinks(state) {
  return state.inlines.some(function (inline) {
    return inline.type === 'link';
  });
};
var getLink = exports.getLink = function getLink(state) {
  return state.inlines.filter(function (inline) {
    return inline.type === 'link';
  }).first();
};
var createLink = exports.createLink = function createLink(data) {
  return { type: 'link', data: data };
};
var hasMultiBlocks = exports.hasMultiBlocks = function hasMultiBlocks(state) {
  return state.blocks.size > 1;
};

var unlink = exports.unlink = function unlink(state) {
  return state.transform().unwrapInline('link').focus().apply();
};

var updateLinkStrategy = exports.updateLinkStrategy = function updateLinkStrategy(_ref) {
  var state = _ref.state,
      _ref$data = _ref.data,
      title = _ref$data.title,
      href = _ref$data.href,
      text = _ref$data.text,
      target = _ref$data.target;

  var transform = state.transform();

  if (state.isCollapsed) {
    transform.moveOffsetsTo(0, state.anchorText.characters.size);
  }

  transform.insertText(text).extend(text.length * -1).setInline({
    type: 'link',
    data: {
      title: title,
      href: href,
      text: text,
      target: target ? '_blank' : '_self'
    }
  });

  return transform.apply();
};

var insertLinkStrategy = exports.insertLinkStrategy = function insertLinkStrategy(state) {
  var transform = state.transform();

  if (hasLinks(state)) {
    transform.unwrapInline('link');
  } else if (state.isExpanded && !hasMultiBlocks(state)) {
    var startOffset = state.selection.startOffset;

    // fix offset 0 selection:
    // add a single white space and select forward white space
    if (startOffset === 0) {
      transform.insertText(' ' + state.anchorText.text).moveOffsetsTo(1, state.anchorText.characters.size + 1);
    }

    transform.wrapInline(createLink({ target: '_blank', openModal: true }));

    // fix offset 0 selection:
    // remove the white space added before
    if (startOffset === 0) {
      transform.moveOffsetsTo(0, 0).deleteBackward();
    }
  } else if (hasMultiBlocks(state)) {
    console.info('[SlateJS][LinkPlugin] has multiple blocks on selection');
  } else if (state.isCollapsed && !hasLinks(state)) {
    console.info('[SlateJS][LinkPlugin] selection collapsed, w/o links on selection');
  }

  return transform.apply();
};