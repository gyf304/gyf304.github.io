(function(){
  function getUrlParams() {
    var params = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&#]*)/gi,
    function(m,key,value) {
      params[key] = value;
    });
    return params;
  }
  
  var params = getUrlParams();
  console.log(params);

  if (params.path) {
    try { 
      var path = decodeURIComponent(params.path);
      location.hash = '#' + path;
    } catch(e) {
      console.error(e); 
    }
  }

  var hash = location.hash;
  if (hash && hash.indexOf('#!') === 0) {
    location.hash = hash.slice(2);
  }

})()
