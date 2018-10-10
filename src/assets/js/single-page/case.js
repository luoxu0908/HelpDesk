var RoleName = '', PrintFlag = '', FileID = '', caseID = '', TargetRoleID = '', TimeTypeMap = {};
var startDate = '', endDate = '', standDate = '', execCount = 0.0, actualHour = 0.0, billingHours = 0.0, hourDeatils = '',
offSetHour = 0.0, ServiceTimePoint9, ServiceTimePoint18, ServiceTimePoint22, ServiceTimePoint24;

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
    $('#PrintService').click(function () {
        DoPrintServiceForm();
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
        if (RoleName == 'Admin') {

        } else if (RoleName == 'Clients') {
            $('#AddNewActivity').show();
        } else if (RoleName == 'Support Developer') {
            $('.supportControl').show();
        } else if (RoleName == 'Support Team Lead') {
            getStaffList();
            $('.teamLeadControl, .supportControl').show();
        }
    });

    $('#activityForm #submit').click(function () {
        addNewActivity(caseID);
    });

    $('#involvementForm #submit').click(function () {
        addNewInvolvement(caseID);
    });

    $('#RemoveinvolvementForm #submit').click(function () {
        RemoveNewInvolvement(caseID);
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
            //$('#ServiceForm #ContactNoLb').html('ContactNo<span style="color:red">*</span>');

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
    , GetDropDownList('reviewForm', 'PriorityLevel', 'PriorityLevel'), GetDropDownList('reviewForm', 'Type', 'Type')).then(function () {
        $('#reviewForm #organisation').attr('disabled', 'disabled');
        $.when(GetCaseDetails(caseID)).then(function () {
          GetServiceChargeToPackage('ServiceForm', 'ServiceChargeToPackage', '');
            GetOrgAddressLocation('OrgAddressLocation', TargetRoleID);
        });
        GetCaseHistory(caseID);
        GetreviewCase(caseID);
        getRemoveStaffList(caseID);
    });
    GetServicePoint('ServiceTimePoint');
    GetTimeClockType();
    $("#ServiceForm #ServicePHWeekend").click(function () {
        actualHour = $('#ServiceForm #ServiceActualHours').val();
        billingHours = $('#ServiceForm #ServiceBillingHours').val();
        actualHour = parseFloat(actualHour);
        billingHours = parseFloat(billingHours);
        PHWeekend = parseFloat(TimeTypeMap['PHWeekend']) || 2;
        if ($(this).is(':checked')) {
            actualHour = actualHour * PHWeekend;
            billingHours = billingHours * PHWeekend;
        } else {
            actualHour = actualHour / PHWeekend;
            billingHours = billingHours / PHWeekend;
        }
        if ($('#ServiceForm #ServiceType').val() == 'Professional Service') {
            billingHours = 0;
        }

        $('#ServiceForm #ServiceActualHours').val(actualHour);
        $('#ServiceForm #ServiceBillingHours').val(billingHours);
    });

    $("#ServiceForm #ServiceUrgent").click(function () {
        actualHour = $('#ServiceForm #ServiceActualHours').val();
        billingHours = $('#ServiceForm #ServiceBillingHours').val();
        actualHour = parseFloat(actualHour);
        billingHours = parseFloat(billingHours);
        UrgentTime = parseFloat(TimeTypeMap['Urgent']) || 2;
        if ($(this).is(':checked')) {
            actualHour = actualHour * UrgentTime;
            billingHours = billingHours * UrgentTime;
        } else {
            actualHour = actualHour / UrgentTime;
            billingHours = billingHours / UrgentTime;
        }
        if ($('#ServiceForm #ServiceType').val() == 'Professional Service') {
            billingHours = 0;
        }
        $('#ServiceForm #ServiceActualHours').val(actualHour);
        $('#ServiceForm #ServiceBillingHours').val(billingHours);
    });

    $('#ServiceForm #ActualTimeFrom').change(function () {
        ecexHourSetting();
    });

    $('#ServiceForm #ActualTimeTo').change(function () {
        ecexHourSetting();
    });
    $('#ServiceForm #ServiceActualDateFrom').change(function () {
        ecexHourSetting();
    });

    $('#ServiceForm #ServiceActualDateTo').change(function () {
        ecexHourSetting();
    });
    $('#ServiceForm #ServiceOffSetHours').change(function () {
        ecexHourSetting();
    });

    $('#activityForm').on('closed.zf.reveal', function () {
        $('#activityForm :input').removeAttr('disabled');
        $('#activityForm [name=interval]').prop('checked', false)
        $('#activityForm #description').val('');
        $('#activityForm #ReasonDiv,#VoidByDiv').hide().find(':input').val('');
        $('#activityForm #submit').show();
    });
});

function AddNewServiceForm() {
    $('#ServiceForm #submit').show();
    $('#ServiceForm #PrintService').show();
    $('#ServiceForm #ServiceActualDateFrom').removeAttr("disabled");
    $('#ServiceForm #ActualTimeFrom').removeAttr("disabled");
    $('#ServiceForm #ServiceActualDateTo').removeAttr("disabled");
    $('#ServiceForm #ActualTimeTo').removeAttr("disabled");
    $('#ServiceForm #ServicePHWeekend').removeAttr("disabled");
    $('#ServiceForm #ServiceUrgent').removeAttr("disabled");
    $('#ServiceForm #ServiceOffSetHours').removeAttr("disabled");
    $('#ServiceForm #ServiceReason').removeAttr("disabled");
    $('#ServiceForm #ServiceChargeToPackage').removeAttr("disabled");
    $('#ServiceForm #ServiceDiagnosis').removeAttr("disabled");
    $('#ServiceForm #ServiceBigRemarks').removeAttr("disabled");
    $('#ServiceForm #ServiceName1').removeAttr("disabled");
    $('#ServiceForm #ServiceEmail1').removeAttr("disabled");
    $('#ServiceForm #ServiceContactNo1').removeAttr("disabled");
    $('#ServiceForm #ServiceCustomerAck').removeAttr("disabled");
    $('#ServiceForm #ServiceVoid,#ServiceVoidByDiv').hide();
    $('#ServiceForm #ServiceContactNoDiv').hide();
    var urlParams = new URLSearchParams(window.location.search),
    caseID = urlParams.get('caseID');

    $.when(GetCaseDetails(caseID)).then(function () {
        window.ServiceFormID = '';
        $('#ServiceForm #ServiceCustomerAck').prop('checked', '');
        $('#ServiceForm #CustomerAckDiv').show();
        $('#ServiceForm #ServiceNameDiv').hide();
        $('#ServiceForm #ServiceEmailDiv').hide();

        $('#ServiceForm #ServicePHWeekend').prop('checked', '');
        $('#ServiceForm #ServiceUrgent').prop('checked', '');
        $('#ServiceForm #ServiceOffSetHours').val('');
        $('#ServiceForm #ServiceBillingHours').val('');
        $('#ServiceForm #ServiceActualHours').val('');
        $('#ServiceForm #ServiceReason').val('');
        $('#ServiceForm #ServiceChargeToPackage').val('');
        $('#ServiceForm #ServiceHoursCalculation').val('');
        $('#ServiceForm #ServiceDiagnosis').val('');
        $('#ServiceForm #ServiceBigRemarks').val('');
        $('#ServiceForm #ServiceName1').val('');
        $('#ServiceForm #ServiceEmail1').val('');
        $('#ServiceForm #ServiceContactNo1').val('');
        var Type=$('#reviewForm #Type').val();
        if (Type=='Remote Support') {
          $('#ServiceForm #CustomerAckDiv').hide();
        }else{
          $('#ServiceForm #CustomerAckDiv').show();
        }
        $("#ServiceForm").foundation('open');
        ecexHourSetting();
    });

}
function GetTimeClockType() {
    var data = { 'LookupCat': 'TimeClockTypes' };
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
                        TimeTypeMap[Result[i].LookupKey] = Result[i].Description;
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
function ecexHourSetting() {
    execDays();

    actualHour = 0, billingHours = 0, hourDeatils = '';
    if (execCount == 0) {
        standDate = new Date($('#ServiceForm #ServiceActualDateFrom').val());
        standDate = moment(standDate).format("MMM D YYYY");
        execHours(startDate, endDate, standDate, false, false);
    } else {
        for (var i = 0; i <= execCount; i++) {
            standDate = moment($('#ServiceForm #ServiceActualDateFrom').val()).add(i, 'days');
            standDate = moment(standDate).format("MMM D YYYY");
            if (i == 0) {
                var firstEndDate = standDate + ' ' + '24:00:00';
                execHours(startDate, firstEndDate, standDate);
            } else if (i = execCount) {
                var firstStartDate = standDate + ' ' + '00:00:00';
                execHours(standDate, endDate, standDate);
            } else {
                var tempStartDate = standDate + ' ' + '00:00:00';
                var tempEndDate = standDate + ' ' + '24:00:00';
                execHours(tempStartDate, tempEndDate, standDate);
            }
        }
    }
    offSetHour = $('#ServiceForm #ServiceOffSetHours').val() || 0;
    billingHours = parseFloat(billingHours) - parseFloat(offSetHour);
    if (parseFloat(offSetHour) > 0) {
        hourDeatils += 'Off Set Hours : ' + offSetHour;
    }
    if ($('#ServiceForm #ServiceType').val() == 'Professional Service') {
        billingHours = 0;
    }
    $('#ServiceForm #ServiceActualHours').val(actualHour);
    $('#ServiceForm #ServiceBillingHours').val(billingHours);
    $('#ServiceForm #ServiceHoursCalculation').val(hourDeatils);
}

function execDays() {
    var ServiceActualDateFrom, ActualTimeFrom, ServiceActualDateTo, ActualTimeTo;
    ServiceActualDateFrom = $('#ServiceForm #ServiceActualDateFrom').val(); ActualTimeFrom = $('#ServiceForm #ActualTimeFrom').val();
    ServiceActualDateTo = $('#ServiceForm #ServiceActualDateTo').val(); ActualTimeTo = $('#ServiceForm #ActualTimeTo').val();
    if (ServiceActualDateFrom.length > 0 && ActualTimeFrom.length > 0 && ServiceActualDateTo.length > 0 && ActualTimeTo.length > 0) {
        startDate = new Date(ServiceActualDateFrom + ' ' + ActualTimeFrom);
        endDate = new Date(ServiceActualDateTo + ' ' + ActualTimeTo);
        var startDateSame = new Date(ServiceActualDateFrom);
        var endDateSame = new Date(ServiceActualDateTo);
        execCount = moment(endDateSame).diff(startDateSame, 'days');
    }
}

function execHours(startDate, endDate, standDate) {

    var startDate = new Date(startDate);
    var endDate = new Date(endDate);
    var MorningDate = new Date(standDate + ' ' + ServiceTimePoint9);
    var AfterNoonDate = new Date(standDate + ' ' + ServiceTimePoint18);
    var NightDate = new Date(standDate + ' ' + ServiceTimePoint22);
    var LastDate = new Date(standDate + ' ' + ServiceTimePoint24);
    var Normal3 = parseFloat(TimeTypeMap['Normal3']) || 2, Normal2 = parseFloat(TimeTypeMap['Normal2']) || 1.5;
    if (startDate < MorningDate) {
        if (endDate <= MorningDate) {
            actualHour = moment(endDate).diff(startDate, 'minutes') / 60.00;
            billingHours = actualHour * Normal3;
            hourDeatils += 'from : ' + moment(startDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(endDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + actualHour + ' Billing Hours : ' + billingHours + '\r\n'
        } else if (endDate > MorningDate && endDate <= AfterNoonDate) {
            actualHour = moment(MorningDate).diff(startDate, 'minutes') / 60.00;
            billingHours = actualHour * Normal3;
            hourDeatils += 'from : ' + moment(startDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(MorningDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + actualHour + ' Billing Hours : ' + billingHours + '\r\n'

            actualHour = actualHour + moment(endDate).diff(MorningDate, 'minutes') / 60.00;
            billingHours = billingHours + moment(endDate).diff(MorningDate, 'minutes') / 60.00;
            hourDeatils += 'from : ' + moment(MorningDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(endDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + moment(endDate).diff(MorningDate, 'minutes') / 60.00 + ' Billing Hours : ' + moment(endDate).diff(MorningDate, 'minutes') / 60.00 + '\r\n'
        } else if (endDate > AfterNoonDate && endDate <= NightDate) {

            actualHour = moment(MorningDate).diff(startDate, 'minutes') / 60.00;
            billingHours = actualHour * Normal3;
            hourDeatils += 'from : ' + moment(startDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(MorningDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + actualHour + ' Billing Hours : ' + billingHours + '\r\n'

            actualHour = actualHour + moment(AfterNoonDate).diff(MorningDate, 'minutes') / 60.00;
            billingHours = billingHours + moment(AfterNoonDate).diff(MorningDate, 'minutes') / 60.00;
            hourDeatils += 'from : ' + moment(MorningDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(AfterNoonDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + moment(AfterNoonDate).diff(MorningDate, 'minutes') / 60.00 + ' Billing Hours : ' + moment(AfterNoonDate).diff(MorningDate, 'minutes') / 60.00 + '\r\n'

            actualHour = actualHour + moment(endDate).diff(AfterNoonDate, 'minutes') / 60.00;
            billingHours = billingHours + (moment(endDate).diff(AfterNoonDate, 'minutes') / 60.00) * Normal2;
            hourDeatils += 'from : ' + moment(AfterNoonDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(endDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + moment(endDate).diff(AfterNoonDate, 'minutes') / 60.00 + ' Billing Hours : ' + (moment(endDate).diff(AfterNoonDate, 'minutes') / 60.00) * 1.5 + '\r\n'

        } else if (endDate > NightDate && NightDate <= LastDate) {
            actualHour = moment(MorningDate).diff(startDate, 'minutes') / 60.00;
            billingHours = actualHour * Normal3;
            hourDeatils += 'from : ' + moment(startDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(MorningDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + actualHour + ' Billing Hours : ' + billingHours + '\r\n'

            actualHour = actualHour + moment(AfterNoonDate).diff(MorningDate, 'minutes') / 60.00;
            billingHours = billingHours + moment(AfterNoonDate).diff(MorningDate, 'minutes') / 60.00;
            hourDeatils += 'from : ' + moment(MorningDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(AfterNoonDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + moment(AfterNoonDate).diff(MorningDate, 'minutes') / 60.00 + ' Billing Hours : ' + moment(AfterNoonDate).diff(MorningDate, 'minutes') / 60.00 + '\r\n'

            actualHour = actualHour + moment(NightDate).diff(AfterNoonDate, 'minutes') / 60.00;
            billingHours = billingHours + (moment(NightDate).diff(AfterNoonDate, 'minutes') / 60.00) * Normal2;
            hourDeatils += 'from : ' + moment(AfterNoonDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(NightDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + moment(NightDate).diff(AfterNoonDate, 'minutes') / 60.00 + ' Billing Hours : ' + (moment(NightDate).diff(AfterNoonDate, 'minutes') / 60.00) * 1.5 + '\r\n'

            actualHour = actualHour + moment(endDate).diff(NightDate, 'minutes') / 60.00;
            billingHours = billingHours + (moment(endDate).diff(NightDate, 'minutes') / 60.00) * Normal3;
            hourDeatils += 'from : ' + moment(NightDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(endDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + moment(endDate).diff(NightDate, 'minutes') / 60.00 + ' Billing Hours : ' + (moment(endDate).diff(NightDate, 'minutes') / 60.00) * 2 + '\r\n'
        }

    } else if (startDate >= MorningDate && startDate < AfterNoonDate) {
        if (endDate <= AfterNoonDate) {
            actualHour = moment(endDate).diff(startDate, 'minutes') / 60.00;
            billingHours = actualHour;
            hourDeatils += 'from : ' + moment(startDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(endDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + actualHour + ' Billing Hours : ' + billingHours + '\r\n'
        } else if (endDate > AfterNoonDate && endDate <= NightDate) {
            actualHour = moment(AfterNoonDate).diff(startDate, 'minutes') / 60.00;
            billingHours = actualHour;
            hourDeatils += 'from : ' + moment(startDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(AfterNoonDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + moment(AfterNoonDate).diff(startDate, 'minutes') / 60.00 + ' Billing Hours : ' + moment(AfterNoonDate).diff(startDate, 'minutes') / 60.00 + '\r\n'
            actualHour = actualHour + moment(endDate).diff(AfterNoonDate, 'minutes') / 60.00;

            billingHours = billingHours + (moment(endDate).diff(AfterNoonDate, 'minutes') / 60.00) * Normal2;
            hourDeatils += 'from : ' + moment(AfterNoonDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(endDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + moment(endDate).diff(AfterNoonDate, 'minutes') / 60.00 + ' Billing Hours : ' + (moment(endDate).diff(AfterNoonDate, 'minutes') / 60.00) * 1.5 + '\r\n'
        } else if (endDate > NightDate && endDate <= LastDate) {
            actualHour = moment(AfterNoonDate).diff(startDate, 'minutes') / 60.00;
            billingHours = actualHour;
            hourDeatils += 'from : ' + moment(startDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(AfterNoonDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + moment(AfterNoonDate).diff(startDate, 'minutes') / 60.00 + ' Billing Hours : ' + moment(AfterNoonDate).diff(startDate, 'minutes') / 60.00 + '\r\n'

            actualHour = actualHour + moment(NightDate).diff(AfterNoonDate, 'minutes') / 60.00;
            billingHours = billingHours + moment(NightDate).diff(AfterNoonDate, 'minutes') / 60.00 * Normal2;
            hourDeatils += 'from : ' + moment(AfterNoonDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(NightDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + moment(NightDate).diff(AfterNoonDate, 'minutes') / 60.00 + ' Billing Hours : ' + moment(NightDate).diff(AfterNoonDate, 'minutes') / 60.00 * 1.5 + '\r\n'

            actualHour = actualHour + moment(endDate).diff(NightDate, 'minutes') / 60.00;
            billingHours = billingHours + moment(endDate).diff(NightDate, 'minutes') / 60.00 * Normal3;
            hourDeatils += 'from : ' + moment(NightDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(endDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + moment(endDate).diff(NightDate, 'minutes') / 60.00 + ' Billing Hours : ' + moment(endDate).diff(NightDate, 'minutes') / 60.00 * 2 + '\r\n'
        }

    } else if (startDate >= AfterNoonDate && startDate < NightDate) {

        if (endDate <= NightDate) {
            actualHour = moment(endDate).diff(startDate, 'minutes') / 60.00;
            billingHours = moment(endDate).diff(startDate, 'minutes') / 60.00 * Normal2;
            hourDeatils += 'from : ' + moment(startDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(endDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + moment(endDate).diff(startDate, 'minutes') / 60.00 + ' Billing Hours : ' + moment(endDate).diff(startDate, 'minutes') / 60.00 * 1.5 + '\r\n'
        } else if (endDate > NightDate && endDate <= LastDate) {
            actualHour = moment(NightDate).diff(startDate, 'minutes') / 60.00;
            billingHours = moment(NightDate).diff(startDate, 'minutes') / 60.00 * Normal2;
            hourDeatils += 'from : ' + moment(startDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(NightDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + moment(NightDate).diff(startDate, 'minutes') / 60.00 + ' Billing Hours : ' + moment(NightDate).diff(startDate, 'minutes') / 60.00 * 1.5 + '\r\n'

            actualHour = actualHour + moment(endDate).diff(NightDate, 'minutes') / 60.00;
            billingHours = billingHours + moment(endDate).diff(NightDate, 'minutes') / 60.00 * Normal3
            hourDeatils += 'from : ' + moment(NightDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(endDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + moment(endDate).diff(NightDate, 'minutes') / 60.00 + ' Billing Hours : ' + moment(endDate).diff(NightDate, 'minutes') / 60.00 * 2 + '\r\n'

        }
    } else if (startDate >= NightDate && endDate <= LastDate) {
        actualHour = moment(endDate).diff(startDate, 'minutes') / 60.00;
        billingHours = actualHour * Normal3;
        hourDeatils += 'from : ' + moment(startDate).format("MMM D YYYY, hh:mm a") + ' to : ' + moment(endDate).format("MMM D YYYY, hh:mm a") + ' actual hours : ' + moment(endDate).diff(startDate, 'minutes') / 60.00 + ' Billing Hours : ' + actualHour * 2 + '\r\n'
    }
}
function DoPrintServiceForm() {

    GetDoPrintServiceForm();
    var printData = document.getElementById("PrintServiceForm").innerHTML;
    window.document.body.innerHTML = printData
    window.print()
}

function GetDoPrintServiceForm(){
  $('#PrintServiceForm .PrintCaseID').html($('#ServiceForm #ServiceCaseID').val()||'');
  $('#PrintServiceForm .PrintOrganisation').html($('#ServiceForm #ServiceOrganisation').val()||'');
  $('#PrintServiceForm .PrintContactPerson').html($('#ServiceForm #ServiceContactPerson').val());
  $('#PrintServiceForm .PrintEmail1').html($('#ServiceForm #ServiceEmail').val());
  $('#PrintServiceForm .PrintContactNo1').html($('#ServiceForm #ServiceContactNo').val());
  $('#PrintServiceForm .PrintSubject').html($('#ServiceForm #ServiceSubject').val());
  $('#PrintServiceForm .PrintLocation').html($('#ServiceForm #ServiceLocation').val());
  $('#PrintServiceForm .PrintDetails').html($('#ServiceForm #ServiceDetails').val());
  $('#PrintServiceForm .PrintStatus').html($('#ServiceForm #ServiceStatus').val());
  $('#PrintServiceForm .PrintCategory').html($('#ServiceForm #ServiceCategory').val());
  $('#PrintServiceForm .PrintType').html($('#ServiceForm #ServiceType').val());
  $('#PrintServiceForm .PrintActualDateFrom').html( $('#ServiceForm #ServiceActualDateFrom').val());
  $('#PrintServiceForm .PrintActualTimeFrom').html($('#ServiceForm #ActualTimeFrom').val());
  $('#PrintServiceForm .PrintActualDateTo').html($('#ServiceForm #ServiceActualDateTo').val());
  $('#PrintServiceForm .PrintActualTimeTo').html($('#ServiceForm #ActualTimeTo').val());

  if ($("#ServiceForm #ServicePHWeekend").is(':checked')) {
      $('#PrintServiceForm .PrintPHWeekend').html('Yes');
  }else{
    $('#PrintServiceForm .PrintPHWeekend').html('No');
  }

  if ($("#ServiceForm #ServiceUrgent").is(':checked')) {
      $('#PrintServiceForm .PrintUrgent').html('Yes');
  }else{
      $('#PrintServiceForm .PrintUrgent').html('No');
  }

  $('#PrintServiceForm .PrintActualHours').html($('#ServiceForm #ServiceActualHours').val());
  $('#PrintServiceForm .PrintOffSetHours').html($('#ServiceForm #ServiceOffSetHours').val());
  $('#PrintServiceForm .PrintOffSetReason').html($('#ServiceForm #ServiceReason').val());
  $('#PrintServiceForm .PrintBillingHours').html($('#ServiceForm #ServiceBillingHours').val());
  $('#PrintServiceForm .PrintChargeToPackage').html($('#ServiceForm #ServiceChargeToPackage').val());
  $('#PrintServiceForm .ServiceHoursCalculation').html($('#ServiceForm #ServiceHoursCalculation').val());
  $('#PrintServiceForm .PrintDiagnosis').html($('#ServiceForm #ServiceDiagnosis').val() );
  $('#PrintServiceForm .PrintFollowRemarks').html($('#ServiceForm #ServiceBigRemarks').val());

  if ($("#ServiceForm #ServiceCustomerAck").is(':checked')) {
      $('#PrintServiceForm .PrintCustomerAck').html('Yes');
  }else{
      $('#PrintServiceForm .PrintCustomerAck').html('No');
  }
  $('#PrintServiceForm .PrintName2').html($('#ServiceForm #ServiceName1').val());
  $('#PrintServiceForm .PrintEmail2').html($('#ServiceForm #ServiceEmail1').val());
  $('#PrintServiceForm .PrintContactNo2').html($('#ServiceForm #ServiceContactNo1').val());
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
function RemoveNewInvolvement(caseID) {
    var staff, task;
    staff = $('#RemoveinvolvementForm #RemovePerson').val();
    task = $('#involvementForm #task').val();


    var data = { 'FLID': caseID, 'RoleID': staff};
    $.ajax({
        url: apiSrc + "BCMain/FL1.RemoveInvolvement.json",
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
                        getRemoveStaffList(caseID);
                        GetCaseHistory(caseID);
                        $('#RemoveinvolvementForm #RemovePerson').val('');
                        $('#RemoveinvolvementForm').foundation('close');
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
    var Description, internal, Reason, Void;
    Description = $('#activityForm #description').val();

    internal = $("#activityForm [name=internal]:checked").val()||'';
    Void = false;
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
    if ($("#activityForm #Reason").is(':visible')) {
        Reason = $('#activityForm #Reason').val() || '';
        if (Reason.length <= 0) {
            alert('Please fill in Void Reason!');
            return false;
        }
        Void = true;
    }
    var data = { 'FLID': caseID, 'Details': Description, 'Internal': internal, 'Reason': Reason || '', 'Void': Void||false, 'FLLogID': window.FLLogID || '' };
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

//Get Case Details
function GetCaseDetails(caseId) {
    return $.ajax({
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
                    TargetRoleID = caseDetails.TargetRoleID;
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
                    $('#reviewInfo .manHours').html(caseDetails.ActualHours);
                    $('#reviewInfo .actualHour').html(caseDetails.BillingHours);
                    $('#reviewInfo .type').html(caseDetails.NewType);


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

                    if (caseDetails.NewType == 'Remote Support') {
                        $('#ServiceForm #CustomerAckDiv').hide();
                    } else if (caseDetails.NewType == 'Onsite Support') {
                        $('#ServiceForm #CustomerAckDiv').show();
                        $('#ServiceForm #ServiceCustomerAck').prop('checked', 'checked')
                    }
                    $('#ServiceForm #ServiceActualDateFrom').val(moment(caseDetails.DateFrom).format('YYYY-MM-DD'));
                    $('#ServiceForm #ActualTimeFrom').val(moment(caseDetails.DateFrom).format('HH:mm'));
                    $('#ServiceForm #ServiceActualDateTo').val(moment(caseDetails.DateTo).format('YYYY-MM-DD'));
                    $('#ServiceForm #ActualTimeTo').val(moment(caseDetails.DateTo).format('HH:mm'));
                    $('#ServiceForm #ServiceName1').val(caseDetails.ServiceName);
                    $('#ServiceForm #ServiceEmail1').val(caseDetails.ServiceEmail);

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
                            //threadContainer += '<div class="thread">'

                            if (caseLogs[i].StaffOrClient == 'colorCodeActive') {
                                threadContainer += '<div class="thread" style="border-left:15px #00cc00 solid;margin-top:3px;">'
                            } else if (caseLogs[i].StaffOrClient == 'colorCodeNonActive') {
                                threadContainer += '<div class="thread" style="border-left:15px #e60000 solid;margin-top:3px;">'
                            }

                            threadContainer += '<div class="top"> <span class="datetime">' + date + '<i> ' + time + '</i> by ' + caseLogs[i].CreatedBy + '</span> <span class="tag">Internal</span>'
                            if (caseLogs[i].Status != 'Voided') {
                            threadContainer += '<span class="tag">' + caseLogs[i].Status + '</span><span class="tag" style="background:#60C2EC;cursor:pointer;color:white;" onclick=Void("' + caseLogs[i].FLLogID + '","' + caseLogs[i].Type + '","' + caseId + '")>Void</span><span class="tag" style="background:#60C2EC;cursor:pointer;color:white;" onclick=View("' + caseLogs[i].FLLogID + '","' + caseLogs[i].Type + '","' + caseId + '")>View</span></div>';
                            }
                            else {
                            threadContainer += '<span class="tag">' + caseLogs[i].Status + '</span><span class="tag" style="background:#60C2EC;cursor:pointer;color:white;" onclick=View("' + caseLogs[i].FLLogID + '","' + caseLogs[i].Type + '","' + caseId + '")>View</span></div>';
                            }
                            threadContainer += '<div class="text">' + caseLogs[i].Details + '</div> </div>';

                        } else {
                            if (caseLogs[i].StaffOrClient == 'colorCodeActive') {
                                threadContainer += '<div class="thread" style="border-left:15px #00cc00 solid;margin-top:3px;">'
                            } else if (caseLogs[i].StaffOrClient == 'colorCodeNonActive') {
                                threadContainer += '<div class="thread" style="border-left:15px #e60000 solid;margin-top:3px;">'
                            }
                            if (caseLogs[i].Status) {
                                if (caseLogs[i].Status != 'Voided') {
                                    threadContainer += '<div class="top"><span class="datetime">' + date + '<i> ' + time + '</i> by ' + caseLogs[i].CreatedBy + '</span> <span class="tag">' + caseLogs[i].Status + '</span><span class="tag" style="background:#60C2EC;cursor:pointer;color:white;" onclick=Void("' + caseLogs[i].FLLogID + '","' + caseLogs[i].Type + '","' + caseId + '")>Void</span><span class="tag" style="background:#60C2EC;cursor:pointer;color:white;" onclick=View("' + caseLogs[i].FLLogID + '","' + caseLogs[i].Type + '","' + caseId + '")>View</span></div>';
                                }
                                else {
                                    threadContainer += '<div class="top"><span class="datetime">' + date + '<i> ' + time + '</i> by ' + caseLogs[i].CreatedBy + '</span> <span class="tag">' + caseLogs[i].Status + '</span><span class="tag" style="background:#60C2EC;cursor:pointer;color:white;" onclick=View("' + caseLogs[i].FLLogID + '","' + caseLogs[i].Type + '","' + caseId + '")>View</span></div>';
                                }

                            }
                            else {
                                threadContainer += '<div class="top"><span class="datetime">' + date + '<i> ' + time + '</i> by ' + caseLogs[i].CreatedBy + '</span> </div>'
                            }
                            threadContainer += caseLogs[i].Status != 'Voided' ? ('<div  class="text">' + caseLogs[i].Details + '</div> </div>') : ('<div  class="text">This content has been voided. Please click on the view link to see details.</div> </div>');
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
function Void(FLLogID, Type, FLID) {
    //FLLOGID
    window.FLLogID = FLLogID;
    window.ServiceFormID = FLLogID;
    if (Type == 'SF') {
        $.when(getServiceDetails(FLLogID, Type)).then(function () {
            $('#ServiceForm #submit').show();
            $('#ServiceForm #ServiceVoid').show();
            $('#ServiceForm #ServiceVoidReason').removeAttr("disabled");
            $("#ServiceForm").foundation('open');
        });
    } else if (Type == 'R') {
        $.when(getServiceDetails(FLLogID, Type)).then(function () {
            $('#activityForm #ReasonDiv').show();
            $('#activityForm #description,[name=internal]').attr('disabled', 'disabled');
            $("#activityForm").foundation('open');
        });
    }
}
function View(FLLogID, Type, FLID) {
    if (Type == 'SF') {
        $.when(getServiceDetails(FLLogID, Type)).then(function () {
            $('#ServiceForm #ServiceVoidReason').attr('disabled', 'disabled');
            $("#ServiceForm").foundation('open');
        });
    } else if (Type == 'R') {
        $.when(getServiceDetails(FLLogID, Type)).then(function () {

            $('#activityForm #submit').hide();
            $('#activityForm #description,[name=internal],#Reason,#VoidBy,#VoidDate').attr('disabled', 'disabled');
            $("#activityForm").foundation('open');
        });
    }
}
function getServiceDetails(FLLogID, Type) {
    return $.ajax({
        url: apiSrc + "BCMain/FL1.ViewCaseHistory.json",
        method: "POST",
        dataType: "json",
        xhrFields: { withCredentials: true },
        data: {
            'data': JSON.stringify({ 'FLLogID': FLLogID, 'Type': Type }),
            'WebPartKey': WebPartVal,
            'ReqGUID': getGUID()
        },
        success: function (data) {
            if ((data) && (data.d.RetVal === -1)) {
                if (data.d.RetData.Tbl.Rows.length > 0) {
                    var caseDetails = data.d.RetData.Tbl.Rows[0];
                    if (caseDetails.Type && caseDetails.Type == 'R') {
                        $('#activityForm #description').val(caseDetails.Details || '');
                        caseDetails.Internal ? $('#activityForm #internal').prop('checked', true) : $('#activityForm #internalAll').prop('checked', true);
                        $('#activityForm #Reason').val(caseDetails.Reason || '');
                        $('#activityForm #VoidBy').val(caseDetails.VoidBy || '');
                        if (caseDetails.VoidDate) {
                            $('#activityForm #VoidDate').val(moment(caseDetails.VoidDate).format('YYYY-MM-DD'));
                        }
                      if (caseDetails.Status=='Voided') {
                          $('#activityForm #ReasonDiv').show();
                          $('#activityForm #VoidByDiv').show();
                      }else{
                          $('#activityForm #ReasonDiv').hide();
                          $('#activityForm #VoidByDiv').hide();
                      }

                    } else if (caseDetails.Type && caseDetails.Type == 'SF') {
                        $('#ServiceForm #submit').hide();
                        $('#ServiceForm #PrintService').hide();
                        $('#ServiceForm #ServicePHWeekend').prop('checked', Boolean(parseFloat(caseDetails.PHWeekend||'')));
                        $('#ServiceForm #ServiceUrgent').prop('checked',Boolean(parseFloat(caseDetails.Urgent||'')));
                        $('#ServiceForm #ServiceActualHours').val(caseDetails.ActualHours);
                        $('#ServiceForm #ServiceOffSetHours').val(caseDetails.OffSetHours);
                        $('#ServiceForm #ServiceReason').val(caseDetails.OffSetReason);
                        $('#ServiceForm #ServiceBillingHours').val(caseDetails.BillingHours);
                        $('#ServiceForm #ServiceChargeToPackage').val(caseDetails.PackageType||'');
                        $('#ServiceForm #ServiceHoursCalculation').val(caseDetails.HoursCalculation);
                        $('#ServiceForm #ServiceDiagnosis').val(caseDetails.Diagnosis);
                        $('#ServiceForm #ServiceBigRemarks').val(caseDetails.FollowupRemarks);
                        $('#ServiceForm #ServiceActualDateFrom').val(moment(caseDetails.StartDate).format('YYYY-MM-DD'));
                        $('#ServiceForm #ActualTimeFrom').val(moment(caseDetails.StartDate).format('HH:mm'));
                        $('#ServiceForm #ServiceActualDateTo').val(moment(caseDetails.EndDate).format('YYYY-MM-DD'));
                        $('#ServiceForm #ActualTimeTo').val(moment(caseDetails.EndDate).format('HH:mm'));

                        $('#ServiceForm #ServiceVoidReason').val(caseDetails.Reason || '');
                        $('#ServiceForm #ServiceVoidBy').val(caseDetails.DisPlayName || '');
                        $('#ServiceForm #ServiceVoidDate').val(caseDetails.VoidDate || '');

                        if(caseDetails.STATUS=='Voided'){
                          $('#ServiceForm #ServiceVoid,#ServiceVoidByDiv').show();
                        }else{
                          $('#ServiceForm #ServiceVoid,#ServiceVoidByDiv').hide();
                        }

                        var CustomerAck = caseDetails.CustomerAck || '';
                        if (CustomerAck == '1' || CustomerAck == 1) {
                            $('#ServiceForm #ServiceCustomerAck').prop('checked', 'checked');
                            $('#ServiceForm #CustomerAckDiv').show();
                        } else {
                            $('#ServiceForm #ServiceCustomerAck').prop('checked', '');
                            $('#ServiceForm #CustomerAckDiv').hide();
                        }



                        $.when(GetServiceChargeToPackage('ServiceForm', 'ServiceChargeToPackage', '')).then(function () {
                            $('#ServiceForm #ServiceChargeToPackage').val(caseDetails.PackageType);
                        });
                        if ($('#ServiceForm #ServiceCustomerAck').is(':checked')) {
                            $('#ServiceForm #ServiceNameDiv').show();
                            $('#ServiceForm #ServiceEmailDiv').show();
                            $('#ServiceForm #ServiceContactNoDiv').show();
                            $('#ServiceForm #NameLb').html('Name<span style="color:red">*</span>');
                            $('#ServiceForm #EmailLb').html('Email<span style="color:red">*</span>');
                              //$('#ServiceForm #ContactNoLb').html('ContactNo<span style="color:red">*</span>');
                            $('#ServiceForm #ServiceName1').val(caseDetails.ServiceName);
                            $('#ServiceForm #ServiceEmail1').val(caseDetails.ServiceEmail);
                            $('#ServiceForm #ServiceContactNo1').val(caseDetails.ServiceContactNo);

                        } else {
                            $('#ServiceForm #ServiceNameDiv').hide();
                            $('#ServiceForm #ServiceEmailDiv').hide();
                            $('#ServiceForm #ServiceContactNoDiv').hide();
                        }
                        $('#ServiceForm #ServiceActualDateFrom').attr("disabled", "disabled");
                        $('#ServiceForm #ActualTimeFrom').attr("disabled", "disabled");
                        $('#ServiceForm #ServiceActualDateTo').attr("disabled", "disabled");
                        $('#ServiceForm #ActualTimeTo').attr("disabled", "disabled");
                        $('#ServiceForm #ServicePHWeekend').attr("disabled", "disabled");
                        $('#ServiceForm #ServiceUrgent').attr("disabled", "disabled");
                        $('#ServiceForm #ServiceOffSetHours').attr("disabled", "disabled");
                        $('#ServiceForm #ServiceReason').attr("disabled", "disabled");
                        $('#ServiceForm #ServiceChargeToPackage').attr("disabled", "disabled");
                        $('#ServiceForm #ServiceHoursCalculation').attr("disabled", "disabled");
                        $('#ServiceForm #ServiceDiagnosis').attr("disabled", "disabled");
                        $('#ServiceForm #ServiceBigRemarks').attr("disabled", "disabled");
                        $('#ServiceForm #ServiceName1').attr("disabled", "disabled");
                        $('#ServiceForm #ServiceEmail1').attr("disabled", "disabled");
                        $('#ServiceForm #ServiceContactNo1').attr("disabled", "disabled");
                        $('#ServiceForm #ServiceCustomerAck').attr("disabled", "disabled");
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

function getRemoveStaffList(caseID) {
    $('#RemoveinvolvementForm #RemovePerson').html('<option value="">-- Please Select --</option>');
    var html = '';
    var data = {'FLID': caseID};
    $.ajax({
        url: apiSrc + "BCMain/iCtc1.GetRemoveStaffList.json",
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
            $('#RemoveinvolvementForm #RemovePerson').append(html);
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
    var ServicePHWeekend = 0, Urgent = 0, ServiceCustomerAck = 0, ServiceName1 = '', ServiceEmail1 = '', ServiceContactNo1 = '';
    var ServiceActualDateFrom = $('#ServiceForm #ServiceActualDateFrom').val(),
    ServiceActualDateTo = $('#ServiceForm #ServiceActualDateTo').val(),
    ActualTimeFrom = $('#ServiceForm #ActualTimeFrom').val(),
    ActualTimeTo = $('#ServiceForm #ActualTimeTo').val(),
    ServiceActualDateTimeFrom = ServiceActualDateFrom + ' ' + ActualTimeFrom,
    ServiceActualDateTimeTo = ServiceActualDateTo + ' ' + ActualTimeTo;
    if (moment(ServiceActualDateTimeTo).diff(ServiceActualDateTimeFrom) <= 0) {
        alert('Actual date to need more than actual date from.');
        return false;
    }


    if ($("#ServiceForm #ServicePHWeekend").is(':checked')) {
        ServicePHWeekend = $("#ServiceForm #ServicePHWeekend").val();
    }

    if ($("#ServiceForm #ServiceUrgent").is(':checked')) {
        Urgent = $("#ServiceForm #ServiceUrgent").val();
    }
    var ServiceActualHours = $("#ServiceForm #ServiceActualHours").val() || '';
    var ServiceOffSetHours = $("#ServiceForm #ServiceOffSetHours").val() || '';
    var ServiceReason = $("#ServiceForm #ServiceReason").val() || '';
    if (ServiceOffSetHours.length > 0) {
        if (ServiceReason.length == 0) {
            alert('Please fill in OffSet Reason fields!');
            return false;
        }
    }
    var ServiceBillingHours = $("#ServiceForm #ServiceBillingHours").val() || '';
    var ServiceChargeToPackage = $("#ServiceForm #ServiceChargeToPackage").val() || '';
    var ServiceHoursCalculation = $("#ServiceForm #ServiceHoursCalculation").val() || '';
    var ServiceDiagnosis = $("#ServiceForm #ServiceDiagnosis").val() || '';
    var ServiceBigRemarks = $("#ServiceForm #ServiceBigRemarks").val() || '';


    if (ServiceActualDateFrom.length == 0 || ServiceActualDateTo.length == 0 || ActualTimeFrom.length == 0 || ActualTimeTo.length == 0 || ServiceChargeToPackage.length == 0) {
        alert('Please fill in all mandatory fields!');
        return false;
    }
    if ($('#ServiceForm #ServiceCustomerAck').is(':checked')) {
        ServiceCustomerAck = $('#ServiceForm #ServiceCustomerAck').val();
        ServiceName1 = $("#ServiceForm #ServiceName1").val() || '';
        ServiceEmail1 = $("#ServiceForm #ServiceEmail1").val() || '';
        ServiceContactNo1 = $("#ServiceForm #ServiceContactNo1").val() || '';
        if (ServiceName1.length == 0) {
            alert('Please fill in Name fields!');
            return false;
        }
        if (ServiceEmail1.length == 0) {
            alert('Please fill in Email fields!');
            return false;
        }
    }

    var UpdateVoid = $('#ServiceForm #ServiceVoidReason').is(':visible');
    var ServiceVoidReason = $("#ServiceForm #ServiceVoidReason").val() || '';
    if (UpdateVoid == true) {
        if (ServiceVoidReason.length == 0) {
            alert('Please fill in void reason fields!');
            return false;
        }
    }else{
      if ($('#ServiceForm #ServiceType').val()!='Remote Support') {
          if (!$('#ServiceForm #ServiceCustomerAck').is(':checked'))
          {
            alert('Please tikc Customer Acknowledgement!');
            return false;
          }
      }
    }
    var data = {
        'FLID': caseID, 'ServiceActualDateTimeFrom': ServiceActualDateTimeFrom, 'ServiceActualDateTimeTo': ServiceActualDateTimeTo,
        'ServicePHWeekend': ServicePHWeekend, 'Urgent': Urgent, 'ServiceActualHours': ServiceActualHours, 'ServiceOffSetHours': ServiceOffSetHours, 'ServiceReason': ServiceReason,
        'ServiceBillingHours': ServiceBillingHours, 'ServiceChargeToPackage': ServiceChargeToPackage, 'ServiceHoursCalculation': ServiceHoursCalculation,
        'ServiceDiagnosis': ServiceDiagnosis, 'ServiceBigRemarks': ServiceBigRemarks, 'ServiceCustomerAck': ServiceCustomerAck, 'ServiceName1': ServiceName1,
        'ServiceEmail1': ServiceEmail1, 'ServiceContactNo1': ServiceContactNo1, 'ServiceFormID': window.ServiceFormID, 'ServiceVoidReason': ServiceVoidReason
    };
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
                        caseID=$('#ServiceForm #ServiceCaseID').val();
                        GetCaseHistory(caseID);
                        alert('update success')
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

function GetServiceChargeToPackage(FatherId, Id, LookupCat) {
    $('#' + FatherId + ' #' + Id + '').html('');
    $('#' + FatherId + ' #' + Id + '').append('<option value="">-- Please Select --</option>');
    $('#' + FatherId + ' #' + Id + '').append('<option value="Quotation">Quotation</option>');
    var data = { 'LookupCat': '', 'RoleID': TargetRoleID };
    return $.ajax({
        url: apiSrc + "BCMain/iCtc1.GetOrgTicketPackageType.json",
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
                        $('#' + FatherId + ' #' + Id + '').append('<option value="' + Result[i].Description + '">' + Result[i].Description + '</option>');
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

function GetServicePoint(LookupCat) {
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
                        if (Result[i].Description == '09:00:00') {
                            ServiceTimePoint9 = Result[i].Description
                        } else if (Result[i].Description == '18:00:00') {
                            ServiceTimePoint18 = Result[i].Description
                        }
                        else if (Result[i].Description == '22:00:00') {
                            ServiceTimePoint22 = Result[i].Description
                        }
                        else if (Result[i].Description == '24:00:00') {
                            ServiceTimePoint24 = Result[i].Description
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

function GetOrgAddressLocation(LookupCat, organization) {
    var data = { 'LookupCat': LookupCat, 'Organization': organization };
    return $.ajax({
        url: apiSrc + "BCMain/FL1.OrgAddressLocation.json",
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
                $('#reviewForm #Location').html('');
                if (data.d.RetData.Tbl.Rows.length > 0) {
                    var list = data.d.RetData.Tbl.Rows;
                    for (var i = 0; i < list.length; i++) {
                        $('#reviewForm #Location').append('<option value="' + list[i].LookupKey + '">' + list[i].TagData3 + '</option>');
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
