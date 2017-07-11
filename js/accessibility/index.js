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
      }
    }
  });
})