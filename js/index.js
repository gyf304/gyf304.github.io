blog.view = {}
blog.view.components = {};

blog.view.components.navbar = {
  template: '#nav-template',
  name: 'navbar',
  props: ['title', 'links'],
  data: function() { return {'active': false} }
};

blog.view.components.comment = {
  template: '#comment-template',
  name: 'blog-comment',
  props: ['id', 'url', 'title', 'name'],
  data: function(){
    return {height: 0};
  },
  computed: {
    commentUrl: function() {
      return blog.config.root + 'comment.html' + '?id=' + encodeURIComponent(this.id) + '&url=' + encodeURIComponent(this.url) + '&title=' + encodeURIComponent(this.title) + '&name=' + encodeURIComponent(this.name);
    }
  },
  created: function() {
    var self = this;
    console.log('init');
    self.timerId = setInterval(function(){ 
      try{
        self.height = (self.$refs['iframe']).contentWindow.document.body.scrollHeight; 
      } catch(e) {}
    }, 500);
  },
  destroyed: function() {
    clearInterval(this.timerId);
  }
};

blog.view.components.article = {
  template: '#article-template',
  name: 'blog-article',
  props: ['title', 'img', 'date', 'html', 'load'],
  computed: {
    formattedDate: function() {
      return moment(this.date, 'YYYY-MM-DD').format('ddd, MMM DD YYYY');
    }
  },
  created: function(){ this.load(); },
  updated: function(){ this.load(); }
};

blog.view.components.articleList = {
  template: '#article-list-template',
  name: 'article-list',
  props: ['posts'],
  components: {'blog-article': blog.view.components.article}
};

blog.view.components.pagedPosts = {
  template: '#paged-posts-template',
    props: [ 'page' ],
    data: function() { return { posts: blog.content.posts }; },
    computed: {
      pagedPosts: function() {
        var pageSize = blog.config.postsPageSize;
        var startIndex = blog.config.pageStartIndex;
        var page = this.page;
        return this.posts.slice(pageSize * (page - startIndex), pageSize * (page - startIndex + 1)).reverse();
      },
      pagination: function() {
        var pages = Math.ceil(this.posts.length / blog.config.postsPageSize);
        var page = parseInt(this.$route.params.page);
        var buttons = [];
        var start = page - Math.floor(blog.config.postsPaginationLimit / 2);
        if (start < blog.config.pageStartIndex) start = blog.config.pageStartIndex;
        for (var i = 0; i < blog.config.postsPaginationLimit; i++) {
          if (start - blog.config.pageStartIndex + i >= pages) break;
          buttons.push(start + i);
        }
        return buttons.reverse();
      }
    },
    methods: {
      getPagePath: function(page) {
        return '/posts/page/' + page;
      },
      getPath: function(post) {
        return '/posts/' + post.date + '/' + blog.utils.strip(post.title);
      },
      toParamPath: blog.utils.toParamPath
    },
    components: { 'blog-article': blog.view.components.article }
};

blog.view.components.recentPosts = {
  template: '#recent-posts-template',
    data: function() { return { 
      rawPosts: blog.content.posts,
      pagedPostsPath: '/posts/page/' + (Math.ceil(blog.content.posts.length / blog.config.postsPageSize) - 1 + blog.config.pageStartIndex)
    }; },
    computed: {
      posts: function() {
        var recentIdx = this.rawPosts.length - blog.config.postsRecentSize;
        if (recentIdx < 0) recentIdx = 0;
        return this.rawPosts.slice(recentIdx).reverse();
      }
    },
    methods: {
      getPath: function(post) {
        return '/posts/' + post.date + '/' + blog.utils.strip(post.title);
      },
      toParamPath: blog.utils.toParamPath
    },
    created: function() {},
    components: { 'blog-article': blog.view.components.article }
};

blog.view.components.page = {
  template: '#page-template',
  name: 'page',
  props: ['urlid'],
  data: function() {
    var page = blog.content.pages[this.urlid];
    if (!page) {
      return {page: blog.content.notfound};
    }
    return {page: page};
  },
  components: { 'blog-article': blog.view.components.article }
}

blog.view.components.post = {
  template: '#post-template',
  name: 'post',
  props: ['urldate', 'urltitle'],
  data: function() {
    var self = this;
    var candidates = blog.content.posts.filter(function(e){return (e.date == self.urldate && blog.utils.strip(e.title) == self.urltitle)});
    if (candidates.length == 0) {
      return {post: blog.content.notfound};
    }
    return {post: candidates[0], 
      name: blog.config.disqusShortname, 
      postUrl: blog.config.site + blog.config.root + '#!/posts/' + self.urldate + '/' + self.urltitle,
      postId: 'post-' + self.urldate + '-' + self.urltitle
    };
  },
  components: { 'blog-article': blog.view.components.article, 'blog-comment': blog.view.components.comment }
}



blog.routes = [
  { path: '/posts/page/:page', component: blog.view.components.pagedPosts, props: true },
  { path: '/posts/recent', component: blog.view.components.recentPosts },
  { path: '/posts/:urldate/:urltitle', component: blog.view.components.post, props: true },
  { path: '/pages/:urlid', component: blog.view.components.page, props: true },
  { path: '*', redirect: '/posts/recent' }
];

blog.view.router = new VueRouter({
  routes: blog.routes,
  scrollBehavior: function (to, from, savedPosition) {
    return { x: 0, y: 0 };
  }
});

blog.view.router.switch = function(path, onComplete, onAbort) {
  blog.view.router.push(path, function(){
    //$('html, body').animate({ scrollTop: 0 }, 'fast');
    window && window.scroll(0,0);
    if (typeof onComplete === "function") onComplete();
  }, onAbort);
}


blog.loadPostsInfo()
.then(blog.loadPagesInfo)
.then(function(){
  blog.view.app = new Vue({
    el: '#app',
    router: blog.view.router,
    data: {
      title: blog.config.title,
      staticNavLinks: [
        { 
          name: 'Recent Posts',
          action: function(){blog.view.router.switch('/posts/recent')}
        }
      ]
    },
    computed: {
      navLinks: function() {
        var links = this.staticNavLinks.slice();
        for (var key in blog.content.pages) {
          if (blog.content.pages.hasOwnProperty(key)) {
            var e = blog.content.pages[key];
            var link = {
              name: e.title,
              action: function(){blog.view.router.switch('/pages/'+key)}
            };
            links.push(link);
          }
        }
        return links;
      }
    },
    components: {
      navbar: blog.view.components.navbar
    }
  });
  document.getElementById('app').className = '';
  document.getElementById('app-placeholder').className = 'cloak';
});
