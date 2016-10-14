hcvApp.controller('hcvDrugCtrl', 
		[ '$scope', '$route', '$routeParams', 'glueWS', 'dialogs', 
		  function($scope, $route, $routeParams, glueWS, dialogs) {

			addUtilsToScope($scope);

			$scope.drugRenderResult = null;
			$scope.drugId = $routeParams.id;

			glueWS.runGlueCommand("custom-table-row/drug/"+$scope.drugId, {
				"render-object": {
					"rendererModuleName":"hcvDrugRenderer"
				}
			})
			.success(function(data, status, headers, config) {
				$scope.drugRenderResult = data;
				
				$scope.drugRenderResult.drug.drugResistanceFinding = 
					_($scope.drugRenderResult.drug.drugResistanceFinding).chain()
					  .sortBy('variationSubstitutions')
					  .sortBy('variationFirstCodon')
					  .sortBy('variationFeatureName')
					  .value();

				
				console.info('$scope.drugRenderResult', $scope.drugRenderResult);
			})
			.error(glueWS.raiseErrorDialog(dialogs, "rendering drug"));

			$scope.renderFoldChange = function(finding) {
				if(finding.minFoldChange == null && finding.maxFoldChange == null) {
					return "-";
				}
				if(finding.minFoldChange == finding.maxFoldChange) {
					return toFixed(finding.minFoldChange);
				}
				if(finding.minFoldChange == null) {
					return "< "+toFixed(finding.maxFoldChange);
				}
				if(finding.maxFoldChange == null) {
					return "> "+toFixed(finding.minFoldChange);
				}
				return toFixed(finding.minFoldChange) + " - " + toFixed(finding.maxFoldChange);
			}
			
		}]);
