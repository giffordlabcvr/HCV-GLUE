hcvApp.controller('hcvReferenceCtrl', 
		[ '$scope', '$routeParams', '$controller', 'glueWS', 'dialogs',
		  function($scope, $routeParams, $controller, glueWS, dialogs) {
			$controller('referenceCtrl', { 
				$scope: $scope, 
				$rootParams: $routeParams, 
				$controller: $controller, 
				glueWS: glueWS, 
				dialogs: dialogs, 
				rendererModule: null
			});	
		}]);
