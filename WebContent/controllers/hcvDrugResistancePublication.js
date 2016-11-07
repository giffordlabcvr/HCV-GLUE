hcvApp.controller('hcvDrugResistancePublicationCtrl', 
		[ '$scope', '$route', '$routeParams', 'glueWS', 'dialogs', 'pagingContext', 
		  function($scope, $route, $routeParams, glueWS, dialogs, pagingContext) {

			addUtilsToScope($scope);

			$scope.drPubRenderResult = null;
			$scope.drugResistanceFindings = null;
			$scope.drPubId = $routeParams.id;

			$scope.pagingContext = null;
			$scope.whereClause = "drug_resistance_publication.id = '"+$scope.drPubId+"'";
			$scope.sortProperties = "variation.featureLoc.feature.name,variation.rav_first_codon,variation.rav_substitutions";
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
			

			
			glueWS.runGlueCommand("custom-table-row/drug_resistance_publication/"+$scope.drPubId, {
				"render-object": {
					"rendererModuleName":"hcvDrugPublicationRenderer"
				}
			})
			.success(function(data, status, headers, config) {
				$scope.drPubRenderResult = data;
				console.info('$scope.drPubRenderResult', $scope.drPubRenderResult);
			})
			.error(glueWS.raiseErrorDialog(dialogs, "rendering drug resistance publication"));

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
