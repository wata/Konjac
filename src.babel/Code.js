'use strict'

global.doGet = (e) => {
  const slack = getSlackService()
  let tmpl = HtmlService.createTemplateFromFile('Page')
  tmpl.authorizationUrl = slack.getAuthorizationUrl()
  tmpl.userEmail = Session.getActiveUser().getEmail()
  tmpl.slackUser = null
  if (slack.hasAccess()) {
    const auth = getSlackAuthInfo(slack)
    if ('user' in auth) {
      tmpl.slackUser = auth['user']
    }
  }
  return HtmlService.createHtmlOutput(tmpl.evaluate())
}

global.revoke = () => {
  getSlackService().reset()
  return true
}

global.getSlackService = () => {
  const props = PropertiesService.getScriptProperties()
  const SLACK_CLIENT_ID = props.getProperty('SLACK_CLIENT_ID')
  const SLACK_CLIENT_SECRET = props.getProperty('SLACK_CLIENT_SECRET')

  return OAuth2.createService('slack')
    .setAuthorizationBaseUrl('https://slack.com/oauth/authorize')
    .setTokenUrl('https://slack.com/api/oauth.access')
    .setClientId(SLACK_CLIENT_ID)
    .setClientSecret(SLACK_CLIENT_SECRET)
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties())
    .setScope('bot chat:write:bot commands')
}

global.authCallback = (res) => {
  const slack = getSlackService()
  const authorized = slack.handleCallback(res)
  if (authorized) {
    return HtmlService.createHtmlOutput(`連携完了 <a target="_top" href="${getWebAppUrl()}">戻る</a>`)
  } else {
    return HtmlService.createHtmlOutput(`認証できませんでした <a target="_top" href="${getWebAppUrl()}">戻る</a>`)
  }
}

global.getWebAppUrl = () => {
  return ScriptApp.getService().getUrl()
}

global.include = (filename) => {
  return HtmlService.createHtmlOutputFromFile(filename).getContent()
}

global.getSlackAuthInfo = (slack) => {
  const res = UrlFetchApp.fetch(`https://slack.com/api/auth.test?token=${slack.getAccessToken()}`)
  return JSON.parse(res.getContentText())
}

global.doPost = (e) => {
  const props = PropertiesService.getScriptProperties()
  const SLACK_VERIFY_TOKEN = props.getProperty('SLACK_VERIFY_TOKEN')
  if (SLACK_VERIFY_TOKEN !== e.parameter.token) {
    throw new Error('Invalid token')
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

  const username = e.parameter.user_name
  const command = e.parameter.command
  const text = e.parameter.text
  const traslation = command === '/ja' ? LanguageApp.translate(text, 'ja', 'en')
    : (command === '/en' ? LanguageApp.translate(text, 'en', 'ja') : 'わかりませんでした :innocent:')
  const res = {
    response_type: 'in_channel',
    attachments: [
      {
        color: '#47a7ee',
        author_name: username,
        text: traslation
      }
    ]
  }

  return ContentService
    .createTextOutput(JSON.stringify(res))
    .setMimeType(ContentService.MimeType.JSON)
}
