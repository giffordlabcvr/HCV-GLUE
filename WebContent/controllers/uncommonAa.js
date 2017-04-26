analysisTool.controller('uncommonAaCtrl', 
		[ '$scope', 'glueWS', 'dialogs',
		  function($scope, glueWS, dialogs) {
			addUtilsToScope($scope);

			console.log("uncommon Aa controller: resultVariationCategory", $scope.resultVariationCategory);
			
			$scope.updateResultVariationMatches = function() {
				$scope.uncommonAaList = [];
				$scope.uncommonAaMap = {};
				
				$scope.resultVariationMatches = $scope.getResultVariationMatches($scope.resultVariationCategory);
				console.log("uncommon Aa controller: resultVariationMatches", $scope.resultVariationMatches);

				$scope.multiRenderResult = { resultDocument: [] };
				if($scope.resultVariationMatches.matches.length > 0) {
					
					var vWhereClause = "(";
					for(var i = 0; i < $scope.resultVariationMatches.matches.length; i++) {
						if(i > 0) {
							vWhereClause += " or ";
						}
						var match = $scope.resultVariationMatches.matches[i];
						vWhereClause += 
							"( featureLoc.referenceSequence.name = '"+match.definingReferenceName+"'"+
							" and featureLoc.feature.name = '"+match.definingFeatureName+"'"+
							" and name = '"+match.name+"')";
						
						var uncommonAa = {
								refName:match.definingReferenceName,
								featureName:match.definingFeatureName,
								variationName:match.name,
								foundAa:match.pLocMatches[0].matchedValue,
								ntStart:match.pLocMatches[0].ntStart
						};
						var key = match.definingReferenceName+"/"+match.definingFeatureName+"/"+match.name;
						$scope.uncommonAaList.push(uncommonAa);
						$scope.uncommonAaMap[key] = uncommonAa;
					}
					vWhereClause += ")";
					
					glueWS.runGlueCommand("", {
					    "multi-render":{
					        "whereClause":vWhereClause,
					        "tableName":"variation",
					        "allObjects":"false",
					        "rendererModuleName":"hcvUncommonAaRenderer"
					    }
					})
				    .success(function(data, status, headers, config) {
						  console.info('multi-render result', data);
						  $scope.multiRenderResult = data.multiRenderResult;
						  for(var i = 0; i < $scope.multiRenderResult.resultDocument.length; i++) {
							  var renderedUncommonAa = $scope.multiRenderResult.resultDocument[i].uncommon_aa;
							  var key = renderedUncommonAa.referenceSequence+"/"+renderedUncommonAa.feature+"/"+renderedUncommonAa.name;
							  uncommonAa = $scope.uncommonAaMap[key];
							  uncommonAa["codonLabel"] = renderedUncommonAa.codonLabel;
							  uncommonAa["commonAas"] = renderedUncommonAa.commonAas.split('').join(", ");
							  uncommonAa["almtName"] = renderedUncommonAa.scannedAlignmentName;
							  uncommonAa["almtRenderedName"] = renderedUncommonAa.scannedAlignmentRenderedName;
						  }
						  console.log("$scope.uncommonAaList", $scope.uncommonAaList);
				    })
				    .error(glueWS.raiseErrorDialog(dialogs, "multi-rendering variations"));
				};
			}
			
			$scope.$watch( 'selectedQueryAnalysis', function(newObj, oldObj) {
				$scope.updateResultVariationMatches();
			}, false);

			
		}]);
