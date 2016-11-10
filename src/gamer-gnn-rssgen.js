/* Credit: https://gist.github.com/thinkAmi */

function doGet(e) {
  var rss = makeRss();
  var timezone = 'GMT+8:00';
  var language = 'zh-TW';
  var atomLink = ScriptApp.getService().getUrl();
  var link = 'https://gnn.gamer.com.tw/';
  var rssLink = 'https://gnn.gamer.com.tw/rss.xml';
  var rssTitle = '巴哈姆特 GNN 新聞網';

  rss.setLink(link);
  rss.setLanguage(language);
  rss.setAtomlink(atomLink);
  rss.setTitle(rssTitle);
  rss.setDescription(rssTitle);

  var xml = UrlFetchApp.fetch(rssLink).getContentText();
  var document = XmlService.parse(xml);
  var root = document.getRootElement();
  var entries = root.getChild('channel').getChildren('item');
  for (var i = 0; i < entries.length; i++) {
    var url = entries[i].getChild('link').getText();
    var pubDate = entries[i].getChild('pubDate').getText();
    var html = UrlFetchApp.fetch(url).getContentText();
    var p = /<h1.+>(.+?)<\/h1>[^]*?<!--新聞內容開始-->([^]*?)<!--新聞內容結束-->/;
    var m = p.exec(html);
    var title = m[1];
    var desc = m[2];
    Logger.log(title);
    Logger.log(pubDate);
    Logger.log(new Date(pubDate));

    rss.addItem({
      title: title,
      link: url,
      description: desc.replace(/data-src=/g, 'src='),
      pubDate: new Date(pubDate),
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
