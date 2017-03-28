analysisTool.controller('displayUncommonAaCtrl', ['$scope', '$modalInstance', '$controller', 'data',
    function($scope, $modalInstance, $controller, data) {
	$controller('displayVariationBase', { $scope: $scope, 
		$modalInstance: $modalInstance,
		variationCategory: data.variationCategory, 
		variation: data.renderedVariation.uncommon_aa, 
		ancestorAlmtNames: data.ancestorAlmtNames,
		pLocMatches: data.pLocMatches});
}]);

