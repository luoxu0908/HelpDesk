var RoleName = '', PrintFlag = '', FileID = '', caseID = '', TargetRoleID = '';
var startDate = '', endDate = '', standDate = '', execCount = 0, actualHour = 0, billingHours = 0, hourDeatils = '';

$(function () {
    //get caseID from URL
    var urlParams = new URLSearchParams(window.location.search),
        caseID = urlParams.get('caseID');
    FileID = urlParams.get('FileID');

    $('#Print').click(function () {
        DoPrint();
        var PrintFlag = document.execCommand("print");
        if (PrintFlag) {
            window.location.href = './case.html?caseID=' + caseID;
        }
    });
    var checkRoleAccess =
      $.ajax({
          url: apiSrc + "BCMain/iCtc1.CheckRoleAccess.json",
          method: "POST",
          dataType: "json",
          xhrFields: { withCredentials: true },
          data: {
              'data': JSON.stringify({}),
              'WebPartKey': WebPartVal,
              'ReqGUID': getGUID()
          },
          success: function (data) {
              if ((data) && (data.d.RetVal === -1)) {
                  if (data.d.RetData.Tbl.Rows.length > 0) {
                      RoleName = data.d.RetData.Tbl.Rows[0].RoleName;
                  }
              }
              else {
                  alert(data.d.RetMsg);
              }
          },
          error: function (data) {
              alert("Error: " + data.responseJSON.d.RetMsg);
          }
      });

    $.when(checkRoleAccess).then(function (x) {
        GetCaseDetails(caseID);
        GetCaseHistory(caseID);
        GetCaseInvolvement(caseID);
        if (RoleName == 'Admin') {

        } else if (RoleName == 'Clients') {
            $('#AddNewActivity').show();
        } else if (RoleName == 'Support Developer') {
            $('.supportControl').show();
        } else if (RoleName == 'Support Team Lead') {
            getStaffList();
            GetAvailablePackage(caseID);
            $('.teamLeadControl, .supportControl').show();
        } else if (RoleName == 'Sales') {

        } else {

        }
    });

    $('#activityForm #submit').click(function () {
        addNewActivity(caseID);
    });

    $('#involvementForm #submit').click(function () {
        addNewInvolvement(caseID);
    });

    $('#reviewForm #submit').click(function () {
        reviewCase(caseID);
    });

    $('#chargeForm #submit').click(function () {
        chargeToPackage(caseID);
    });
    $('#ServiceForm #submit').click(function () {
        //alert($('#ServiceForm #ServiceActualDateFrom').val());
        SaveServiceForm(caseID);
    });
    $('#ServiceForm #ServiceCustomerAck').click(function () {
        if ($(this).is(':checked')) {
            $('#ServiceForm #ServiceNameDiv').show();
            $('#ServiceForm #ServiceEmailDiv').show();
            $('#ServiceForm #ServiceContactNoDiv').show();
            $('#ServiceForm #NameLb').html('Name<span style="color:red">*</span>');
            $('#ServiceForm #EmailLb').html('Email<span style="color:red">*</span>');
            $('#ServiceForm #ContactNoLb').html('ContactNo<span style="color:red">*</span>');

        } else {
            $('#ServiceForm #ServiceNameDiv').hide();
            $('#ServiceForm #ServiceEmailDiv').hide();
            $('#ServiceForm #ServiceContactNoDiv').hide();
            $('#ServiceForm #NameLb').html('Name');
            $('#ServiceForm #EmailLb').html('Email');
            $('#ServiceForm #ContactNoLb').html('ContactNo');
        }
    });


    $.when(getOrgnaisationList(), GetDropDownList('reviewForm', 'category', 'Category'), GetDropDownList('reviewForm', 'Location', 'OrgAddressLocation')
    , GetDropDownList('reviewForm', 'PriorityLevel', 'PriorityLevel'), GetDropDownList('reviewForm', 'Type', 'Type'), GetDropDownList('ServiceForm', 'ServiceChargeToPackage', 'PackageType')).then(function () {
        $('#reviewForm #organisation').attr('disabled', 'disabled');
        GetreviewCase(caseID);
    });
    $("#ServiceForm #ServicePHWeekend").click(function () {
        if ($(this).is(':checked')) {
            //  CostTime=
        }
    });

    $("#ServiceForm #ServicePHWeekend").click(function () {
        if ($(this).is(':checked')) {
            //  CostTime=
        }
    });
    $('#ServiceForm #ActualTimeFrom').change(function () {
        execDays();
        var number = moment(endDate).diff(startDate, 'hours') % 24;
        actualHour = 0, billingHours = 0;
        if (execCount <= 1) {
            standDate = $('#ServiceForm #ServiceActualDateFrom').val();
            execHours(startDate, endDate, standDate);
        } else {
            for (var i = 0; i < number; i++) {
                standDate = moment($('#ServiceForm #ServiceActualDateFrom').val()).add(i, 'days');
                if (i == 0) {
                    var firstEndDate = new Date(standDate + ' 24:00:00')
                    execHours(startDate, firstEndDate, standDate);
                } else if (i = number - 1) {
                    var lastStartDate = new Date(standDate + ' 00:00:00')
                    execHours(lastStartDate, endDate, standDate);
                } else {
                    execHours(startDate, endDate, standDate);
                }
            }
        }
        $('#ServiceForm #ServiceActualHours').val(actualHour);
        $('#ServiceForm #ServiceBillingHours').val(billingHours);
        $('#ServiceForm #ServiceHoursCalculation').val(hourDeatils);
    });

    $('#ServiceForm #ActualTimeTo').change(function () {
        execDays();
        var number = moment(endDate).diff(startDate, 'hours') % 24;
        actualHour = 0, billingHours = 0;
        if (execCount <= 1) {
            standDate = $('#ServiceForm #ServiceActualDateFrom').val();
            execHours(startDate, endDate, standDate);
        } else {
            for (var i = 0; i < number; i++) {
                standDate = moment($('#ServiceForm #ServiceActualDateFrom').val()).add(i, 'days');
                if (i == 0) {
                    var firstEndDate = new Date(standDate + ' 24:00:00')
                    execHours(startDate, firstEndDate, standDate);
                } else if (i = number - 1) {
                    var lastStartDate = new Date(standDate + ' 00:00:00')
                    execHours(lastStartDate, endDate, standDate);
                } else {
                    execHours(startDate, endDate, standDate);
                }
            }
        }
        $('#ServiceForm #ServiceActualHours').val(actualHour);
        $('#ServiceForm #ServiceBillingHours').val(billingHours);
        $('#ServiceForm #ServiceHoursCalculation').val(hourDeatils);
    });
    $('#ServiceForm #ServiceActualDateFrom').change(function () {
        execDays();
        var number = moment(endDate).diff(startDate, 'hours') % 24;
        actualHour = 0, billingHours = 0;
        if (execCount <= 1) {
            standDate = $('#ServiceForm #ServiceActualDateFrom').val();
            execHours(startDate, endDate, standDate);
        } else {
            for (var i = 0; i < number; i++) {
                standDate = moment($('#ServiceForm #ServiceActualDateFrom').val()).add(i, 'days');
                if (i == 0) {
                    var firstEndDate = new Date(standDate + ' 24:00:00')
                    execHours(startDate, firstEndDate, standDate);
                } else if (i = number - 1) {
                    var lastStartDate = new Date(standDate + ' 00:00:00')
                    execHours(lastStartDate, endDate, standDate);
                } else {
                    execHours(startDate, endDate, standDate);
                }
            }
        }
        $('#ServiceForm #ServiceActualHours').val(actualHour);
        $('#ServiceForm #ServiceBillingHours').val(billingHours);
        $('#ServiceForm #ServiceHoursCalculation').val(hourDeatils);
    });

    $('#ServiceForm #ServiceActualDateTo').change(function () {
        execDays();
        var number = moment(endDate).diff(startDate, 'hours') % 24;
        actualHour = 0, billingHours = 0;
        if (execCount <= 1) {
            standDate = $('#ServiceForm #ServiceActualDateFrom').val();
            execHours(startDate, endDate, standDate);
        } else {
            for (var i = 0; i < number; i++) {
                standDate = moment($('#ServiceForm #ServiceActualDateFrom').val()).add(i, 'days');
                if (i == 0) {
                    var firstEndDate = new Date(standDate + ' 24:00:00')
                    execHours(startDate, firstEndDate, standDate);
                } else if (i = number - 1) {
                    var lastStartDate = new Date(standDate + ' 00:00:00')
                    execHours(lastStartDate, endDate, standDate);
                } else {
                    execHours(startDate, endDate, standDate);
                }
            }
        }
        $('#ServiceForm #ServiceActualHours').val(actualHour);
        $('#ServiceForm #ServiceBillingHours').val(billingHours);
        $('#ServiceForm #ServiceHoursCalculation').val(hourDeatils);
    });


});

function execDays() {
    var ServiceActualDateFrom, ActualTimeFrom, ServiceActualDateTo, ActualTimeTo;
    ServiceActualDateFrom = $('#ServiceForm #ServiceActualDateFrom').val(); ActualTimeFrom = $('#ServiceForm #ActualTimeFrom').val();
    ServiceActualDateTo = $('#ServiceForm #ServiceActualDateTo').val(); ActualTimeTo = $('#ServiceForm #ActualTimeTo').val();
    if (ServiceActualDateFrom.length > 0 && ActualTimeFrom.length > 0 && ServiceActualDateTo.length > 0 && ActualTimeTo.length > 0) {
        startDate = new Date(ServiceActualDateFrom + ' ' + ActualTimeFrom);
        endDate = new Date(ServiceActualDateTo + ' ' + ActualTimeTo);
        execCount = moment(endDate).diff(startDate, 'hours') / 24;
    }
}

function execHours(startDate, endDate, standDate) {
    var startDate = new Date(startDate);
    var endDate = new Date(endDate);
    var MorningDate = new Date(standDate + ' ' + '09:00:00');
    var AfterNoonDate = new Date(standDate + ' ' + '18:00:00');
    var NightDate = new Date(standDate + ' ' + '22:00:00');
    var LastDate = new Date(standDate + ' ' + '24:00:00');

    if (startDate < MorningDate) {

        if (endDate <= MorningDate) {
            actualHour = moment(endDate).diff(startDate, 'minutes') / 60.00;
            billingHours = actualHour * 2;
            hourDeatils = 'from : ' + moment(startDate).format("MMM Do YYYY, h:mm") + ' to : ' + moment(endDate).format("MMM Do YYYY, h:mm") + ' actual hours : ' + actualHour + ' Billing Hours : ' + billingHours + '\r\n'
        } else if (endDate > MorningDate && endDate <= AfterNoonDate) {
            actualHour = moment(MorningDate).diff(startDate, 'minutes') / 60.00;
            billingHours = actualHour * 2;

            actualHour = actualHour + moment(endDate).diff(MorningDate, 'minutes') / 60.00;
            billingHours = billingHours + moment(endDate).diff(MorningDate, 'minutes') / 60.00;

        } else if (endDate > AfterNoonDate && endDate <= NightDate) {

            actualHour = moment(MorningDate).diff(startDate, 'minutes') / 60.00;
            billingHours = actualHour * 2;

            actualHour = actualHour + moment(AfterNoonDate).diff(MorningDate, 'minutes') / 60.00;
            billingHours = billingHours + moment(AfterNoonDate).diff(MorningDate, 'minutes') / 60.00;

            actualHour = actualHour + moment(endDate).diff(AfterNoonDate, 'minutes') / 60.00;
            billingHours = billingHours + (moment(endDate).diff(AfterNoonDate, 'minutes') / 60.00) * 1.5;

        } else if (endDate > NightDate && NightDate <= LastDate) {
            actualHour = moment(MorningDate).diff(startDate, 'minutes') / 60.00;
            billingHours = actualHour * 2;

            actualHour = actualHour + moment(AfterNoonDate).diff(MorningDate, 'minutes') / 60.00;
            billingHours = billingHours + moment(AfterNoonDate).diff(MorningDate, 'minutes') / 60.00;

            actualHour = actualHour + moment(NightDate).diff(AfterNoonDate, 'minutes') / 60.00;
            billingHours = billingHours + (moment(NightDate).diff(AfterNoonDate, 'minutes') / 60.00) * 1.5;

            actualHour = actualHour + moment(LastDate).diff(NightDate, 'minutes') / 60.00;
            billingHours = billingHours + (moment(LastDate).diff(NightDate, 'minutes') / 60.00) * 2;
        }

    } else if (startDate >= MorningDate && startDate < AfterNoonDate) {
        if (endDate <= AfterNoonDate) {
            actualHour = moment(endDate).diff(startDate, 'minutes') / 60.00;
            billingHours = actualHour;
        } else if (endDate > AfterNoonDate && endDate <= NightDate) {
            actualHour = moment(AfterNoonDate).diff(MorningDate, 'minutes') / 60.00;
            billingHours = actualHour;

            actualHour = actualHour + moment(endDate).diff(AfterNoonDate, 'minutes') / 60.00;
            billingHours = actualHour + (moment(endDate).diff(AfterNoonDate, 'minutes') / 60.00) * 1.5;
        } else if (endDate > NightDate && endDate <= LastDate) {
            actualHour = moment(AfterNoonDate).diff(startDate, 'minutes') / 60.00;
            billingHours = actualHour;

            actualHour = actualHour + moment(NightDate).diff(AfterNoonDate, 'minutes') / 60.00;
            billingHours = actualHour + actualHour * 1.5;

            actualHour = actualHour + moment(endDate).diff(NightDate, 'minutes') / 60.00;
            billingHours = actualHour + actualHour * 2;
        }

    } else if (startDate >= AfterNoonDate && startDate < NightDate) {

        if (endDate <= NightDate) {
            actualHour = moment(endDate).diff(AfterNoonDate, 'minutes') / 60.00;
            billingHours = actualHour + actualHour * 1.5;
        } else if (endDate > NightDate && NightDate <= LastDate) {
            actualHour = moment(NightDate).diff(AfterNoonDate, 'minutes') / 60.00;
            billingHours = actualHour + actualHour * 1.5;

            actualHour = actualHour + moment(endDate).diff(NightDate, 'minutes') / 60.00;
            billingHours = actualHour + actualHour * 2;

        }
    } else if (startDate >= NightDate && endDate < LastDate) {
        actualHour = actualHour + moment(endDate).diff(NightDate, 'minutes') / 60.00;
        billingHours = actualHour + actualHour * 2;
    }
}



function DoPrint() {
    $('.boxContent').hide();
    $('.titleMain').hide();
    $('#Print').hide();
    $('.buttonType2').hide();
    var printData = document.getElementById("mainContent").innerHTML;
    window.document.body.innerHTML = printData
    window.print()
}
function AddNewAttactment() {
    window.open('../BCMain/tabs.htm?Prefix=FL&Type=CaseAttach&title=' + caseID + '&TabParam=' + FileID);
}

function GetreviewCase(caseID) {
    return $.ajax({
        url: apiSrc + "BCMain/FL1.GetReviewCase.json",
        method: "POST",
        dataType: "json",
        xhrFields: { withCredentials: true },
        data: {
            'data': JSON.stringify({ 'FLID': caseID }),
            'WebPartKey': WebPartVal,
            'ReqGUID': getGUID()
        },
        success: function (data) {
            if ((data) && (data.d.RetVal === -1)) {
                if (data.d.RetData.Tbl.Rows.length > 0) {
                    var CaseEntity = data.d.RetData.Tbl.Rows[0];
                    $('#reviewForm #organisation').val(CaseEntity.TargetRoleID);
                    $('#reviewForm #status').val(CaseEntity.Status);
                    $('#reviewForm #name').val(CaseEntity.ContactPerson);
                    $('#reviewForm #email').val(CaseEntity.Email);
                    $('#reviewForm #contact').val(CaseEntity.ContactNo);
                    $('#reviewForm #title').val(CaseEntity.Subject);
                    $('#reviewForm #Type').val(CaseEntity.NewType);
                    $('#reviewForm #category').val(CaseEntity.Category);
                    $('#reviewForm #Location').val(CaseEntity.Location);
                    $('#reviewForm #PriorityLevel').val(CaseEntity.PriorityLevel);
                    $('#reviewForm #description').val(CaseEntity.Details);
                    $('#reviewForm').foundation('close');

                }
            }
            else {
                alert(data.d.RetMsg);
            }
        },
        error: function (data) {
            alert("Error: " + data.responseJSON.d.RetMsg);
        }
    });

}


function reviewCase(caseID) {

    var Organization, status, ContactPerson, Email, Contact, Subject, Product, Category, NewLocation, Details, PriorityLevel;
    Organization = $('#reviewForm #organisation').val();
    status = $('#reviewForm #status').val();
    ContactPerson = $('#reviewForm #name').val();
    Email = $('#reviewForm #email').val();
    Contact = $('#reviewForm #contact').val();
    Subject = $('#reviewForm #title').val();
    Type = $('#reviewForm #Type').val();
    Category = $('#reviewForm #category').val();
    NewLocation = $('#reviewForm #Location').val();
    PriorityLevel = $('#reviewForm #PriorityLevel').val();
    Details = $('#reviewForm #description').val();

    if (Organization.length == 0 || status.length == 0 || ContactPerson.length == 0 || Email.length == 0 || Contact.length == 0 || Subject.length == 0 || Type.length == 0 || Details.length == 0 || PriorityLevel.length == 0) {
        alert('Please fill in all mandatory fields!');
        return false;
    }
    if (IsValidEmail(Email) == false) {
        alert('Invalid email!');
        return false;
    }
    if (IsValidContact(Contact) == false) {
        alert('Invalid contact!');
        return false;
    }

    var data = { 'FLID': caseID, 'Organization': Organization, 'status': status, 'ContactPerson': ContactPerson, 'Email': Email, 'ContactNo': Contact, 'Subject': Subject, 'Category': Category, 'Details': Details, 'Type': Type, 'NewLocation': NewLocation, 'PriorityLevel': PriorityLevel };
    $.ajax({
        url: apiSrc + "BCMain/FL1.ReviewCase.json",
        method: "POST",
        dataType: "json",
        xhrFields: { withCredentials: true },
        data: {
            'data': JSON.stringify(data),
            'WebPartKey': WebPartVal,
            'ReqGUID': getGUID()
        },
        success: function (data) {
            if ((data) && (data.d.RetVal === -1)) {
                if (data.d.RetData.Tbl.Rows.length > 0) {
                    if (data.d.RetData.Tbl.Rows[0].Success == true) {
                        $('#reviewForm #organisation').val('');
                        $('#reviewForm #name').val('');
                        $('#reviewForm #email').val('');
                        $('#reviewForm #contact').val('');
                        $('#reviewForm #title').val('');
                        $('#reviewForm #Type').val('');
                        $('#reviewForm #category').val('');
                        $('#reviewForm #Location').val('');
                        $('#reviewForm #PriorityLevel').val('');
                        $('#reviewForm #description').val('');
                        $('#reviewForm').foundation('close');
                        GetreviewCase(caseID);
                        GetCaseDetails(caseID);
                        GetCaseHistory(caseID);
                        $('#reviewForm').foundation('close');
                    } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
                }
            }
            else {
                alert(data.d.RetMsg);
            }
        },
        error: function (data) {
            alert("Error: " + data.responseJSON.d.RetMsg);
        }
    });
}

function addNewInvolvement(caseID) {
    var staff, task;
    staff = $('#involvementForm #person').val();
    task = $('#involvementForm #task').val();

    if (staff.length == 0) {
        alert('Please fill in all mandatory fields!');
        return false;
    }

    var data = { 'FLID': caseID, 'RoleID': staff, 'Details': task };
    $.ajax({
        url: apiSrc + "BCMain/FL1.AddInvolvement.json",
        method: "POST",
        dataType: "json",
        xhrFields: { withCredentials: true },
        data: {
            'data': JSON.stringify(data),
            'WebPartKey': WebPartVal,
            'ReqGUID': getGUID()
        },
        success: function (data) {
            if ((data) && (data.d.RetVal === -1)) {
                if (data.d.RetData.Tbl.Rows.length > 0) {
                    if (data.d.RetData.Tbl.Rows[0].Success == true) {
                        GetCaseInvolvement(caseID);
                        GetCaseHistory(caseID);
                        $('#involvementForm #person').val('');
                        $('#involvementForm').foundation('close');
                    } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
                }
            }
            else {
                alert(data.d.RetMsg);
            }
        },
        error: function (data) {
            alert("Error: " + data.responseJSON.d.RetMsg);
        }
    });
}

function addNewActivity(caseID) {
    var Description, internal;
    Description = $('#activityForm #description').val();

    internal = $("#activityForm [name=internal]:checked").val() || '';

    if (Description.length == 0) {
        alert('Please fill in description!');
        return false;
    }
    if (RoleName != 'Clients') {
        if (internal.length == 0) {
            alert('Please fill in internal or All!');
            return false;
        }
    }

    var data = { 'FLID': caseID, 'Details': Description, 'Internal': internal };
    $.ajax({
        url: apiSrc + "BCMain/FL1.InsertActivityLog.json",
        method: "POST",
        dataType: "json",
        xhrFields: { withCredentials: true },
        data: {
            'data': JSON.stringify(data),
            'WebPartKey': WebPartVal,
            'ReqGUID': getGUID()
        },
        success: function (data) {
            if ((data) && (data.d.RetVal === -1)) {
                if (data.d.RetData.Tbl.Rows.length > 0) {
                    if (data.d.RetData.Tbl.Rows[0].Success == true) {
                        $('#activityForm #description').val('');
                        $('#activityForm').foundation('close');
                        GetCaseHistory(caseID);
                    } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
                }
            }
            else {
                alert(data.d.RetMsg);
            }
        },
        error: function (data) {
            alert("Error: " + data.responseJSON.d.RetMsg);
        }
    });
}

function GetAvailablePackage(caseId) {
    $('#chargeForm #packageID').html('');
    var html = '<option value="">-- Please Select --</option>';
    html += '<option value="0">Quotation</option>';
    $.ajax({
        url: apiSrc + "BCMain/Ctc1.GetAvailablePackage.json",
        method: "POST",
        dataType: "json",
        xhrFields: { withCredentials: true },
        data: {
            'data': JSON.stringify({ 'FLID': caseId }),
            'WebPartKey': WebPartVal,
            'ReqGUID': getGUID()
        },
        success: function (data) {
            if ((data) && (data.d.RetVal === -1)) {
                if (data.d.RetData.Tbl.Rows.length > 0) {
                    var availablePackage = data.d.RetData.Tbl.Rows;
                    for (var i = 0; i < availablePackage.length; i++) {
                        html += '<option value="' + availablePackage[i].PackageID + '">' + availablePackage[i].AvailablePackage + '</option>';
                    }
                }
            } else {
                alert(data.d.RetMsg);
            }
            $('#chargeForm #packageID').html(html);
        },
        error: function (data) {
            alert("Error: " + data.responseJSON.d.RetMsg);
        }
    });
}

//Get Case Details
function GetCaseDetails(caseId) {
    $.ajax({
        url: apiSrc + "BCMain/FL1.GetCasesDetails.json",
        method: "POST",
        dataType: "json",
        xhrFields: { withCredentials: true },
        data: {
            'data': JSON.stringify({ 'FLID': caseId }),
            'WebPartKey': WebPartVal,
            'ReqGUID': getGUID()
        },
        success: function (data) {
            if ((data) && (data.d.RetVal === -1)) {
                if (data.d.RetData.Tbl.Rows.length > 0) {
                    var caseDetails = data.d.RetData.Tbl.Rows[0];
                    var createdDate = convertDateTime(caseDetails.CreatedDate, 'datetime'),
                        updatedDate = convertDateTime(caseDetails.ModifiedDate, 'datetime');
                    $('#summary .CaseID').html(caseDetails.FLID);
                    $('#summary .organisation').html(caseDetails.Organisation);
                    $('#summary .name').html(caseDetails.ContactPerson);
                    $('#summary .email').html(caseDetails.Email);
                    $('#summary .contact').html(caseDetails.ContactNo);
                    $('#summary .subject').html(caseDetails.Subject);
                    $('#summary .details').html(caseDetails.Details);
                    $('#summary .location').html(caseDetails.TagData3);
                    $('#summary .createdDate').html(createdDate);
                    $('#summary .updatedDate').html(updatedDate);
                    $('#reviewInfo .status').html(caseDetails.Status);
                    $('#reviewInfo .category').html(caseDetails.Category);
                    $('#reviewInfo .dateFrom').html(caseDetails.DateFrom);
                    $('#reviewInfo .dateTo').html(caseDetails.DateTo);
                    $('#reviewInfo .manHours').html(caseDetails.ActualHours);
                    $('#reviewInfo .actualHour').html(caseDetails.ActualHours);
                    $('#reviewForm #status').val(caseDetails.Status);
                    $('#reviewForm #category').val(caseDetails.Category);
                    $('#reviewForm #PriorityLevel').val(caseDetails.PriorityLevel);
                    $('#reviewForm #manHours').val(caseDetails.ChargeHours);
                    $('#reviewForm #scheduleDateFrom').val(caseDetails.DateFrom);
                    $('#reviewForm #scheduleDateTo').val(caseDetails.DateTo);
                    $('#chargeForm #actualManHours').val(caseDetails.ChargeHours);

                    // $('#reviewForm #actualManHours').val(caseDetails.ActualHours);
                    $('#ServiceForm #ServiceCaseID').val(caseDetails.FLID);
                    $('#ServiceForm #ServiceOrganisation').val(caseDetails.Organisation);
                    $('#ServiceForm #ServiceContactPerson').val(caseDetails.ContactPerson);
                    $('#ServiceForm #ServiceEmail').val(caseDetails.Email);
                    $('#ServiceForm #ServiceContactNo').val(caseDetails.ContactNo);

                    $('#ServiceForm #ServiceSubject').val(caseDetails.Subject);
                    $('#ServiceForm #ServiceLocation').val(caseDetails.TagData3);
                    $('#ServiceForm #ServiceDetails').val(caseDetails.Details);
                    $('#ServiceForm #ServiceStatus').val(caseDetails.Status);
                    $('#ServiceForm #ServiceCategory').val(caseDetails.Category);
                    $('#ServiceForm #ServiceType').val(caseDetails.NewType);
                    ServiceType
                }
            }
            else {
                alert(data.d.RetMsg);
            }
        },
        error: function (data) {
            alert("Error: " + data.responseJSON.d.RetMsg);
        }
    });
};

function GetCaseHistory(caseId) {
    $.ajax({
        url: apiSrc + "BCMain/FL1.GetCasesActivityLog.json",
        method: "POST",
        dataType: "json",
        xhrFields: { withCredentials: true },
        data: {
            'data': JSON.stringify({ 'FLID': caseId }),
            'WebPartKey': WebPartVal,
            'ReqGUID': getGUID()
        },
        success: function (data) {
            if ((data) && (data.d.RetVal === -1)) {
                if (data.d.RetData.Tbl.Rows.length > 0) {
                    var caseLogs = data.d.RetData.Tbl.Rows;
                    var threadContainer = ' <div class="legend"><h6>Legend</h6><ul><li class="active">User</li><li class="non-active">Staff</li></ul></div>';
                    for (var i = 0; i < caseLogs.length; i++) {
                        var date = convertDateTime(caseLogs[i].CreatedDate, 'date');
                        var time = convertDateTime(caseLogs[i].CreatedDate, 'time');
                        if (caseLogs[i].Internal) {
                            threadContainer += '<div class="thread">'
                            threadContainer += '<div class="top"> <span class="datetime">' + date + '<i> ' + time + '</i> by ' + caseLogs[i].CreatedBy + '</span> <span class="tag">Internal</span></div>'
                            threadContainer += '<div class="text">' + caseLogs[i].Details + '</div> </div>';
                        } else {
                            if (caseLogs[i].StaffOrClient == 'colorCodeActive') {
                                threadContainer += '<div class="thread" style="border-left:15px #00cc00 solid;margin-top:3px;">'
                            } else if (caseLogs[i].StaffOrClient == 'colorCodeNonActive') {
                                threadContainer += '<div class="thread" style="border-left:15px #e60000 solid;margin-top:3px;">'
                            }
                            threadContainer += '<div class="top"><span class="datetime">' + date + '<i> ' + time + '</i> by ' + caseLogs[i].CreatedBy + '</span> </div>'
                            threadContainer += '<div class="text">' + caseLogs[i].Details + '</div> </div>';
                        }
                    }
                    $('#logThread .threadLog').html(threadContainer);
                }
            }
            else {
                alert(data.d.RetMsg);
            }
        },
        error: function (data) {
            alert("Error: " + data.responseJSON.d.RetMsg);
        }
    });
};

function GetCaseInvolvement(caseId) {
    $.ajax({
        url: apiSrc + "BCMain/FL1.GetCasesInvolvement.json",
        method: "POST",
        dataType: "json",
        xhrFields: { withCredentials: true },
        data: {
            'data': JSON.stringify({ 'FLID': caseId }),
            'WebPartKey': WebPartVal,
            'ReqGUID': getGUID()
        },
        success: function (data) {
            if ((data) && (data.d.RetVal === -1)) {
                if (data.d.RetData.Tbl.Rows.length > 0) {
                    var caseInvolvements = data.d.RetData.Tbl.Rows;
                    var involvementContainer = '';
                    for (var i = 0; i < caseInvolvements.length; i++) {
                        var date = convertDateTime(caseInvolvements[i].CreatedDate, 'date');
                        var time = convertDateTime(caseInvolvements[i].CreatedDate, 'time');
                        involvementContainer += '<div class="thread">'
                        involvementContainer += '<div class="top"> <span class="datetime">' + date + '<i> ' + time + '</i> </span> </div>'
                        involvementContainer += '<div class="text">' + caseInvolvements[i].RolePerson + '</div> </div>'
                        //involvementContainer += '<div class="text">'+caseInvolvements[i].RolePerson+': '+caseInvolvements[i].Remarks+'</div> </div>'
                    }
                    $('#taskThread .threadTask').html(involvementContainer);
                }
            }
            else {
                alert(data.d.RetMsg);
            }
        },
        error: function (data) {
            alert("Error: " + data.responseJSON.d.RetMsg);
        }
    });
};

function chargeToPackage(caseID) {
    var packageID, ManHours;
    packageID = $('#chargeForm #packageID').val();
    ManHours = $('#chargeForm #actualManHours').val();
    if (packageID == '') {
        alert('Please select package to charge!');
        return false;
    }

    if (ManHours == '') {
        alert('Please fill in all mandatory fields!');
        return false;
    }

    ManHours = parseInt(ManHours);

    if (isNaN(ManHours)) {
        alert('Invalid Actual Man-hour(s)!');
        return false;
    }

    var data = { 'FLID': caseID, 'packageID': packageID, 'ManHours': ManHours };
    if (confirm("Confirming charging to package?")) {
        $.ajax({
            url: apiSrc + "BCMain/FL1.ChargeToPackageID.json",
            method: "POST",
            dataType: "json",
            xhrFields: { withCredentials: true },
            data: {
                'data': JSON.stringify(data),
                'WebPartKey': WebPartVal,
                'ReqGUID': getGUID()
            },
            success: function (data) {
                if ((data) && (data.d.RetVal === -1)) {
                    if (data.d.RetData.Tbl.Rows.length > 0) {
                        if (data.d.RetData.Tbl.Rows[0].Success == true) {
                            $.when(GetAvailablePackage(caseID)).then(function () {
                                $('#chargeForm #packageID').val('');
                                $('#chargeForm #actualManHours').val('');
                                $('#chargeForm').foundation('close');
                                GetCaseDetails(caseID);
                                GetCaseHistory(caseID);
                            });
                        } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
                    }
                }
                else {
                    alert(data.d.RetMsg);
                }
            },
            error: function (data) {
                alert("Error: " + data.responseJSON.d.RetMsg);
            }
        });
    } else {
        return false;
    }
};

function getStaffList() {
    $('#involvementForm #person').html('<option value="">-- Please Select --</option>');
    var html = '';
    var data = {};
    $.ajax({
        url: apiSrc + "BCMain/iCtc1.GetStaffList.json",
        method: "POST",
        dataType: "json",
        xhrFields: { withCredentials: true },
        data: {
            'data': JSON.stringify(data),
            'WebPartKey': WebPartVal,
            'ReqGUID': getGUID()
        },
        success: function (data) {
            if ((data) && (data.d.RetVal === -1)) {
                if (data.d.RetData.Tbl.Rows.length > 0) {
                    var staffList = data.d.RetData.Tbl.Rows;
                    for (var i = 0; i < staffList.length; i++) {
                        html += ('<option value="' + staffList[i].RoleID + '">' + staffList[i].StaffDetails + '</option>');
                    }
                }
            }
            else {
                alert(data.d.RetMsg);
            }
            $('#involvementForm #person').append(html);
        },
        error: function (data) {
            alert("Error: " + data.responseJSON.d.RetMsg);
        }
    });
}

function getOrgnaisationList() {
    $.ajax({
        url: apiSrc + "BCMain/iCtc1.getOrgnaisationList.json",
        method: "POST",
        dataType: "json",
        xhrFields: { withCredentials: true },
        data: {
            'data': JSON.stringify({}),
            'WebPartKey': WebPartVal,
            'ReqGUID': getGUID()
        },
        success: function (data) {
            if ((data) && (data.d.RetVal === -1)) {
                $('#reviewForm #organisation').html('');
                if (data.d.RetData.Tbl.Rows.length == 1) {
                    var org = data.d.RetData.Tbl.Rows[0];
                    $('#reviewForm #organisation').append('<option value="' + org.DefaultRoleID + '" selected>' + org.DisplayName + '</option>');
                } else if (data.d.RetData.Tbl.Rows.length > 0) {
                    $('#reviewForm #organisation').append('<option value="">-- Please Select --</option>');
                    var orgList = data.d.RetData.Tbl.Rows;
                    for (var i = 0; i < orgList.length; i++) {
                        $('#reviewForm #organisation').append('<option value="' + orgList[i].DefaultRoleID + '">' + orgList[i].DisplayName + '</option>');
                    }
                }
            }
            else {
                alert(data.d.RetMsg);
            }
        },
        error: function (data) {
            alert("Error: " + data.responseJSON.d.RetMsg);
        }
    });
}


function SaveServiceForm(caseID) {
    var ServiceActualDateTimeFrom, ServiceActualDateTimeTo, ServicePHWeekend, Urgent, ServiceBillingHours, BigRemarks;
    ServiceActualDateTimeFrom = $('#ServiceForm #ServiceActualDateFrom').val() + ' ' + $('#ServiceForm #ActualTimeFrom').val();
    ServiceActualDateTimeFrom = $('#ServiceForm #ServiceActualDateTo').val() + ' ' + $('#ServiceForm #ActualTimeTo').val();
    ServiceBillingHours = $('#ServiceForm #ServiceBillingHours').val();
    if ($("#ServiceForm #ServicePHWeekend").is(':checked')) {
        ServicePHWeekend = $("#ServiceForm #ServicePHWeekend").val();
    }
    if ($("#ServiceForm #ServiceUrgent").is(':checked')) {
        Urgent = $("#ServiceForm #ServiceUrgent").val();
    }
    BigRemarks = $('#ServiceForm #BigRemarks').val();

    if (ServiceActualDateTimeFrom.length == 0 || ServiceActualDateTimeTo.length == 0 || ServiceBillingHours.length == 0) {
        alert('Please fill in all mandatory fields!');
        return false;
    }

    var data = { 'FLID': caseID, 'ServiceActualDateTimeFrom': ServiceActualDateTimeTo, 'ServicePHWeekend': ServicePHWeekend, 'Urgent': Urgent, 'ServiceBillingHours': ServiceBillingHours, 'BigRemarks': BigRemarks };
    $.ajax({
        url: apiSrc + "BCMain/FL1.SaveServiceForm.json",
        method: "POST",
        dataType: "json",
        xhrFields: { withCredentials: true },
        data: {
            'data': JSON.stringify(data),
            'WebPartKey': WebPartVal,
            'ReqGUID': getGUID()
        },
        success: function (data) {
            if ((data) && (data.d.RetVal === -1)) {
                if (data.d.RetData.Tbl.Rows.length > 0) {
                    if (data.d.RetData.Tbl.Rows[0].Success == true) {
                        $('#ServiceForm #ServiceActualDateFrom').val('');
                        $('#ServiceForm #ActualTimeFrom').val('');
                        $('#ServiceForm #ServiceActualDateTo').val('');
                        $('#ServiceForm #ActualTimeTo').val('');
                        $('#ServiceForm #title').val('');
                        $('#ServiceForm #ServiceBillingHours').val('');
                        $('#ServiceForm #BigRemarks').val('');
                        $('#ServiceForm #ServicePHWeekend').removeAttr("checked")

                        $('#ServiceForm').foundation('close');
                    } else { alert(data.d.RetData.Tbl.Rows[0].ReturnMsg); }
                }
            }
            else {
                alert(data.d.RetMsg);
            }
        },
        error: function (data) {
            alert("Error: " + data.responseJSON.d.RetMsg);
        }
    });
}

function GetDropDownList(FatherId, Id, LookupCat) {
    $('#' + FatherId + ' #' + Id + '').html('');
    $('#' + FatherId + ' #' + Id + '').append('<option value="">-- Please Select --</option>');
    var data = { 'LookupCat': LookupCat };
    return $.ajax({
        url: apiSrc + "BCMain/iCtc1.GetTicketLookupVal.json",
        method: "POST",
        dataType: "json",
        xhrFields: { withCredentials: true },
        data: {
            'data': JSON.stringify(data),
            'WebPartKey': WebPartVal,
            'ReqGUID': getGUID()
        },
        success: function (data) {
            if ((data) && (data.d.RetVal === -1)) {
                if (data.d.RetData.Tbl.Rows.length > 0) {
                    var Result = data.d.RetData.Tbl.Rows;
                    for (var i = 0; i < Result.length; i++) {
                        if (Id == 'Location') {
                            $('#' + FatherId + ' #' + Id + '').append('<option value="' + Result[i].Description + '">' + Result[i].TagData3 + '</option>');
                        } else {
                            $('#' + FatherId + ' #' + Id + '').append('<option value="' + Result[i].Description + '">' + Result[i].Description + '</option>');
                        }
                    }
                }
            }
            else {
                alert(data.d.RetMsg);
            }
        },
        error: function (data) {
            alert("Error: " + data.responseJSON.d.RetMsg);
        }
    });
}
function IsValidDate(inputDate) {
    var re = /^(([0-9])|([0-2][0-9])|([3][0-1]))( )(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)( )\d{4}$/;
    return re.test(inputDate);
}

function IsValidManDay(ManDay) {
    var re = /^\d*(\.[05])?$/;
    return re.test(ManDay);
}

//convert date to dd/mm/yyyy
function convertDateTime(inputFormat, type) {
    if (inputFormat == null) {
        return '-';
    };
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat);
    if (type == 'date') {
        return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
    } else if (type == 'datetime') {
        return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/') + ' ' + [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
    } else if (type == 'time') {
        return [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
    }
};
function IsValidContact(contactno) {
    var re = /^[6389]\d{7}$/;
    return re.test(contactno);
}
function IsValidEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
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
