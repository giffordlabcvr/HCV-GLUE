hcvApp.controller('hcvRapCtrl', 
		[ '$scope', '$route', '$routeParams', 'glueWS', 'dialogs', 
		  function($scope, $route, $routeParams, glueWS, dialogs) {

			addUtilsToScope($scope);

			$scope.rap = null;
			$scope.rapId = $routeParams.id;
			
			$scope.renderInVitroLevel = function(inVitroResult) {
				if(inVitroResult == null) {
					return "-";
				}
				if(inVitroResult.minEC50FoldChange != null && inVitroResult.maxEC50FoldChange != null) {
					if(inVitroResult.minEC50FoldChange == inVitroResult.maxEC50FoldChange) {
						return toFixed(inVitroResult.minEC50FoldChange, 2);
					} else {
						return toFixed(inVitroResult.minEC50FoldChange, 2) + " - " + toFixed(inVitroResult.maxEC50FoldChange, 2);
					}
				}
				if(inVitroResult.minEC50FoldChange == null) {
					return " < " + toFixed(inVitroResult.maxEC50FoldChange, 2);
				}
				if(inVitroResult.maxEC50FoldChange == null) {
					return " > " + toFixed(inVitroResult.minEC50FoldChange, 2);
				}
			};

			
			glueWS.runGlueCommand("custom-table-row/phdr_ras/"+$scope.rapId, {
			    "render-object":{
			        "rendererModuleName":"phdrRasRenderer"
			    }
			})
			.success(function(data, status, headers, config) {
				$scope.rap = data.phdrRas;
				console.info('$scope.rap', $scope.rap);
			})
			.error(glueWS.raiseErrorDialog(dialogs, "rendering resistance associated polymorphism"));

		}]);
