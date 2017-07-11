(function(){

var params = blog.utils.getUrlParams();
var page = {title: 'Not Found', html: ''};

blog.view = {};
blog.loadPagesInfo()
.then(function(){
  var urlid = params.id;
  var candidate = blog.content.pages[urlid];
  if (!candidate) return new Promise(function(resolve, reject){resolve()});
  page = candidate;
  return candidate.load();
})
.then(function(){
  blog.view.app = new Vue({
    el: '#app',
    data: {page: page},
    methods: {
      toUrl: function(article){
        return blog.config.root + '#/pages/' + article.id;
      }
    }
  });
})

})();
