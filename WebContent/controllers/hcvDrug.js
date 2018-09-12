hcvApp.controller('hcvDrugCtrl', 
		[ '$scope', '$route', '$routeParams', 'glueWS', 'dialogs', 'pagingContext', 
		  function($scope, $route, $routeParams, glueWS, dialogs, pagingContext) {

			addUtilsToScope($scope);

			$scope.phdrDrug = null;
			$scope.phdrAlignmentRasDrugs = null;
			$scope.drugId = $routeParams.id;
			
			$scope.pagingContext = null;
			$scope.whereClause = "phdr_drug.id = '"+$scope.drugId+"'";

			glueWS.runGlueCommand("custom-table-row/phdr_drug/"+$scope.drugId, {
				"render-object": {
					"rendererModuleName":"phdrDrugRenderer"
				}
			})
			.success(function(data, status, headers, config) {
				$scope.phdrDrug = data.phdrDrug;
				console.info('$scope.phdrDrug', $scope.phdrDrug);
			})
			.error(glueWS.raiseErrorDialog(dialogs, "rendering drug"));

			$scope.updateCount = function(pContext) {
				var cmdParams = {
					"whereClause":$scope.whereClause,
					"tableName":"phdr_alignment_ras_drug"
				};
				pContext.extendCountCmdParams(cmdParams);
				glueWS.runGlueCommand("", {
					"count":{
						"custom-table-row":cmdParams
					}
				})
			    .success(function(data, status, headers, config) {
					console.info('count findings raw result', data);
					pContext.setTotalItems(data.countResult.count);
					pContext.firstPage();
			    })
			    .error(glueWS.raiseErrorDialog(dialogs, "counting findings"));
			}
			
			$scope.updatePage = function(pContext) {
				console.log("updatePage", pContext);
				var cmdParams = {
			            "whereClause":$scope.whereClause,
			            "allObjects": false,
			            "tableName":"phdr_alignment_ras_drug",
			            "rendererModuleName": "phdrAlignmentRasDrugRenderer"
				};
				pContext.extendListCmdParams(cmdParams);
				glueWS.runGlueCommand("", {
			    	"multi-render": cmdParams 
				})
				.success(function(data, status, headers, config) {
					$scope.phdrAlignmentRasDrugs = data.multiRenderResult.resultDocument;
					console.info('$scope.phdrAlignmentRasDrugs', $scope.phdrAlignmentRasDrugs);
				})
				.error(glueWS.raiseErrorDialog(dialogs, "retrieving alignment-ras-drug objects"));
			}

			$scope.pagingContext = pagingContext.createPagingContext($scope.updateCount, $scope.updatePage);

			$scope.pagingContext.setDefaultSortOrder([
  	            { property:"numeric_resistance_category", displayName: "Resistance category", order: "+" },
  	            { property:"phdr_alignment_ras.phdr_ras.sort_key", displayName: "Polymorphic locations", order: "+" },
	            { property:"phdr_alignment_ras.alignment.name", displayName: "Genotype / subtype", order: "+" }
  			]);

			$scope.pagingContext.setSortableProperties([
	            { property:"phdr_alignment_ras.phdr_ras.sort_key", displayName: "Polymorphic locations" },
	            { property:"phdr_alignment_ras.alignment.name", displayName: "Genotype / subtype"},
	            { property:"numeric_resistance_category", displayName: "Resistance category"},
	            { property:"in_vitro_max_ec50_midpoint", displayName: "EC50 log fold change"}
            ]);

  			$scope.pagingContext.setFilterProperties([
  	            { property:"phdr_alignment_ras.alignment.displayName", altProperties:["phdr_alignment_ras.alignment.name"], displayName: "Genotype / subtype", filterHints: {type: "String"} }, 
  	            { property:"any_in_vitro_evidence", displayName: "In vitro evidence?", filterHints: {type: "Boolean"} }, 
  	            { property:"in_vitro_max_ec50_midpoint", displayName: "EC50 log fold change", filterHints: {type: "Double"} }, 
  	            { property:"any_in_vivo_evidencee", displayName: "In vivo evidence?", filterHints: {type: "Boolean"} }, 
  	            { property:"in_vivo_baseline", displayName: "Found at baseline?", filterHints: {type: "Boolean"} }, 
  	            { property:"in_vivo_treatment_emergent", displayName: "Treatment emergent?", filterHints: {type: "Boolean"} }
  			]);
			                          			
			$scope.pagingContext.setDefaultFilterElems([]);

			$scope.pagingContext.countChanged();
			
		}]);
