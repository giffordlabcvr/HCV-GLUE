hcvApp.controller('hcvDrugCtrl', 
		[ '$scope', '$route', '$routeParams', 'glueWS', 'dialogs', 'pagingContext', 
		  function($scope, $route, $routeParams, glueWS, dialogs, pagingContext) {

			addUtilsToScope($scope);

			$scope.drugRenderResult = null;
			$scope.drugResistanceFindings = null;
			$scope.drugId = $routeParams.id;
			
			$scope.pagingContext = null;
			$scope.whereClause = "drug.id = '"+$scope.drugId+"'";
			$scope.sortProperties = "variation.featureLoc.feature.name,variation.rav_first_codon,variation.rav_substitutions";
			$scope.fieldNames = [
					                "id",
					                "replicon_clade.name",
					                "replicon_clade.displayName",
					                "min_fold_change",
					                "max_fold_change",
					                "drug_resistance_publication.id",
					                "drug_resistance_publication.display_name",
					                "variation.featureLoc.referenceSequence.name",
					                "variation.featureLoc.feature.name",
					                "variation.name",
					                "variation.rav_substitutions"
					            ];

			glueWS.runGlueCommand("", {
				"count":{
					"custom-table-row":{
						"whereClause":$scope.whereClause,
						"tableName":"drug_resistance_finding"
					}
				}
			}
			)
		    .success(function(data, status, headers, config) {
				console.info('count findings raw result', data);
				$scope.pagingContext.setTotalItems(data.countResult.count);
				$scope.pagingContext.firstPage();
		    })
		    .error(glueWS.raiseErrorDialog(dialogs, "counting findings"));
			
			glueWS.runGlueCommand("custom-table-row/drug/"+$scope.drugId, {
				"render-object": {
					"rendererModuleName":"hcvDrugRenderer"
				}
			})
			.success(function(data, status, headers, config) {
				$scope.drugRenderResult = data;
				console.info('$scope.drugRenderResult', $scope.drugRenderResult);
			})
			.error(glueWS.raiseErrorDialog(dialogs, "rendering drug"));

			$scope.updatePage = function(pContext) {
				console.log("updatePage", pContext);
				var cmdParams = {
			            "whereClause":$scope.whereClause,
			            "sortProperties":$scope.sortProperties,
			            "tableName":"drug_resistance_finding",
			            "fieldName":$scope.fieldNames
				};
				cmdParams.pageSize = pContext.itemsPerPage;
				cmdParams.fetchLimit = pContext.itemsPerPage;
				cmdParams.fetchOffset = pContext.firstItemIndex - 1;
				glueWS.runGlueCommand("", {
			    	"list": { "custom-table-row": cmdParams } 
				})
				.success(function(data, status, headers, config) {
					$scope.drugResistanceFindings = tableResultAsObjectList(data);
					console.info('$scope.drugResistanceFindings', $scope.drugResistanceFindings);
				})
				.error(glueWS.raiseErrorDialog(dialogs, "retrieving drug resistance findings"));
			}

			$scope.pagingContext = pagingContext.createPagingContext($scope.updatePage);
			
		}]);
