// a very simple example of angular/cytoscape.js integration

// context (rightclick/2finger) drag to resize in graph
// use text boxes to resize in angular


var app = angular.module('app', []);

app.controller('NodeCtrl', [ '$scope' , function( $scope ){

  // (usually better to have the srv as intermediary)

    var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(45.0000, 7.0000),
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
                        color:"00ff00",
                        text:"I'm a marker!"
                    }
                ),
                position: new google.maps.LatLng(info.lat, info.lng),
                map:$scope.map,
                title: info.name,
                status:'active'
            }
        );
        marker.content = '<div class="infoWindowContent">' + info.desc + '</div>';

        google.maps.event.addListener(marker, 'click', function(){
            infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
            infoWindow.open($scope.map, marker);
        });

        $scope.markers.push(marker);
    }

    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
        console.log($scope.map.markers)
    }

  var first_launch = true;
  var eventSrc = new EventSource('http://localhost:8080/api/get_all_data_event');

  eventSrc.addEventListener('message',function(response){
      //console.log(response.data);
      //console.log(JSON.parse(response.data));
      //console.log(JSON.parse(response.data));
      console.log(response.data);
      if(first_launch){
         angular.forEach(JSON.parse(response.data), function(value) {
            createMarker(value);
         });
         first_launch = false;
      }else{
          /*

            value.setMap(null);
            $scope.markers.splice(value, 1);


          */
          var resp_data = JSON.parse(response.data);
          angular.forEach($scope.markers, function(value) {
              var found = false;
              angular.forEach(resp_data, function(resp_value) {
                if(value.title == resp_value.name){
                    value.status = resp_value.status;
                    if(value.status == 'active'){
                        value.styleIcon.set('color', '00ff00');
                    }else if(value.status =='inactive'){
                        value.styleIcon.set('color', 'ff0000');
                    }
                    found = true;
                }
              });
              if(!found){
                 value.setMap(null);
                 $scope.markers.splice(value, 1);
              }
          });
          angular.forEach(resp_data, function(resp_value) {
              var found = false;
              angular.forEach($scope.markers, function(value) {
                if(value.title == resp_value.name){
                    value.status = resp_value.status;
                    if(value.status == 'active'){
                        value.styleIcon.set('color', '00ff00');
                    }else if(value.status =='inactive'){
                        value.styleIcon.set('color', 'ff0000');
                    }
                    found = true;
                }
              });
              if(!found){
                 createMarker(resp_value);
              }
          });
          if(response.data.length == 0){
              $scope.markers = [];
          }
      }
      console.log($scope.markers);
  });

  }
]);