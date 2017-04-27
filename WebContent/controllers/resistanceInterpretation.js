analysisTool.controller('resistanceInterpretationCtrl', 
		[ '$scope', 'glueWS', 'dialogs',
		  function($scope, glueWS, dialogs) {
			
			addUtilsToScope($scope);

			$scope.updateDrugRegimenAlignments = function() {

				$scope.regimenAlignmentsMultiRenderResult = { resultDocument: [] };

				var rWhereClause = "alignment.name in ( ";
				for(var i = 0; i < $scope.selectedQueryAnalysis.ancestorAlmtName.length; i++) {
					if(i > 0) {
						rWhereClause += ", ";
					}
					rWhereClause += "'"+$scope.selectedQueryAnalysis.ancestorAlmtName[i]+"'";
				}
				rWhereClause += ")";
					
					
				glueWS.runGlueCommand("", {
				    "multi-render":{
				        "whereClause":rWhereClause,
				        "tableName":"drug_regimen_alignment",
				        "allObjects":"false",
				        "rendererModuleName":"hcvDrugRegimenAlignmentRenderer"
				    }
				})
			    .success(function(data, status, headers, config) {
					  console.info('regimen-alignment multi-render result', data);
					  // make sure "available" regimens appear before "suboptimal"
					  data.multiRenderResult.resultDocument = 
						  _.sortBy(data.multiRenderResult.resultDocument, 
								  function(rd) { return rd.drugRegimenAlignment.recommendationLevel; });
					  // make sure "NS3 inhibitor appears before NS5A inhibitor etc
					  for(var i = 0; i < data.multiRenderResult.resultDocument.length; i++) {
						  data.multiRenderResult.resultDocument[i].drugRegimenAlignment.daa = 
							  _.sortBy(data.multiRenderResult.resultDocument[i].drugRegimenAlignment.daa, 
									  function(daa) { return daa.drugCategoryId; });
							  
					  }
					  $scope.regimenAlignmentsMultiRenderResult = data.multiRenderResult;
			    })
			    .error(glueWS.raiseErrorDialog(dialogs, "multi-rendering regimen-alignments"));
			}

		}]);