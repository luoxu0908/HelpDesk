var menu = [];

function Logout(){
  return  $.JSONPost('Sec1.Logout.json', { }).done(function (data) {
      $.cookie('appCookie', null, { path: "/", expires: -1 })
  	  window.location.href = '../login.html';
  	});
}
function loadMenu(){
  return  $.JSONPost('FL1.GetTicketMenu.json', { }).done(function (data) {
    if ((data) && (data.d.RetData.Tbl.Rows.length > 0)) {
      var menus = data.d.RetData.Tbl.Rows;
      var menuList = new Array();
      for (var i = 0; i < menus.length; i++) {
        var menuItem = {};
        var manuName = menus[i].MenuName.split('\\')[0];
        var subName = menus[i].MenuName.split('\\')[1];
        var subItem = {};
        var flag = false;
        for (var j = 0; j < menuList.length; j++) {
          if (menuList[j].Name.indexOf(manuName) > -1) {
            subItem.Name = subName;
            subItem.Value = menus[i].RelativeURL;
            menuList[j].URLList.push(subItem);
            flag = true;
          }
        }
        if (!flag) {
          menuItem.Name = manuName;
          menuItem.URLList = new Array();
          subItem.Name = subName;
          subItem.Value = menus[i].RelativeURL;
          menuItem.URLList.push(subItem);
          menuList.push(menuItem);
        }
      }
      var menuHtml = '';
      for (var i = 0; i < menuList.length; i++) {
        menuHtml += ' <ul class="module"><li><a href="javascript:;" data-menu="' + menuList[i].Name + '"" >' + menuList[i].Name + '</a></li></ul>';
        menuHtml += '<ul id="moduleMenu-' + menuList[i].Name + '" class="moduleMenu" data-redirect="false">';
        for (var j = 0; j < menuList[i].URLList.length; j++) {
          menuHtml += ' <li><a target="_top" href="' + menuList[i].URLList[j].Value + '">' + menuList[i].URLList[j].Name + '</a></li>';
        }
        menuHtml += '</ul>';
      }
      $('#mainMenu').html(menuHtml);
      }
  	});
}
