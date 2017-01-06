hcvApp.controller('hcvRavsCtrl', 
		[ '$scope', '$route', '$routeParams', 'glueWS', 'dialogs', 'pagingContext', 
		  function($scope, $route, $routeParams, glueWS, dialogs, pagingContext) {

			addUtilsToScope($scope);

			$scope.ravs = [];

			$scope.pagingContext = null;
			$scope.whereClause = "is_resistance_associated_variant = 'true'"
			$scope.fieldNames = [
					                "featureLoc.feature.name",
					                "rav_substitutions",
					                "rav_first_codon",
					                "featureLoc.referenceSequence.name",
					                "name"
					            ];

			
			$scope.updateCount = function(pContext) {
				console.log("updateCount", pContext);
				var cmdParams = {
						"whereClause":$scope.whereClause
				};
				pContext.extendCountCmdParams(cmdParams);
				glueWS.runGlueCommand("", {
					"count":{
						"variation":cmdParams
					}
				}
				)
			    .success(function(data, status, headers, config) {
					console.info('count variations raw result', data);
					pContext.setTotalItems(data.countResult.count);
					pContext.firstPage();
			    })
			    .error(glueWS.raiseErrorDialog(dialogs, "counting variations"));
			}
			
			$scope.updatePage = function(pContext) {
				console.log("updatePage", pContext);
				var cmdParams = {
			            "whereClause":$scope.whereClause,
			            "fieldName":$scope.fieldNames
				};
				pContext.extendListCmdParams(cmdParams);
				glueWS.runGlueCommand("", {
			    	"list": { "variation": cmdParams } 
				})
				.success(function(data, status, headers, config) {
					$scope.ravs = tableResultAsObjectList(data);
					console.info('$scope.ravs', $scope.ravs);
				})
				.error(glueWS.raiseErrorDialog(dialogs, "retrieving resistance associated substitutions"));
			}
			
			$scope.pagingContext = pagingContext.createPagingContext($scope.updateCount, $scope.updatePage);

			$scope.pagingContext.setDefaultSortOrder([
	            { property:"featureLoc.feature.name", displayName: "Gene", order: "+" },
  	            { property:"rav_first_codon", displayName: "Start Location", order: "+" },
  	            { property:"rav_substitutions", displayName: "Substitutions", order: "+" }
			]);

  			$scope.pagingContext.setSortableProperties([
  	            { property:"featureLoc.feature.name", displayName: "Gene" },
  	            { property:"rav_first_codon", displayName: "Start Location" },
  	            { property:"rav_substitutions", displayName: "Substitutions" }
              ]);

			$scope.pagingContext.setFilterProperties([
	            { property:"featureLoc.feature.name", displayName: "Gene", filterHints: {type: "String"} },
	            { property:"rav_substitutions", displayName: "Substitutions", filterHints: {type: "String"} }
	        ]);
			                          			                          			
  			$scope.pagingContext.setDefaultFilterElems([]);
  			$scope.pagingContext.countChanged();

		}]);
