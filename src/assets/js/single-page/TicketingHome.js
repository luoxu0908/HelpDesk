var access = false;
var RoleName = '';

$(function(){

  $("#newUserForm #role").change(function(){
    if ($("#newUserForm #role option:selected").text()=='Clients'){
      $("#newUserForm #contactPoint").show();
    }else{
      $("#newUserForm #contactPoint").hide();
    }
  });

  $("#packageAddForm #assurancePlus").change(function(){
    if ($("#packageAddForm #assurancePlus").is(':checked')){
      $("#packageAddForm #assurancePlusNo").show();
    }else{
      $("#packageAddForm #assurancePlusNo").val("");
      $("#packageAddForm #assurancePlusNo").hide();
    }
  });

  var getOrgnaisation =
  $.ajax({
    url: apiSrc+"BCMain/iCtc1.getOrgnaisationList.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify({}),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length == 1) {
          var org = data.d.RetData.Tbl.Rows[0];
          $('#caseAddForm #organisation, #caseFilter #organisation, #packageAddForm #organisation').append('<option value="'+org.DefaultRoleID+'" selected>'+org.DisplayName+'</option>');
        }else if (data.d.RetData.Tbl.Rows.length > 0) {
          $('#caseAddForm #organisation, #caseFilter #organisation, #packageAddForm #organisation').append('<option value="">-- Please Select --</option>');
          var orgList = data.d.RetData.Tbl.Rows;
          for (var i=0; i<orgList.length; i++ ){
            $('#caseAddForm #organisation, #caseFilter #organisation, #packageAddForm #organisation').append('<option value="'+orgList[i].DefaultRoleID+'">'+orgList[i].DisplayName+'</option>');
          }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    },
    error: function(data){
      alert("Error: " + data.responseJSON.d.RetMsg);
    }
  });

  var getRoleTags =
  $.ajax({
    url: apiSrc+"BCMain/iCtc1.getRoleTags.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify({}),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          $('#newUserForm #role').append('<option value="">-- Please Select --</option>');
          var roleTagList = data.d.RetData.Tbl.Rows;
          for (var i=0; i<roleTagList.length; i++ ){
            $('#newUserForm #role').append('<option value="'+roleTagList[i].TagName+'">'+roleTagList[i].RoleName+'</option>');
          }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    },
    error: function(data){
      alert("Error: " + data.responseJSON.d.RetMsg);
    }
  });

  var checkRoleAccess =
    $.ajax({
      url: apiSrc+"BCMain/iCtc1.CheckRoleAccess.json",
      method: "POST",
      dataType: "json",
      xhrFields: {withCredentials: true},
      data: { 'data':JSON.stringify({}),
              'WebPartKey':WebPartVal,
              'ReqGUID': getGUID() },
      success: function(data){
        if ((data) && (data.d.RetVal === -1)) {
          if (data.d.RetData.Tbl.Rows.length > 0) {
            RoleName = data.d.RetData.Tbl.Rows[0].RoleName;
          }
        }
        else {
          alert(data.d.RetMsg);
        }
      },
      error: function(data){
        alert("Error: " + data.responseJSON.d.RetMsg);
      }
    });

  $.when(checkRoleAccess, getOrgnaisation).then(function( x ) {

    if (RoleName=='Admin'|| RoleName=='Security Admin'){
      $('.adminView').show();
      getUsersList();
    }else if (RoleName=='Clients'){
      $('.clientView').show();
      $('#CreatCasecategory').hide();
      getProductOwn();
      getCasesList();
    }else if (RoleName=='Support Developer'){
      $('.developerView').show();
      getCasesList();
    }else if (RoleName=='Support Team Lead'){
      $('.teamLeadView').show();
      getCasesList();
    }else if (RoleName=='Sales'){
      $('.salesView').show();
      getCasesList();
    }else{
      $('.clientView, .teamLeadView, .developerView, .salesView, .adminView').show();
    }
    getOrgProductList($('#caseAddForm #organisation').val());
  });

  $("#caseAddForm #organisation").change(function(){
    getOrgProductList($('#caseAddForm #organisation').val());
  });
  //Add New Case
  $('#caseAddForm #submit').click(function(){
    createNewCase();
  });
  $('#caseFilter .tabBoxButtonSubmit').click(function(){
    getCasesList();
  });
  $('#exportCase').click(function(){
    exportCase();
  });
  $('#userFilter .tabBoxButtonSubmit').click(function(){
    getUsersList();
  });
  $('#packageAddForm #submit').click(function(){
    addNewPackage();
  });
  $('#newUserForm #submit').click(function(){
    addNewUser();
  });

});

//get case list
function getCasesList(){
  var caseContainerTable = $('#caseContainer').find('table'),
      caseThead = caseContainerTable.find('thead'),
      caseTbody = caseContainerTable.find('tbody');

  var Organization, Status, Subject, Category, DateFrom, DateTo;
  Organization = $('#caseFilter #organisation').val();
  Status = $('#caseFilter #status').val();
  Subject = $('#caseFilter #subject').val();
  Category = $('#caseFilter #category').val();
  DateFrom = $('#caseFilter #dateCreatedFrom').val();
  DateTo = $('#caseFilter #dateCreatedTo').val();

  var data = {'Organization':Organization, 'Status':Status, 'Subject':Subject, 'Category':Category, 'DateFrom':DateFrom, 'DateTo': DateTo};
  if (RoleName=='Clients'){
    caseThead.html('<tr><th colspan="2">Subject</th><th>Type</th><th>Created Date</th><th>Status</th></tr>');
  }
  caseTbody.html('');
  $.ajax({
    url: apiSrc+"BCMain/FL1.GetCasesList.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var cases = data.d.RetData.Tbl.Rows;
          var htmlString = '';
          for (var i=0; i<cases.length; i++ ){
            var createdDate = convertDateTime(cases[i].CreatedDate,'date');
            htmlString += '<tr id="'+ cases[i].FLID +'">';
            //color code
            var status = cases[i].Status;
            var re = /\bOpen\b/;
            if (re.test(status)==true){
              htmlString += '<td class="colorCodeActive"></td>';
            }else{
              htmlString += '<td class="colorCodeNonActive"></td>';
            }
            if (RoleName=='Clients'){
              htmlString += '<td>'+cases[i].Subject+'</td>';
              htmlString += '<td>'+cases[i].Category+'</td>';
              htmlString += '<td>'+createdDate+'</td>';
              htmlString += '<td><span class="statusNew">'+cases[i].Status+'</span></td> </tr>';
            }else{
              htmlString += '<td>'+cases[i].Subject+'</td>';
              htmlString += '<td>'+cases[i].Category+'</td>';
              htmlString += '<td>'+cases[i].DisplayName+'</td>';
              htmlString += '<td>'+createdDate+'</td>';
              htmlString += '<td><span class="statusNew">'+cases[i].Status+'</span></td> </tr>';
            }
          }
          caseTbody.html(htmlString);
          $('.caseTable tbody tr').click(function(){
            var caseId = $(this).attr('id'),
                caseUrl = './case.html?caseID=' + caseId
            window.location.href = caseUrl;
          });
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    },
    error: function(data){
      alert("Error: " + data.responseJSON.d.RetMsg);
    }
  });
};

function exportCase(){
  var Organization, Status, Subject, Category, DateFrom, DateTo;
  Organization = $('#caseFilter #organisation').val();
  Status = $('#caseFilter #status').val();
  Subject = $('#caseFilter #subject').val();
  Category = $('#caseFilter #category').val();
  DateFrom = $('#caseFilter #dateCreatedFrom').val();
  DateTo = $('#caseFilter #dateCreatedTo').val();

  var data = {'Organization':Organization, 'Status':Status, 'Subject':Subject, 'Category':Category, 'DateFrom':DateFrom, 'DateTo': DateTo};
  var Opt = $.extend({ Target: '_blank' }, '');
  var $d = $("<input type='hidden' name='data'/>").val(JSON.stringify(data));
	var $wpk = $("<input type='hidden' name='WebPartKey'/>").val(WebPartVal);
	var $form = $("<form method='POST' style='display:none;'/>").appendTo(document.body);
  $form.html("").attr("action",  apiSrc+"BCMain/FL1.ExportCasesList.part").attr("target", Opt.Target).append($d).append($wpk).submit().remove();
};

function getUsersList(){
  var userContainerTable = $('#userContainer').find('table'),
      userThead = userContainerTable.find('thead'),
      userTbody = userContainerTable.find('tbody');

  var name, entityKey, contactNo, email;
  name = $('#userFilter #name').val();
  entityKey = $('#userFilter #entityKey').val();
  contactNo = $('#userFilter #contactNo').val();
  email = $('#userFilter #email').val();

  var data = {'name':name, 'entityKey':entityKey, 'contactNo':contactNo, 'email': email};
  userTbody.html('');
  $.ajax({
    url: apiSrc+"BCMain/Ctc1.GetUsersList.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var users = data.d.RetData.Tbl.Rows;
          var htmlString = '';
          for (var i=0; i<users.length; i++ ){
            htmlString += '<tr id="'+ users[i].PersonID +'">';
            htmlString += '<td>'+users[i].DisplayName+'</td>';
            htmlString += '<td>'+users[i].EntityKey+'</td>';
            htmlString += '<td>'+users[i].ContactNo+'</td>';
            htmlString += '<td>'+users[i].Email1+'</td>';
            htmlString += '<td>'+users[i].FullAddress+'</td> </tr>';
          }
          userTbody.html(htmlString);
          $('.userTable tbody tr').click(function(){
            var personID = $(this).attr('id'),
                profileUrl = './profile.html?personID=' + personID
            window.location.href = profileUrl;
          });
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    },
    error: function(data){
      alert("Error: " + data.responseJSON.d.RetMsg);
    }
  });
};

//Create new case
function createNewCase(){
  var Organization, ContactPerson, Email, Contact, Subject, Product, Category, Details;
  Organization = $('#caseAddForm #organisation').val();
  ContactPerson = $('#caseAddForm #name').val();
  Email = $('#caseAddForm #email').val();
  Contact = $('#caseAddForm #contact').val();
  Subject = $('#caseAddForm #title').val();
  Product = $('#caseAddForm #product').val();
  Category = $('#caseAddForm #category').val();
  Details = $('#caseAddForm #description').val();

  if (Organization.length==0 || ContactPerson.length==0 || Email.length==0 || Contact.length==0 || Subject.length==0 || Details.length==0){
    alert('Please fill in all mandatory fields!');
    return false;
  }
  if (IsValidEmail(Email)==false){
    alert('Invalid email!');
    return false;
  }
  if (IsValidContact(Contact)==false){
    alert('Invalid contact!');
    return false;
  }

  var data = {'Organization':Organization, 'ContactPerson':ContactPerson, 'Email':Email, 'ContactNo': Contact, 'Subject': Subject, 'Category':Category, 'Details':Details, 'Product':Product};
  $.ajax({
    url: apiSrc+"BCMain/FL1.AddNewCase.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          if (data.d.RetData.Tbl.Rows[0].Success == true) {
            getCasesList();
          } else {
            alert(data.d.RetData.Tbl.Rows[0].ReturnMsg);
          }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    },
    error: function(data){
      alert("Error: " + data.responseJSON.d.RetMsg);
    }
  });
};

function getProductOwn(){
  var productContainerTable = $('#packageContainer').find('table'),
      productThead = productContainerTable.find('thead'),
      productTbody = productContainerTable.find('tbody');

  productTbody.html('');

  $.ajax({
    url: apiSrc+"BCMain/Ctc1.GetProductOwn.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':'',
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var products = data.d.RetData.Tbl.Rows;
          var htmlString = '';
          for (var i=0; i<products.length; i++ ){
            var expiryDate=convertDateTime(products[i].ExpiryDate,'date');
            htmlString += '<tr id="'+ products[i].Product +'" data-open="caseAddForm">';
            htmlString += '<td>'+products[i].Product+'</td>';
            htmlString += '<td>'+products[i].PackageType+'</td>';
            htmlString += '<td>'+expiryDate+'</td>';
            htmlString += '<td>'+products[i].AssuranceNo+'</td>';
            htmlString += '<td>'+products[i].ManHoursUsed+'</td>';
            htmlString += '</tr>';
          }
        }
        productTbody.html(htmlString);
        $('.packageTable tbody tr').click(function(){
          var Product = $(this).attr('id');
          $('#caseAddForm #product').val(Product);
        });
      }
      else {
        alert(data.d.RetMsg);
      }
    },
    error: function(data){
      alert("Error: " + data.responseJSON.d.RetMsg);
    }
  });
};

function getOrgProductList(Organization){
  $('#caseAddForm #product').html('');
  $('#caseAddForm #product').append('<option value="">-- Please Select --</option>');
  var data = {'Organization':Organization};
  $.ajax({
    url: apiSrc+"BCMain/iCtc1.getOrgProductList.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          var productList = data.d.RetData.Tbl.Rows;
          for (var i=0; i<productList.length; i++ ){
            $('#caseAddForm #product').append('<option value="'+productList[i].Product+'">'+productList[i].Product+'</option>');
          }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    },
    error: function(data){
      alert("Error: " + data.responseJSON.d.RetMsg);
    }
  });
}

function addNewPackage(){
  var RoleID, PackageType, Product, StartDate, ExpiryDate, AssurancePlus, NoAssPlus, Remarks;
  RoleID = $('#packageAddForm #organisation').val();
  Product = $('#packageAddForm #product').val();
  PackageType =  $('#packageAddForm #type').val();
  StartDate = $('#packageAddForm #packageStartDate').val();
  ExpiryDate = $('#packageAddForm #packageExpiryDate').val();
  if ($("#packageAddForm #assurancePlus").is(':checked')){
    AssurancePlus = 1;
  }else{
    AssurancePlus = 0;
  }
  NoAssPlus = $('#packageAddForm #assurancePlusNo').val() * 5 * 8;
  Remarks = $('#packageAddForm #remarks').val();

  if (RoleID.length==0 || PackageType.length==0 || Product.length==0 || StartDate.length==0 || ExpiryDate.length==0){
    alert('Please fill in all mandatory fields!');
    return false;
  }

  var data = {'RoleID':RoleID, 'PackageType':PackageType, 'Product':Product, 'StartDate':StartDate, 'ExpiryDate':ExpiryDate, 'Remarks':Remarks, 'AssurancePlus':AssurancePlus, 'NoAssPlus':NoAssPlus};
  $.ajax({
    url: apiSrc+"BCMain/Ctc1.AddNewPackage.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          if (data.d.RetData.Tbl.Rows[0].Success == true) {
            clearPackageForm();
            alert('Package added successfully!');
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    },
    error: function(data){
      alert("Error: " + data.responseJSON.d.RetMsg);
    }
  });
}

function addNewUser(){
  var displayName, entityKey, mobile, email, country, postalCode, city, state, block, street, unit, building, role, poc1Name, poc1Contact, poc1Email, poc1Designation, poc1Department, poc2Name, poc2Contact, poc2Email, poc2Designation, poc2Department;
  displayName = $('#newUserForm #displayName').val();
  entityKey = $('#newUserForm #entityKey').val();
  mobile =  $('#newUserForm #contact').val();
  email = $('#newUserForm #email').val();
  country = $('#newUserForm #country').val();
  postalCode = $('#newUserForm #postalCode').val();
  city = $('#newUserForm #city').val();
  state = $('#newUserForm #state').val();
  block = $('#newUserForm #blockNo').val();
  street = $('#newUserForm #street').val();
  unit = $('#newUserForm #unitNo').val();
  building = $('#newUserForm #building').val();
  role = $('#newUserForm #role').val();
  poc1Name = $('#newUserForm #poc1Name').val();
  poc1Contact = $('#newUserForm #poc1Contact').val();
  poc1Email = $('#newUserForm #poc1Email').val();
  poc1Designation = $('#newUserForm #poc1Designation').val();
  poc1Department = $('#newUserForm #poc1Department').val();
  poc2Name = $('#newUserForm #poc2Name').val();
  poc2Contact = $('#newUserForm #poc2Contact').val();
  poc2Email = $('#newUserForm #poc2Email').val();
  poc2Designation = $('#newUserForm #poc2Designation').val();
  poc2Department = $('#newUserForm #poc2Department').val();

  if (displayName == '' || entityKey == '' || mobile == '' || email == '' || role == ''){
    alert('Please fill in all mandatory fields!');
    return false;
  }
  if (!IsValidContact(mobile)){
    alert('Contact No is not in correct format, please check!');
    return false;
  }if (!IsValidEmail(email)){
    alert('Email is not in correct format, please check!');
    return false;
  }

  var data = {'displayName':displayName, 'entityKey':entityKey, 'mobile':mobile, 'email':email, 'country':country, 'postalCode':postalCode, 'city':city, 'state':state, 'block':block, 'street':street, 'unit':unit, 'building':building, 'role':role, 'poc1Name':poc1Name, 'poc1Contact':poc1Contact, 'poc1Email':poc1Email, 'poc1Designation':poc1Designation, 'poc1Department':poc1Department, 'poc2Name':poc2Name, 'poc2Contact':poc2Contact, 'poc2Email':poc2Email, 'poc2Designation':poc2Designation, 'poc2Department':poc2Department};

  $.ajax({
    url: apiSrc+"BCMain/iCtc1.AddNewUser1.json",
    method: "POST",
    dataType: "json",
    xhrFields: {withCredentials: true},
    data: { 'data':JSON.stringify(data),
            'WebPartKey':WebPartVal,
            'ReqGUID': getGUID() },
    success: function(data){
      if ((data) && (data.d.RetVal === -1)) {
        if (data.d.RetData.Tbl.Rows.length > 0) {
          if (data.d.RetData.Tbl.Rows[0].Success == true) {
            clearUserForm();
            alert('New user added successfully!');
            getUsersList();
          } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
        }
      }
      else {
        alert(data.d.RetMsg);
      }
    },
    error: function(data){
      alert("Error: " + data.responseJSON.d.RetMsg);
    }
  });
}

function IsValidContact(contactno) {
	var re = /^[6389]\d{7}$/;
	return re.test(contactno);
}

function IsValidEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

//convert date to dd/mm/yyyy
function convertDateTime(inputFormat, type) {
  if (inputFormat == null){
    return '-';
  };
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat);
  if (type == 'date'){
    return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
  }else if (type == 'datetime'){
    return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/') + ' ' + [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
  }else if (type == 'time'){
    return [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
  }
};

function clearPackageForm(){
  RoleID = $('#packageAddForm #organisation').val('');
  Product = $('#packageAddForm #product').val('');
  PackageType =  $('#packageAddForm #type').val('');
  StartDate = $('#packageAddForm #packageStartDate').val('');
  ExpiryDate = $('#packageAddForm #packageExpiryDate').val('');
  NoAssPlus = $('#packageAddForm #assurancePlusNo').val('');
  Remarks = $('#packageAddForm #remarks').val('');
}

function clearUserForm(){
  firstName = $('#newUserForm #firstName').val('');
  lastName = $('#newUserForm #lastName').val('');
  entityKey = $('#newUserForm #entityKey').val('');
  mobile =  $('#newUserForm #contact').val('');
  email = $('#newUserForm #email').val('');
  country = $('#newUserForm #country').val('');
  postalCode = $('#newUserForm #postalCode').val('');
  city = $('#newUserForm #city').val('');
  state = $('#newUserForm #state').val('');
  block = $('#newUserForm #blockNo').val('');
  street = $('#newUserForm #street').val('');
  unit = $('#newUserForm #unitNo').val('');
  building = $('#newUserForm #building').val('');
  role = $('#newUserForm #role').val('');
  poc1Name = $('#newUserForm #poc1Name').val('');
  poc1Contact = $('#newUserForm #poc1Contact').val('');
  poc1Email = $('#newUserForm #poc1Email').val('');
  poc1Designation = $('#newUserForm #poc1Designation').val('');
  poc1Department = $('#newUserForm #poc1Department').val('');
  poc2Name = $('#newUserForm #poc2Name').val('');
  poc2Contact = $('#newUserForm #poc2Contact').val('');
  poc2Email = $('#newUserForm #poc2Email').val('');
  poc2Designation = $('#newUserForm #poc2Designation').val('');
  poc2Department = $('#newUserForm #poc2Department').val('');
}

function clearCaseForm(){
  var length = $('#caseAddForm #organisation > option').length;
  if (length > 1){
    Organization = $('#caseAddForm #organisation').val('');
  }
  ContactPerson = $('#caseAddForm #name').val('');
  Email = $('#caseAddForm #email').val('');
  Contact = $('#caseAddForm #contact').val('');
  Subject = $('#caseAddForm #title').val('');
  Product = $('#caseAddForm #product').val('');
  Category = $('#caseAddForm #category').val('');
  Details = $('#caseAddForm #description').val('');
}

function getGUID() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
};
