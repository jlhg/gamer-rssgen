/* Credit: https://gist.github.com/thinkAmi */

function doGet(e) {
  var bsn = e.parameter.bsn;
  var params = '?bsn=' + bsn;
  var rss = makeRss();
  var link = 'https://forum.gamer.com.tw/B.php' + params;
  var timezone = 'GMT+8:00';
  var language = 'zh-TW';
  var atomLink = ScriptApp.getService().getUrl() + params;

  rss.setLink(link);
  rss.setLanguage(language);
  rss.setAtomlink(atomLink);

  var html = UrlFetchApp.fetch(link).getContentText();
  var rssTitle = /<title>(.+?)<\/title>/.exec(html)[1];
  Logger.log(rssTitle);
  rss.setTitle(rssTitle);
  rss.setDescription(rssTitle);

  var match;
  var pattern = /<tr (class="FM-row")?>[^]*?<td class="FM-blist3"[^]*?href=.+?>(.+?)<\/a>[^]*?<td class="FM-blist4">[^]*?<td class="FM-blist6">[^]*?href="(.+?)".+?target="_blank">(.+?)<\/a>/g;

  while (match = pattern.exec(html)) {
    var url = match[3];
    if (/^C\.php/.exec(url)) {
      url = 'https://forum.gamer.com.tw/' + url;
    } else if (/^\/\/forum/.exec(url)) {
      url = 'https:' + url;
    } else {
      // 本討論串已無文章
      continue;
    }

    Logger.log(url);

    var commentId = /tnum=(\d+)/.exec(url)[1];
    var p2 = new RegExp('class="FM-cbox3"[^]*?<a href=.+?>#' + commentId + '<\/a>([^]*?)<\/p><\/div>[^]*?class="FM-cbox4"><span>發表：(.+?)<\/span>[^]*?class="FM-cbox5">[^]*?target="_blank">(.+?)<\/a>[^]*?<!--文章內文-->([^]*?)<!--文章內文結束-->');
    var html2 = UrlFetchApp.fetch(url).getContentText();
    var m2;
    var title;
    var pubDate;
    var author;
    var desc;

    m2 = p2.exec(html2);
    if (!m2) {
      // 文章已刪除
      continue;
    }
    title = m2[1];
    pubDate = m2[2];
    author = m2[3];
    desc = m2[4];

    Logger.log(commentId);
    Logger.log(title);
    Logger.log(pubDate);
    Logger.log(formatDate(pubDate));
    Logger.log(author);
    // Logger.log(desc);
    rss.addItem({
      title: title.trim() + ' (#' + commentId + ')' + ' (' + author + ')',
      link: url,
      description: desc.trim(),
      pubDate: formatDate(pubDate),
      timezone: timezone,
    });
  }

  return ContentService.createTextOutput(rss.toString())
  .setMimeType(ContentService.MimeType.RSS);
}

var makeRss = function(){
  var channel = XmlService.createElement('channel');
  var root = XmlService.createElement('rss')
  .setAttribute('version', '2.0')
  .setAttribute('xmlnsatom', "http://www.w3.org/2005/Atom")
  .addContent(channel);

  var title = '';
  var link = '';
  var description = '';
  var language = '';
  var atomlink = '';
  var items = {};

  var createElement = function(element, text){
    return XmlService.createElement(element).setText(text);
  };


  return {
    setTitle: function(value){ title = value; },
    setLink: function(value){ link = value; },
    setDescription: function(value){ description = value; },
    setLanguage: function(value){ language = value; },
    setAtomlink: function(value){ atomlink = value; },

    addItem: function(args){
      if (typeof args.title === 'undefined') { args.title = ''; }
      if (typeof args.link === 'undefined') { args.link = ''; }
      if (typeof args.description === 'undefined') { args.description = ''; }
      if (!(args.pubDate instanceof Date)) { throw 'pubDate Missing'; }
      if (typeof args.timezone === 'undefined') { args.timezone = "GMT"; }
      if (typeof args.guid === 'undefined' && typeof args.link === 'undefined') { throw 'GUID ERROR'; }

      var item = {
        title: args.title,
        link: args.link,
        description: args.description,
        pubDate: Utilities.formatDate(args.pubDate, args.timezone, "EEE, dd MMM yyyy HH:mm:ss Z"),
        guid: args.guid === 'undefined' ? args.link : args.link
      };

      items[item.guid] = item;
    },

    toString: function(){
      channel.addContent(XmlService.createElement("atomlink")
                         .setAttribute('href', atomlink)
                         .setAttribute('rel', 'self')
                         .setAttribute('type', 'application/rss+xml')
                        );

      channel.addContent(createElement('title', title));
      channel.addContent(createElement('link', link));
      channel.addContent(createElement('description', description));
      channel.addContent(createElement('language', language));


      for (var i in items) {
        channel.addContent(
          XmlService
          .createElement('item')
          .addContent(createElement('title', items[i].title))
          .addContent(createElement('link', items[i].link))
          .addContent(createElement('description', items[i].description))
          .addContent(createElement('pubDate', items[i].pubDate))
          .addContent(createElement('guid', items[i].guid))
        );
      }

      var document = XmlService.createDocument(root);
      var xml = XmlService.getPrettyFormat().format(document);

      var result = xml.replace('xmlnsatom', 'xmlns:atom')
      .replace('<atomlink href=','<atom:link href=');

      return result;
    }
  };
};

var formatDate = function(dateString) {
  var p = /(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)/;
  var m = p.exec(dateString);
  var year = m[1];
  var month = m[2];
  var day = m[3];
  var hour = m[4];
  var minute = m[5];
  var second = m[6];
  return new Date(year, month - 1, day, hour, minute, second);
};
