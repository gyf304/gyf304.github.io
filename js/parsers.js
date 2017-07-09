BLOG_PARSERS = {
  md: function(str) {
    var converter = new showdown.Converter({noHeaderId: true});
    var result = converter.makeHtml(str);
    return result;
  }
};
