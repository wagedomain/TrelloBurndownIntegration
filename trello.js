// trello variables
var api_key = "YOUR_API_KEY";
var api_token = "YOUR_API_TOKEN";
var board_id = "YOUR_BOARD_ID";
var url = "https://api.trello.com/1/";
// google variables
var spreadsheet = "YOUR_SPREADSHEET_ID";
 
var key_and_token = "key="+api_key+"&token="+api_token;
 
var pointsPerListAndLabel = function(lists) {
  
  var pointsPerList = {};
  //configure for a different the column order
  var d = new Date();
  var m = d.getMonth();
  var y = d.getYear();
  var date = d.getDate();
  pointsPerList.Date = (m+1)+"-"+date+"-"+y;
  pointsPerList.Done = 0;
  pointsPerList.Bugs = 0;
  pointsPerList.Total = 0;
  pointsPerList.Burned = 0;
 
  
  for (var i=0; i < lists.length; i++) { //
    var list = lists[i];
    if(list.closed) continue; //ignore closed / archived lists
    
    for (var j=0; j < list.cards.length; j++) {
      var card = list.cards[j];
      var response = UrlFetchApp.fetch(url + "cards/" + card.id + "/?" + key_and_token);
      var full_card = JSON.parse(response.getContentText());
      if(!full_card) continue;
      if(full_card.labels != null && full_card.labels.length > 0){         
        var n = card.name.match(/\((\d+)\)/);
        if(n && list.name != "Sprint Backlog") { //ignore Backlog and Cards with no points
          var points = parseInt(n[1]);          
          pointsPerList["Total"] += points;
          if(list.name == "Done" || list.name == "QA") {
            pointsPerList["Done"] += points;
          }            
        }
        if(list.name == "Bugs" && !card.closed){
           pointsPerList["Bugs"] += 1; 
          }
      }        
    }
  }
  pointsPerList.Burned = pointsPerList.Total - pointsPerList.Done;
  return pointsPerList;
}
 
//configure the data row inserted into the spreadsheet
var data_row = function(pointsPerListAndLabel) {
  var result = [];
  for(list_name in pointsPerListAndLabel) {
      result.push(pointsPerListAndLabel[list_name]);
  }
  return result;
}
 
//called by google docs apps
function main() {
  var response = UrlFetchApp.fetch(url + "boards/" + board_id + "/lists/all/?" + key_and_token + "&cards=all");
  var lists = JSON.parse((response.getContentText()));
  var points = pointsPerListAndLabel(lists);
  Logger.log(points);
  var ss = SpreadsheetApp.openById(spreadsheet).getActiveSheet();
  ss.appendRow(data_row(points));
}