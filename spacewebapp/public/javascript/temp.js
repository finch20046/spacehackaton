var eventSrc = new EventSource('http://localhost:8080/api/get_all_data_event');

  eventSrc.addEventListener('message',function(response){
      //console.log(response.data);
      //console.log(JSON.parse(response.data));
      var nodes =
      angular.forEach(JSON.parse(response.data), function(value) {
        console.log(value);
        $scope.nodes = [JSON.stringify(value)];
      });
        $scope.nodes =''
  });