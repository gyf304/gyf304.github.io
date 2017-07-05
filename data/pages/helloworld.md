So, this is a static blog built with Vue.js. 
You may wonder: Why a static blog when you have hundreds of CMS out there?
The answer is easy: I can host it on Github. Thats it. It also comes with some advantages over other pre-existing solutions like Jekyll.

# Why not Wordpress?
  I did use Wordpress before to build various sites and I do find Wordpress easy to use and to install. However, Wordpress requires you to host a server for its PHP and database. This sounds a lot like a overkill to me so I decided that I should go for a static blog.

# Why not pure HTML?
  Well, yes, that's also possible. However, there's a huge trade-off problem involved in here. I can write simple HTML pages very quickly for my blog but it will look very sketchy and 90s; if I want to make it look nice and pretty, that means a lot of time spent updating my blog.

# Why not Jekyll?
  There are existing solutions for building static blogs like Jekyll. However, most of them require installation and building the site after change. This is not very convenient. Imagine that you are using another person's computer: you won't be able to update your blog! This static blog allows you to add posts on the go, using only a text editor. 

# Disadvantages?
  There are a few actually. First is that the url of the pages will look sketchy: instead of http://example.com/posts/page-1, it will be http://example.com/#posts/page-1. This is essential for vue.js router to do all the routing in js.

  The second is that the blog might not be very search engine friendly. 