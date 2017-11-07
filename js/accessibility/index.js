blog.view = {};
blog.loadPostsInfo()
.then(blog.loadPagesInfo)
.then(function(){
  blog.view.app = new Vue({
    el: '#app',
    data: {
      posts: blog.content.posts,
      pages: blog.content.pages
    },
    methods: {
      toPostUrl: function(article){
        return 'post.html?date=' + article.date + '&title=' + blog.utils.strip(article.title);
      },
      toPageUrl: function(article){
        return 'page.html?id=' + article.id;
      },
      toPostUrlHtml5: function(article){
        return blog.utils.toParamPath('/posts/' + article.date + '/' + blog.utils.strip(article.title));
      },
      toPageUrlHtml5: function(article){
        return blog.utils.toParamPath('/pages/' + article.id);
      }
    }
  });
})