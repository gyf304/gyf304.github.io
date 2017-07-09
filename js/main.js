var blog = {
  components: {},
  config: {},
  content: {}
};

blog.config = BLOG_CONFIG;

blog.parsers = BLOG_PARSERS;

blog.components.navbar = {
  template: '#nav-template',
  name: 'navbar',
  props: ['title', 'links'],
  data: function() { return {'active': false} }
};

blog.components.post = {
  template: '#post-template',
  name: 'post',
  props: ['title', 'img', 'date', 'html', 'load'],
  computed: {
    formattedDate: function() {
      return moment(this.date, 'YYYY-MM-DD').format('ddd, MMM DD YYYY');
    }
  },
  created: function(){ this.load(); },
  updated: function(){ this.load(); }
};

blog.components.pagedPosts = {
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
        this.$router.switch('/posts/page-' + page);
      }
    },
    components: { post: blog.components.post }
};

blog.components.recentPosts = {
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
        this.$router.switch('/posts/page-' + (pages - 1 + blog.config.pageStartIndex));
      }
    },
    created: function() {},
    components: { post: blog.components.post }
};

blog.components.page = {
  template: '#page-template',
  name: 'page',
  props: ['id'],
  data: function() {
    var page = blog.content.pages[this.id];
    if (!page) {
      page = {
        title: "Not found",
        img: null,
        content: "",
        html: "Oops, nothing is here...",
        load: function() {}
      }
    }
    return page;
  },
  computed: {
    formattedDate: function() {
      return moment(this.date, 'YYYY-MM-DD').format('ddd, MMM DD YYYY');
    }
  },
  created: function(){ this.load(); },
  updated: function(){ this.load(); }
}

blog.routes = [
  { path: '/posts/page-:page', component: blog.components.pagedPosts, props: true },
  { path: '/posts/recent', component: blog.components.recentPosts },
  { path: '/pages/:id', component: blog.components.page, props: true },
  { path: '*', redirect: '/posts/recent' }
];

blog.router = new VueRouter({
  routes: blog.routes,
  scrollBehavior: function (to, from, savedPosition) {
    return { x: 0, y: 0 };
  }
});

blog.router.switch = function(path, onComplete, onAbort) {
  blog.router.push(path, function(){
    $('html, body').animate({ scrollTop: 0 }, 'fast');
    if (typeof onComplete === "function") onComplete();
  }, onAbort);
}

blog.loadPostsInfo = function() {
  if (blog.content.posts && blog.content.posts.length > 0) {
    return (new Promise(function(resolve, reject){resolve()}));
  }
  return axios.get('data/posts.json?time=' + (new Date()).getTime().toString())
  .then(function (response) {
    var placeholders = response.data;
    for (var i = 0; i < placeholders.length; i++) {
      var p = placeholders[i];
      if (!p.hasOwnProperty('html')) p.html = '';
      p.load = function(post) { // lazy loading
        return function() {
          var postUrl = post.content;
          var postType = postUrl.substring(postUrl.lastIndexOf(".")+1);
          var postParser = blog.parsers[postType];
          if (typeof postParser === "function") {
            axios.get(postUrl  + '?time=' + (new Date()).getTime().toString(), {responseType: 'text'})
            .then(function(response){
              var str = response.data;
              var r = postParser(response.data);
              post.html = r;
            })
            .catch(function(err){console.warn(err)});
          }
        };
      } (p);
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
  return axios.get('data/pages.json?time=' + (new Date()).getTime().toString())
  .then(function (response) {
    var placeholders = response.data;
    for (var key in placeholders) {
      if (placeholders.hasOwnProperty(key)) {
        var p = placeholders[key];
        if (!p.hasOwnProperty('html')) p.html = '';
        p.load = function(post) { // lazy loading
          return function() {
            var postUrl = post.content;
            var postType = postUrl.substring(postUrl.lastIndexOf(".")+1);
            var postParser = blog.parsers[postType];
            if (typeof postParser === "function") {
              axios.get(postUrl + '?time=' + (new Date()).getTime().toString(), {responseType: 'text'})
              .then(function(response){
                var str = response.data;
                var r = postParser(response.data);
                post.html = r;
              })
              .catch(function(err){console.warn(err)});
            }
          };
        } (p);
      }
    }
    blog.content.pages = placeholders;
  })
  .catch(function (error) {
    console.warn(error);
  });
};

blog.loadPostsInfo()
.then(blog.loadPagesInfo)
.then(function(){
  blog.app = new Vue({
    el: '#app',
    router: blog.router,
    data: {
      config: blog.config,
      staticNavLinks: [
        { 
          name: 'Recent Posts',
          action: function(){blog.router.switch('/posts/recent')}
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
              action: function(){blog.router.switch('/pages/'+key)}
            };
            links.push(link);
          }
        }
        return links;
      }
    },
    components: {
      navbar: blog.components.navbar
    }
  });
  $('#app').removeClass('cloak');
  $('#app-placeholder').addClass('cloak');
});



