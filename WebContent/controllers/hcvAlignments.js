projectBrowser.controller('hcvAlignmentsCtrl', 
		[ '$scope', 'glueWebToolConfig', 'glueWS', '$controller', 'dialogs', 
		    function($scope, glueWebToolConfig, glueWS, $controller, dialogs) {

			$controller('cladeTreeCtrl', { $scope: $scope, 
				glueWebToolConfig: glueWebToolConfig, 
				glueWS: glueWS, 
				dialogs: dialogs});

			$scope.initFromRootNodes([
  			    { almtName: "AL_MASTER", initiallyExpanded: true },
			]);
	
}]);
