
analysisTool.controller('displayEpitopeCtrl', ['$scope', '$modalInstance', '$controller', 'data',
    function($scope, $modalInstance, $controller, data) {
	$controller('displayVariationBase', { $scope: $scope, 
		$modalInstance: $modalInstance,
		variationCategory: data.variationCategory, 
		variation: data.renderedVariation.epitope, 
		ancestorAlmtNames: data.ancestorAlmtNames});
	
}]);