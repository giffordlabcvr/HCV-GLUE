hcvApp.controller('hcvDrugCtrl', 
		[ '$scope', '$route', '$routeParams', 'glueWS', 'dialogs', 'pagingContext', 
		  function($scope, $route, $routeParams, glueWS, dialogs, pagingContext) {

			addUtilsToScope($scope);

			$scope.phdrDrug = null;
			$scope.phdrFindings = null;
			$scope.drugId = $routeParams.id;
			
			$scope.pagingContext = null;
			$scope.whereClause = "phdr_drug.id = '"+$scope.drugId+"'";

			$scope.hasInVitroFilter = function() {
                // note property here is a dummy value.
				return { property:"hasInVitro", displayName: "In vitro evidence?", filterHints: 
            	{ type: "CustomBoolean", 
              	  generatePredicateFromCustom: function(filterElem) {
              		  console.log("filterElem", filterElem);
              		  if(filterElem.predicate.operator == "true") {
                		  	return "phdr_in_vitro_result != null";
              		  } else {
                		  	return "phdr_in_vitro_result = null";
              		  }
              	  }
              	}
              };
			}
			
			$scope.hasInVivoFilter = function() {
                // note property here is a dummy value.
				return { property:"hasInVivo", displayName: "In vivo evidence?", filterHints: 
            	{ type: "CustomBoolean", 
              	  generatePredicateFromCustom: function(filterElem) {
              		  console.log("filterElem", filterElem);
              		  if(filterElem.predicate.operator == "true") {
                		  	return "phdr_in_vivo_result != null";
              		  } else {
                		  	return "phdr_in_vivo_result = null";
              		  }
              	  }
              	}
              };
			}


			
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
					"tableName":"phdr_resistance_finding"
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
			            "tableName":"phdr_resistance_finding",
			            "rendererModuleName": "phdrFindingListRenderer"
				};
				pContext.extendListCmdParams(cmdParams);
				glueWS.runGlueCommand("", {
			    	"multi-render": cmdParams 
				})
				.success(function(data, status, headers, config) {
					$scope.phdrFindings = data.multiRenderResult.resultDocument;
					console.info('$scope.phdrFindings', $scope.phdrFindings);
				})
				.error(glueWS.raiseErrorDialog(dialogs, "retrieving drug resistance findings"));
			}

			$scope.pagingContext = pagingContext.createPagingContext($scope.updateCount, $scope.updatePage);

			$scope.pagingContext.setDefaultSortOrder([
  	            { property:"phdr_ras.sort_key", displayName: "Polymorphic locations", order: "+" },
	            { property:"alignment.name", displayName: "Genotype / subtype", order: "+" }
  			]);

			$scope.pagingContext.setSortableProperties([
	            { property:"phdr_ras.sort_key", displayName: "Polymorphic locations" },
	            { property:"alignment.name", displayName: "Genotype / subtype"}
            ]);

  			$scope.pagingContext.setFilterProperties([
  	            { property:"alignment.displayName", altProperties:["alignment.name"], displayName: "Genotype / subtype", filterHints: {type: "String"} }, 
  	            $scope.hasInVitroFilter(),
  	            { property:"phdr_in_vitro_result.ec50_midpoint", displayName: "EC50 log fold change", filterHints: {type: "Double"} }, 
  	            $scope.hasInVivoFilter(),
  	            { property:"phdr_in_vivo_result.baseline", displayName: "Found at baseline?", filterHints: {type: "Boolean"} }, 
  	            { property:"phdr_in_vivo_result.treatment_emergent", displayName: "Treatment emergent?", filterHints: {type: "Boolean"} }
  			]);
			                          			
			$scope.pagingContext.setDefaultFilterElems([]);

			
			$scope.pagingContext.countChanged();
			
		}]);
