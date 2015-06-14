// a very simple example of angular/cytoscape.js integration

// context (rightclick/2finger) drag to resize in graph
// use text boxes to resize in angular


var app = angular.module('app', []);

app.controller('NodeCtrl', [ '$scope' , function( $scope ){
  // (usually better to have the srv as intermediary)

    $scope.host = $('#host_value').val();
    $scope.logo = $('#logo_value').val();

    var mapOptions = {
        zoom: 14,
        center: new google.maps.LatLng(45.055109, 7.701168),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }

    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    $scope.markers = [];

    var infoWindow = new google.maps.InfoWindow();
    var createMarker = function (info){
        var marker = new StyledMarker(
            {
                styleIcon:new StyledIcon(
                    StyledIconTypes.MARKER,
                    {
                        color:"C0C0B8",
                        text:""
                    }
                ),
                position: new google.maps.LatLng(info.lat, info.lng),
                map:$scope.map,
                title: info.name,
                acc_x: info.accelerometer_x,
                acc_y: info.accelerometer_y,
                status: info.status
            }
        );
        marker.content = '<div class="infoWindowContent"> ' +
                        "<img class='logo-class' src='"+ $scope.logo +"'/>" +
                        '<div> DriftX: ' + marker.acc_x + '</div>' +
                        '<div> DriftY: '+ marker.acc_y + '</div>' +
                        '<div> Status: ' + marker.status + '</div>' +
                        '</div>';

        google.maps.event.addListener(marker, 'click', function(){
            infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
            infoWindow.open($scope.map, marker);
        });

        $scope.markers.push(marker);
    }

    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    }

  var first_launch = true;
  var eventSrc = new EventSource($scope.host);

  eventSrc.addEventListener('message',function(response){
      if(first_launch){
         angular.forEach(JSON.parse(response.data), function(value) {
            createMarker(value);
         });
         first_launch = false;
      }else{
          var resp_data = JSON.parse(response.data);
          angular.forEach($scope.markers, function(value) {
              var found = false;
              angular.forEach(resp_data, function(resp_value) {
                if(value.title == resp_value.name){
                    value.status = resp_value.status;
                    if(value.status == 'RUNNING'){
                        value.styleIcon.set('color', '00ff00');
                    }else if(value.status =='INACTIVE'){
                        value.styleIcon.set('color', 'C0C0B8');
                    }else if(value.status =='WARNING'){
                        value.styleIcon.set('color', 'FFC500');
                    }else if(value.status =='ALARMED'){
                        value.styleIcon.set('color', 'ff0000');
                    }
                    found = true;
                }
              });
              if(!found){
                 value.styleIcon.set('color', 'C0C0B8');
              }
          });
          angular.forEach(resp_data, function(resp_value) {
              var found = false;
              angular.forEach($scope.markers, function(value) {
                if(value.title == resp_value.name){
                    value.status = resp_value.status;
                    if(value.status == 'RUNNING'){
                        value.styleIcon.set('color', '00ff00');
                    }else if(value.status =='INACTIVE'){
                        value.styleIcon.set('color', 'C0C0B8');
                    }else if(value.status =='WARNING'){
                        value.styleIcon.set('color', 'FFC500');
                    }else if(value.status =='ALARMED'){
                        value.styleIcon.set('color', 'ff0000');
                    }
                    found = true;
                    value.acc_x = resp_value.accelerometer_x;
                    value.acc_y = resp_value.accelerometer_y;
                    marker.content = '<div class="infoWindowContent"> ' +
                                    "<img class='logo-class' src='"+ $scope.logo +"'/>" +
                                    '<div> DriftX: ' + marker.acc_x + '</div>' +
                                    '<div> DriftY: '+ marker.acc_y + '</div>' +
                                    '<div> Status: ' + marker.status + '</div>' +
                                    '</div>';
                }
              });
              if(!found){
                 createMarker(resp_value);
              }
          });
          if(JSON.parse(response.data).length == 0){
              angular.forEach($scope.markers, function(to_del_value) {
                 to_del_value.styleIcon.set('color', 'C0C0B8');
              });
          }
          console.log($scope.markers.length);
      }
  });

  }
]);