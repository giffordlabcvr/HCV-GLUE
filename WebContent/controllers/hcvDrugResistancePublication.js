hcvApp.controller('hcvDrugResistancePublicationCtrl', 
		[ '$scope', '$route', '$routeParams', 'glueWS', 'dialogs', 'pagingContext', 
		  function($scope, $route, $routeParams, glueWS, dialogs, pagingContext) {

			addUtilsToScope($scope);

			$scope.drPubRenderResult = null;
			$scope.drugResistanceFindings = null;
			$scope.drPubId = $routeParams.id;

			$scope.pagingContext = null;
			$scope.whereClause = "drug_resistance_publication.id = '"+$scope.drPubId+"'";
			$scope.fieldNames = [
					                "id",
					                "replicon_clade.name",
					                "replicon_clade.displayName",
					                "min_fold_change",
					                "max_fold_change",
					                "drug.id",
					                "variation.featureLoc.referenceSequence.name",
					                "variation.featureLoc.feature.name",
					                "variation.name",
					                "variation.rav_substitutions"
					            ];

			

			
			glueWS.runGlueCommand("custom-table-row/drug_resistance_publication/"+$scope.drPubId, {
				"render-object": {
					"rendererModuleName":"hcvDRDrugPublicationRenderer"
				}
			})
			.success(function(data, status, headers, config) {
				$scope.drPubRenderResult = data;
				console.info('$scope.drPubRenderResult', $scope.drPubRenderResult);
			})
			.error(glueWS.raiseErrorDialog(dialogs, "rendering drug resistance publication"));

			
			$scope.updateCount = function(pContext) {
				console.log("updatePage", pContext);
				var cmdParams = {
					"whereClause":$scope.whereClause,
					"tableName":"drug_resistance_finding"
				};
				pContext.extendCountCmdParams(cmdParams);
				glueWS.runGlueCommand("", {
					"count":{
						"custom-table-row":cmdParams
					}
				}
				)
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
			            "tableName":"drug_resistance_finding",
			            "fieldName":$scope.fieldNames
				};
				pContext.extendListCmdParams(cmdParams);
				glueWS.runGlueCommand("", {
			    	"list": { "custom-table-row": cmdParams } 
				})
				.success(function(data, status, headers, config) {
					$scope.drugResistanceFindings = tableResultAsObjectList(data);
					console.info('$scope.drugResistanceFindings', $scope.drugResistanceFindings);
				})
				.error(glueWS.raiseErrorDialog(dialogs, "retrieving drug resistance findings"));
			}

			$scope.pagingContext = pagingContext.createPagingContext($scope.updateCount, $scope.updatePage);
			
			$scope.pagingContext.setDefaultSortOrder([
                { property:"variation.featureLoc.feature.name", displayName: "Gene", order: "+" },
                { property:"variation.rav_first_codon", displayName: "Start Location", order: "+" },
                { property:"variation.rav_substitutions", displayName: "Substitutions", order: "+" }
            ]);

  			$scope.pagingContext.setSortableProperties([
  	            { property:"variation.featureLoc.feature.name", displayName: "Gene" },
  	            { property:"variation.rav_first_codon", displayName: "Start Location" },
  	            { property:"variation.rav_substitutions", displayName: "Substitutions" },
  	            { property:"replicon_clade.name", displayName: "Replicon Clade" },
  	            { property:"min_fold_change", displayName: "Minimum EC50 Fold Change" },
  	            { property:"max_fold_change", displayName: "Maximum EC50 Fold Change" },
  	            { property:"drug.id", displayName: "Drug" }
              ]);

			$scope.pagingContext.setFilterProperties([
         		{ property:"replicon_clade.displayName", displayName: "Replicon Clade", filterHints: {type: "String"} },
	            { property:"min_fold_change", displayName: "Min. EC50 Fold Change", filterHints: {type: "Double"} },
	            { property:"max_fold_change", displayName: "Max. EC50 Fold Change", filterHints: {type: "Double"} },
           		{ property:"drug.id", displayName: "Drug", filterHints: {type: "String"} },
           		{ property:"variation.featureLoc.feature.name", displayName: "Gene", filterHints: {type: "String"} },
           		{ property:"variation.rav_substitutions", displayName: "Substitutions", filterHints: {type: "String"} }
    	      ]);
  			                          			
  			$scope.pagingContext.setDefaultFilterElems([]);

  			
  			
			$scope.pagingContext.countChanged();

		}]);
