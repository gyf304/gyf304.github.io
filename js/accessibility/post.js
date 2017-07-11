(function(){

var params = blog.utils.getUrlParams();
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
      toUrl: function(article){
        return blog.config.root + '#/posts/' + article.date + '/' + blog.utils.strip(article.title);
      }
    }
  });
})

})();
