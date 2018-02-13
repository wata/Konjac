var global = this;function doGet() {
}
function revoke() {
}
function getSlackService() {
}
function authCallback() {
}
function getWebAppUrl() {
}
function include() {
}
function getSlackAuthInfo() {
}
function doPost() {
}(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
'use strict';

global.doGet = function (e) {
  var slack = getSlackService();
  var tmpl = HtmlService.createTemplateFromFile('Page');
  tmpl.authorizationUrl = slack.getAuthorizationUrl();
  tmpl.userEmail = Session.getActiveUser().getEmail();
  tmpl.slackUser = null;
  if (slack.hasAccess()) {
    var auth = getSlackAuthInfo(slack);
    if ('user' in auth) {
      tmpl.slackUser = auth['user'];
    }
  }
  return HtmlService.createHtmlOutput(tmpl.evaluate());
};

global.revoke = function () {
  getSlackService().reset();
  return true;
};

global.getSlackService = function () {
  var props = PropertiesService.getScriptProperties();
  var SLACK_CLIENT_ID = props.getProperty('SLACK_CLIENT_ID');
  var SLACK_CLIENT_SECRET = props.getProperty('SLACK_CLIENT_SECRET');

  return OAuth2.createService('slack').setAuthorizationBaseUrl('https://slack.com/oauth/authorize').setTokenUrl('https://slack.com/api/oauth.access').setClientId(SLACK_CLIENT_ID).setClientSecret(SLACK_CLIENT_SECRET).setCallbackFunction('authCallback').setPropertyStore(PropertiesService.getUserProperties()).setScope('bot chat:write:bot commands');
};

global.authCallback = function (res) {
  var slack = getSlackService();
  var authorized = slack.handleCallback(res);
  if (authorized) {
    return HtmlService.createHtmlOutput('\u9023\u643A\u5B8C\u4E86 <a target="_top" href="' + getWebAppUrl() + '">\u623B\u308B</a>');
  } else {
    return HtmlService.createHtmlOutput('\u8A8D\u8A3C\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F <a target="_top" href="' + getWebAppUrl() + '">\u623B\u308B</a>');
  }
};

global.getWebAppUrl = function () {
  return ScriptApp.getService().getUrl();
};

global.include = function (filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
};

global.getSlackAuthInfo = function (slack) {
  var res = UrlFetchApp.fetch('https://slack.com/api/auth.test?token=' + slack.getAccessToken());
  return JSON.parse(res.getContentText());
};

global.doPost = function (e) {
  var props = PropertiesService.getScriptProperties();
  var SLACK_VERIFY_TOKEN = props.getProperty('SLACK_VERIFY_TOKEN');
  if (SLACK_VERIFY_TOKEN !== e.parameter.token) {
    throw new Error('Invalid token');
  }

  // for debug
  // token=gIkuvaNzQIHg97ATvDxqgjtO
  // team_id=T0001
  // team_domain=example
  // enterprise_id=E0001
  // enterprise_name=Globular%20Construct%20Inc
  // channel_id=C2147483705
  // channel_name=test
  // user_id=U2147483697
  // user_name=Steve
  // command=/weather
  // text=94070
  // response_url=https://hooks.slack.com/commands/1234/5678
  // trigger_id=13345224609.738474920.8088930838d88f008e0

  var username = e.parameter.user_name;
  var command = e.parameter.command;
  var text = e.parameter.text;
  var traslation = command === '/ja' ? LanguageApp.translate(text, 'ja', 'en') : command === '/en' ? LanguageApp.translate(text, 'en', 'ja') : 'わかりませんでした :innocent:';
  var res = {
    response_type: 'in_channel',
    attachments: [{
      color: '#47a7ee',
      author_name: username,
      text: traslation
    }]
  };

  return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
