analysisTool.controller('inVitroRAVsCtrl', 
		[ '$scope', 'glueWS', 'dialogs', '$controller',
		  function($scope, glueWS, dialogs, $controller) {
			
			$controller('resistanceInterpretationCtrl', { $scope: $scope, 
				glueWS: glueWS,
				dialogs: dialogs});
		
			
			console.log("in vitro RAV controller: resultVariationCategory", $scope.resultVariationCategory);

			$scope.updateResultVariationMatches = function() {
				$scope.resultVariationMatches = $scope.getResultVariationMatches($scope.resultVariationCategory);
				console.log("in vitro RAV controller: resultVariationMatches", $scope.resultVariationMatches);

				$scope.ravList = [];
				$scope.ravMap = {};
				var newRavMap = {};
				var newRavList = [];
				
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
						
						var key = match.definingReferenceName+"/"+match.definingFeatureName+"/"+match.name;
						
						var rav = {
								refName: match.definingReferenceName,
								featureName: match.definingFeatureName,
								variationName: match.name,
								renderedName: match.renderedName,
								findings: []
						};
						newRavMap[key] = rav;
						newRavList.push(rav);
					}
					vWhereClause += ")";
					
					console.log("$scope.selectedQueryAnalysis.ancestorAlmtName", $scope.selectedQueryAnalysis.ancestorAlmtName);
					
					vWhereClause += " and ( replicon_clade.name in ( ";
					for(var i = 0; i < $scope.selectedQueryAnalysis.ancestorAlmtName.length; i++) {
						if(i > 0) {
							vWhereClause += ", ";
						}
						vWhereClause += "'"+$scope.selectedQueryAnalysis.ancestorAlmtName[i]+"'";
					}
					vWhereClause += ") )";

					vWhereClause += " and ( drug.drug_regimen_drug.drug_regimen.drug_regimen_alignment.alignment.name in ( ";
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
					        "tableName":"drug_resistance_finding",
					        "allObjects":"false",
					        "rendererModuleName":"hcvDrugResistanceFindingRenderer"
					    }
					})
				    .success(function(data, status, headers, config) {
						  console.info('multi-render result', data);
						  $scope.multiRenderResult = data.multiRenderResult;
						  
						  for(var i = 0; i < $scope.multiRenderResult.resultDocument.length; i++) {
							  var renderedFinding = $scope.multiRenderResult.resultDocument[i].resistanceFinding;
							  var key = renderedFinding.ravReferenceSequence+"/"+renderedFinding.ravFeature+"/"+renderedFinding.ravName;
							  var rav = newRavMap[key];
							  rav["findings"].push(renderedFinding);
						  }
						  $scope.ravMap = newRavMap;
						  $scope.ravList = newRavList;
						  console.log("$scope.ravList", $scope.ravList);

				    })
				    .error(glueWS.raiseErrorDialog(dialogs, "multi-rendering in vitro resistance"));
				};
			}
			

			
			
			
			$scope.$watch( 'selectedQueryAnalysis', function(newObj, oldObj) {
				$scope.updateResultVariationMatches();
				$scope.updateDrugRegimenAlignments();
			}, false);

			
			
			
		}]);
