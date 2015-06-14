// a very simple example of angular/cytoscape.js integration

// context (rightclick/2finger) drag to resize in graph
// use text boxes to resize in angular


var app = angular.module('app', ['highcharts-ng']);

app.controller('NodeCtrl', [ '$scope' , function( $scope ){
  // (usually better to have the srv as intermediary)

    $scope.highchartsNG = {
        options: {
            chart: {
                type: 'line'
            }
        },
        series: [{
            data: [0]
        }],
        title: {
            text: $scope.observed_marker != undefined ? $scope.observed_marker.title : ""
        },
        loading: false
    }

    $scope.host = $('#host_value').val();
    $scope.logo = $('#logo_value').val();

    var mapOptions = {
        zoom: 14,
        center: new google.maps.LatLng(45.055109, 7.701168),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }

    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    $scope.markers = [];
    $scope.markers_length = 0;
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
                status: info.status,
                tdr:info.tdr,
                tilt:info.tilt
            }
        );

        var platform = 'Simulated';
        if(marker.title == 'Intrepid'){
            platform = 'Real';
        }
        marker.content = '<div class="infoWindowContent"> ' +
                        "<img class='logo-class' src='"+ $scope.logo +"'/>" +
                        "<div> Platform: <b class='"+platform+"'>" + platform + '</b></div>' +
                        '<div> DriftX: <b>' + marker.acc_x + '</b></div>' +
                        '<div> DriftY: <b>'+ marker.acc_y + '</b></div>' +
                        '<div> Tdr: <b>'+ marker.tdr + '</b></div>' +
                        '<div> tilt: <b>'+ marker.tilt + '</b></div>' +
                        '<div> Status: <b>' + marker.status + '</b></div>' +
                        '</div>';

        google.maps.event.addListener(marker, 'click', function(){
            $scope.highchartsNG.title = {
                        text: " Temperature per il nodo:" + marker.title
                    };
            infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
            infoWindow.open($scope.map, marker);
            var seriesArray = $scope.highchartsNG.series;
            seriesArray[0].data = [];
            $scope.observed_marker = marker;
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
                    var platform = 'Simulated';
                    if(value.title == 'Intrepid'){
                        platform = 'Real';
                    }
                    value.content = '<div class="infoWindowContent"> ' +
                                    "<img class='logo-class' src='"+ $scope.logo +"'/>" +
                                    "<div> Platform: <b class='"+platform+"'>" + platform + '</b></div>' +
                                    '<div> DriftX: <b>' + value.acc_x + '</b></div>' +
                                    '<div> DriftY: <b>'+ value.acc_y + '</b></div>' +
                                    '<div> Tdr: <b>' + value.tdr + '</b></div>' +
                                    '<div> Tilt: <b>' + value.tilt + '</b></div>' +
                                    '<div> Status: <b>' + value.status + '</b></div>' +
                                    '</div>';
                }
                  
                if($scope.observed_marker!=undefined && value.title == $scope.observed_marker.title){
                    var seriesArray = $scope.highchartsNG.series;
                    seriesArray[0].data = seriesArray[0].data.concat([Math.random() * 100])
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
          $scope.markers_length = $scope.markers.length;
          $scope.$apply();
      }
  });

  }
]);