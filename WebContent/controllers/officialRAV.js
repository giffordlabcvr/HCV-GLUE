analysisTool.controller('officialRAVsCtrl', 
		[ '$scope', 'glueWS', 'dialogs', '$controller',
		  function($scope, glueWS, dialogs, $controller) {
			
			$controller('resistanceInterpretationCtrl', { $scope: $scope, 
				glueWS: glueWS,
				dialogs: dialogs});
		
			
			console.log("official RAV controller: resultVariationCategory", $scope.resultVariationCategory);

			$scope.updateResultVariationMatches = function() {
				$scope.resultVariationMatches = $scope.getResultVariationMatches($scope.resultVariationCategory);
				console.log("official RAV controller: resultVariationMatches", $scope.resultVariationMatches);

				$scope.multiRenderResult = { resultDocument: [] };
				if($scope.resultVariationMatches.matches.length > 0) {
					
					var vWhereClause = "(";
					for(var i = 0; i < $scope.resultVariationMatches.matches.length; i++) {
						if(i > 0) {
							vWhereClause += " or ";
						}
						var match = $scope.resultVariationMatches.matches[i];
						vWhereClause += 
							"( variation.featureLoc.referenceSequence.name = '"+match.definingReferenceName+"'"+
							" and variation.featureLoc.feature.name = '"+match.definingFeatureName+"'"+
							" and variation.name = '"+match.name+"')";
					}
					vWhereClause += ")";
					
					console.log("$scope.selectedQueryAnalysis.ancestorAlmtName", $scope.selectedQueryAnalysis.ancestorAlmtName);
					
					vWhereClause += " and ( alignment.name in ( ";
					for(var i = 0; i < $scope.selectedQueryAnalysis.ancestorAlmtName.length; i++) {
						if(i > 0) {
							vWhereClause += ", ";
						}
						vWhereClause += "'"+$scope.selectedQueryAnalysis.ancestorAlmtName[i]+"'";
					}
					vWhereClause += ") )";
					
					
					glueWS.runGlueCommand("", {
					    "multi-render":{
					        "whereClause":vWhereClause,
					        "tableName":"drug_resistance_official_guidance",
					        "allObjects":"false",
					        "rendererModuleName":"hcvDROfficialGuidanceRenderer"
					    }
					})
				    .success(function(data, status, headers, config) {
						  console.info('multi-render result', data);
						  $scope.multiRenderResult = data.multiRenderResult;
				    })
				    .error(glueWS.raiseErrorDialog(dialogs, "multi-rendering official guidance"));
				};
			}
			

			
			
			
			$scope.$watch( 'selectedQueryAnalysis', function(newObj, oldObj) {
				$scope.updateResultVariationMatches();
				$scope.updateDrugRegimenAlignments();
			}, false);

			
			
			
		}]);
