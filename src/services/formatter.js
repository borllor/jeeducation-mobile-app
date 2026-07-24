var formatter = {
  formatDate: function (strValue, format) {
    if (strValue == null || strValue == "") return "";
    let y = "dd/MM/yyyy";
    if (format) y = format;
    let x = new Date(strValue);
    var z = {
      M: x.getMonth() + 1,
      d: x.getDate(),
      h: x.getHours(),
      m: x.getMinutes(),
      s: x.getSeconds(),
    };
    y = y.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
      return ((v.length > 1 ? "0" : "") + z[v.slice(-1)]).slice(-2);
    });

    return y.replace(/(y+)/g, function (v) {
      return x
        .getFullYear()
        .toString()
        .slice(-v.length);
    });
  },
  smartFormatDate: function (date) {
    if (typeof date == "string") {
      date = new Date(date);
    }
    var strArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var d = date.getDate();
    var m = strArray[date.getMonth()];
    var y = date.getFullYear();
    var hour = date.getHours();
    var minute = date.getMinutes();
    let smallHour = hour <= 12 ? hour : hour - 12;
    if (new Date().getFullYear() == y) {
      return `${m} ${(d <= 9 ? '0' + d : d)} at ${("0" + smallHour).slice(-2)}:${("0" + minute).slice(-2)} ${hour < 12 ? 'AM' : 'PM'}`;
    } else {
      return `${m} ${(d <= 9 ? '0' + d : d)}, ${y}`;
    }
  },
  formatDecimal: function (val, decimalPlaces) {
    decimalPlaces = decimalPlaces || 2;
    val = val || 0;
    let numVal = 0;
    if (typeof val != "number") {
      numVal = parseFloat(val);
    } else {
      numVal = val;
    }
    return numVal.toFixed(decimalPlaces);
  },
  formatGrade: function (grade) {
    let gradeStr = grade + "";
    gradeStr = gradeStr.toUpperCase();
    gradeStr = gradeStr.indexOf("YEAR") >= 0 ? gradeStr : `YEAR${grade}`;
    if (import.meta.env.VUE_APP_ROLE === "admin") {
      return gradeStr;
    }

    if (gradeStr === "YEAR6") {
      return "Junior Level 1";
    }
    if (gradeStr === "YEAR7") {
      return "Junior Level 2";
    }
    if (gradeStr === "YEAR8") {
      return "Junior Level 3";
    }
    if (gradeStr === "YEAR9") {
      return "Junior Level 4";
    }
    if (gradeStr === "YEAR10") {
      return "Senior Level 1";
    }
    if (gradeStr === "YEAR11") {
      return "Senior Level 2";
    }
    if (gradeStr === "YEAR12") {
      return "Senior Level 3";
    }
  },
  formatGrade2: function (grade) {
    let gradeStr = grade + "";
    gradeStr = gradeStr.toUpperCase();
    gradeStr = gradeStr.indexOf("YEAR") >= 0 ? gradeStr : `YEAR${grade}`;
    if (import.meta.env.VUE_APP_ROLE === "admin") {
      return gradeStr;
    }

    if (gradeStr === "YEAR6") {
      return "Level 1";
    }
    if (gradeStr === "YEAR7") {
      return "Level 2";
    }
    if (gradeStr === "YEAR8") {
      return "Level 3";
    }
    if (gradeStr === "YEAR9") {
      return "Level 4";
    }
    if (gradeStr === "YEAR10") {
      return "Level 1";
    }
    if (gradeStr === "YEAR11") {
      return "Level 2";
    }
    if (gradeStr === "YEAR12") {
      return "Level 3";
    }
  },
  toLowerFirstChar(strValue) {
    let val = strValue;
    if (val) {
      if (val.length > 1) val = val.substring(0, 1).toLowerCase() + val.substring(1, val.length);
      else val = val.toLowerCase();
    }
    return val;
  },
  toUpperFirstChar(strValue) {
    let val = strValue;
    if (val) {
      if (val.length > 1) val = val.substring(0, 1).toUpperCase() + val.substring(1, val.length);
      else val = val.toUpperCase();
    }
    return val;
  },
  timeAgo(time) {
    switch (typeof time) {
      case 'number':
        break;
      case 'string':
        time = +new Date(time);
        break;
      case 'object':
        if (time.constructor === Date) time = time.getTime();
        break;
      default:
        time = +new Date();
    }
    var time_formats = [
      [60, 'seconds', 1], // 60
      [120, '1 minute ago', '1 minute from now'], // 60*2
      [3600, 'minutes', 60], // 60*60, 60
      [7200, '1 hour ago', '1 hour from now'], // 60*60*2
      [86400, 'hours', 3600], // 60*60*24, 60*60
      [172800, 'Yesterday', 'Tomorrow'], // 60*60*24*2
      [604800, 'days', 86400], // 60*60*24*7, 60*60*24
      [1209600, 'Last week', 'Next week'], // 60*60*24*7*4*2
      [2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
      [4838400, 'Last month', 'Next month'], // 60*60*24*7*4*2
      [29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
      [58060800, 'Last year', 'Next year'], // 60*60*24*7*4*12*2
      [2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
      [5806080000, 'Last century', 'Next century'], // 60*60*24*7*4*12*100*2
      [58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
    ];
    var seconds = (+new Date() - time) / 1000,
      token = 'ago',
      list_choice = 1;

    if (seconds == 0) {
      return 'Just now'
    }
    if (seconds < 0) {
      seconds = Math.abs(seconds);
      token = 'from now';
      list_choice = 2;
    }
    var i = 0;
    var format;
    while ((format = time_formats[i++]))
      if (seconds < format[0]) {
        if (typeof format[2] == 'string')
          return format[list_choice];
        else
          return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
      }
    return time;
  },
};
export default formatter;
