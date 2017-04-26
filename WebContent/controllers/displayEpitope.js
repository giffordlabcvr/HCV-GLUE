
analysisTool.controller('displayEpitopeCtrl', ['$scope', '$modalInstance', '$controller', 'data',
    function($scope, $modalInstance, $controller, data) {
	$controller('displayVariationBase', { $scope: $scope, 
		$modalInstance: $modalInstance,
		variationCategory: data.variationCategory, 
		variation: data.renderedVariation.epitope, 
		ancestorAlmtNames: data.ancestorAlmtNames,
		pLocMatches: data.pLocMatches});
	
	$scope.svgParams = {
			aaWidth: 35,
			aaGap: 4,
			aaHeight: 16,
	}

	$scope.comparisonHeight = function() {
		return ($scope.svgParams.aaHeight * 2) + $scope.svgParams.aaGap;
	}

	$scope.comparisonWidth = function(pattern) {
		var width =  
			($scope.svgParams.aaWidth * pattern.length) +
			($scope.svgParams.aaGap * (pattern.length - 1) );
		console.log("comparisonWidth", width);
		return width;
	}

	
}]);