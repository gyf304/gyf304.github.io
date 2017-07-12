This blog is built by me using vue.js + materialize and hosted on github. This blog, as mentioned in "About this blog", is completely static with no server side program. (Otherwise it won't work hosted on github.) 

Since then a few modifications has been made, mostly to fix problems.

* Refactors: previously, the blog is strongly coupled to a vue.js app, which should not be the case. Now they are separated.

* A separate "accessibility" mode for printing. Also I hope the mode will allow search engines to crawl the site better.

* Disqus integration: this is a difficult one. Disqus is not designed to work with Vue.js router with /#/ style routes. It thinks the entire site is a single page and a comment made under any article will appear everywhere else. A separate comment.html is loaded using iframe, using url parameters to bypass this issue. This is a dirty hack and I will seek ways to fix this.
