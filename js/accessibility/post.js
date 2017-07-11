(function(){

function getUrlParams() {
  var params = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
  function(m,key,value) {
      params[key] = value;
  });
  return params;
}

var params = getUrlParams();
var post = {title: 'Not Found', html: ''};

blog.view = {};
blog.loadPostsInfo()
.then(function(){
  var urltitle = params.title;
  var urldate = params.date;
  var candidates = blog.content.posts.filter(function(e){return (e.date == urldate && blog.utils.strip(e.title) == urltitle)});
  if (candidates.length == 0) return new Promise(function(resolve, reject){resolve()});
  post = candidates[0];
  return candidates[0].load();
})
.then(function(){
  blog.view.app = new Vue({
    el: '#app',
    data: {post: post},
    methods: {
      toPostUrl: function(article){
        return 'post.html?date=' + article.date + '&title=' + blog.utils.strip(article.title);
      }
    }
  });
})

})();
