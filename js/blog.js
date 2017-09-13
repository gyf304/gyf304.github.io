var blog = {
  config: {},
  content: {}
};

(function(){
  blog.config = BLOG_CONFIG;

  blog.parsers = {
    md: function(url) {
      return axios.get(url + '?time=' + (new Date()).getTime().toString(), {responseType: 'text'})
      .then(function (response){
        var path = url.substring(0, url.lastIndexOf("/")+1);
        var str = response.data;
        var converter = new showdown.Converter({noHeaderId: true});
        var result = converter.makeHtml(str);
        return result.replace(/src=\"((?!\w*?:\/\/|\/).*?)\"/g, 'src="' + path + '$1"');
        // fix relative path issues
      });
    }
  };

  blog.utils = {
    strip: function(str) {
      return str.replace(/\s/g, '-').replace(/[^a-zA-Z0-9\-]/g, '').replace(/\-+/g, '-').toLowerCase();
    },
    convertToAbsUrl: function (baseUrl, relUrl) {
      return relUrl.replace(/^((?!\w*?:\/\/|\/).*?)$/g, baseUrl + '$1');
    },
    getUrlParams: function() {
      var params = {};
      var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
      function(m,key,value) {
          params[key] = value;
      });
      return params;
    },
    toParamPath: function(path) {
      return blog.config.root + '?path=' + encodeURIComponent(path);
    }
  }

  blog.content.notfound = {
    title: "Not found",
    img: null,
    date: '2000-00-00',
    content: "",
    html: "Oops, nothing is here...",
    load: function() {}
  };

  function initArticleLoader (article) { // lazy loading
    article.load = function() {
      var url = blog.utils.convertToAbsUrl(blog.config.dataPath, article.content);
      var type = url.substring(url.lastIndexOf(".")+1);
      var parser = blog.parsers[type];
      if (typeof parser === "function") {
        var reqUrl = url;
        return parser(reqUrl).then(function(resHtml){article.html = resHtml}).catch(function(err){console.warn(err)});
      } else {return new Promise(function(resolve, reject){reject('Not loaded')})}
    };
  }

  blog.loadPostsInfo = function() {
    if (blog.content.posts && blog.content.posts.length > 0) {
      return (new Promise(function(resolve, reject){resolve()}));
    }
    return axios.get(blog.config.root + 'data/posts.json?time=' + (new Date()).getTime().toString())
    .then(function (response) {
      var placeholders = response.data;
      for (var i = 0; i < placeholders.length; i++) {
        var p = placeholders[i];
        if (!p.hasOwnProperty('html')) p.html = '';
        initArticleLoader(p);
      }
      placeholders.sort(function(a,b){
        return (new Date(a.date).getTime()) - (new Date(b.date).getTime()); 
      });
      blog.content.posts = placeholders;
    })
    .catch(function (error) {
      console.warn(error);
    });
  };

  blog.loadPagesInfo = function() {
    if (blog.content.pages && blog.content.pages.length > 0) {
      return (new Promise(function(resolve, reject){resolve()}));
    }
    return axios.get(blog.config.root + 'data/pages.json?time=' + (new Date()).getTime().toString())
    .then(function (response) {
      var placeholders = response.data;
      for (var key in placeholders) {
        if (placeholders.hasOwnProperty(key)) {
          var p = placeholders[key];
          if (!p.hasOwnProperty('html')) p.html = '';
          p.id = key.toString();
          initArticleLoader(p);
        }
      }
      blog.content.pages = placeholders;
    })
    .catch(function (error) {
      console.warn(error);
    });
  };
})();
