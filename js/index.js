blog.view = {}
blog.view.components = {};

blog.view.components.navbar = {
  template: '#nav-template',
  name: 'navbar',
  props: ['title', 'links'],
  data: function() { return {'active': false} }
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
      changePage: function(page) {
        this.$router.switch('/posts/page/' + page);
      }
    },
    components: { 'article-list': blog.view.components.articleList }
};

blog.view.components.recentPosts = {
  template: '#recent-posts-template',
    data: function() { return { rawPosts: blog.content.posts }; },
    computed: {
      posts: function() {
        var recentIdx = this.rawPosts.length - blog.config.postsRecentSize;
        if (recentIdx < 0) recentIdx = 0;
        return this.rawPosts.slice(recentIdx).reverse();
      }
    },
    methods: {
      goToPagedPosts: function(page) {
        var pages = Math.ceil(this.rawPosts.length / blog.config.postsPageSize);
        this.$router.switch('/posts/page/' + (pages - 1 + blog.config.pageStartIndex));
      }
    },
    created: function() {},
    components: { 'article-list': blog.view.components.articleList }
};

blog.view.components.page = {
  template: '#page-template',
  name: 'page',
  props: ['id'],
  data: function() {
    var page = blog.content.pages[this.id];
    if (!page) {
      return blog.content.notfound;
    }
    return page;
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
      return blog.content.notfound;
    }
    return candidates[0];
  },
  components: { 'blog-article': blog.view.components.article }
}

blog.routes = [
  { path: '/posts/page/:page', component: blog.view.components.pagedPosts, props: true },
  { path: '/posts/recent', component: blog.view.components.recentPosts },
  { path: '/posts/date/:urldate/:urltitle', component: blog.view.components.post, props: true },
  { path: '/pages/:id', component: blog.view.components.page, props: true },
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



