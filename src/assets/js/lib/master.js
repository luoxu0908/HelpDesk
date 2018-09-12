class Master {
  constructor() {
    window.appName = '';
    window.appRootPath = '';
    window.apiSrc = '';
    window.pageName = '';

    this.setPath();
    this.getPageName();
  }

  setPath() {
    var hostname = location.hostname;
    var href = location.href;
    var match =  href.match(/(http|https):\/\/[A-Za-z0-9-_]+.[A-Za-z-_].[A-Za-z]+[.a-z]+?\/([A-Za-z0-9-_]+)\//);

    if (hostname.match(/localhost/)){
      window.appName = '';
      window.appRootPath = '/';
      window.apiSrc = 'https://portal.taksys.com.sg/HelpDesk/';
    }
    else {
      if (href.length >= 3) {
        window.appName = match[2];
        window.appRootPath = '/' + appName + '/';
        window.apiSrc = window.appRootPath;
      }
    }
  } //SetPath

  getPageName() {
    return pageName = $('body').attr('id').replace('page-','');
  }
}

export default Master;
