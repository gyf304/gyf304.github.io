BLOG_UTILS = {
  strip: function(str) {
    return str.replace(/ /g, '-').replace(/[^a-zA-Z0-9\-]/g, '').toLowerCase();
  }
}