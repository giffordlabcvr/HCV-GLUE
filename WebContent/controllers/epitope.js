analysisTool.controller('epitopeCtrl', 
		[ '$scope', 'glueWS', 'dialogs',
		  function($scope, glueWS, dialogs) {
			addUtilsToScope($scope);

			console.log("epitope controller: resultVariationCategory", $scope.resultVariationCategory);

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
				return width;
			}

			$scope.updateResultVariationMatches = function() {
				$scope.epitopeList = [];
				$scope.epitopeMap = {};
				
				$scope.resultVariationMatches = $scope.getResultVariationMatches($scope.resultVariationCategory);
				console.log("uncommon Aa controller: resultVariationMatches", $scope.resultVariationMatches);

				$scope.multiRenderResult = { resultDocument: [] };
				if($scope.resultVariationMatches.matches.length > 0) {
					
					var newEpitopeList = [];
					var newEpitopeMap = {};
					
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
						
						var epitope = {
								refName:match.definingReferenceName,
								featureName:match.definingFeatureName,
								variationName:match.name,
								matchedValue:match.pLocMatches[0].matchedValue,
								ntStart:match.pLocMatches[0].ntStart,
								pLocMatches:match.pLocMatches
						};
						var key = match.definingReferenceName+"/"+match.definingFeatureName+"/"+match.name;
						newEpitopeList.push(epitope);
						newEpitopeMap[key] = epitope;
					}
					vWhereClause += ")";
					
					glueWS.runGlueCommand("", {
					    "multi-render":{
					        "whereClause":vWhereClause,
					        "tableName":"variation",
					        "allObjects":"false",
					        "rendererModuleName":"hcvEpitopeRenderer"
					    }
					})
				    .success(function(data, status, headers, config) {
						  console.info('multi-render result', data);
						  $scope.multiRenderResult = data.multiRenderResult;
						  for(var i = 0; i < $scope.multiRenderResult.resultDocument.length; i++) {
							  var renderedEpitope = $scope.multiRenderResult.resultDocument[i].epitope;
							  var key = renderedEpitope.referenceSequence+"/"+renderedEpitope.feature+"/"+renderedEpitope.name;
							  epitope = newEpitopeMap[key];
							  epitope["renderedName"] = renderedEpitope.renderedName;
							  epitope["hla"] = renderedEpitope.hla;
							  epitope["pattern"] = renderedEpitope.pattern;
							  epitope["startCodon"] = renderedEpitope.start_codon;
							  epitope["endCodon"] = renderedEpitope.end_codon;
						  }
						  $scope.epitopeList = newEpitopeList;
						  $scope.epitopeMap = newEpitopeMap;

						  console.log("$scope.epitopeList", $scope.epitopeList);
				    })
				    .error(glueWS.raiseErrorDialog(dialogs, "multi-rendering variations"));
				};
			}
			
			$scope.$watch( 'selectedQueryAnalysis', function(newObj, oldObj) {
				$scope.updateResultVariationMatches();
			}, false);

			
		}]);
