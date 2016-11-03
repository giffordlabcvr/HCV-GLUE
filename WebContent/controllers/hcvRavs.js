hcvApp.controller('hcvRavsCtrl', 
		[ '$scope', '$route', '$routeParams', 'glueWS', 'dialogs', 'pagingContext', 
		  function($scope, $route, $routeParams, glueWS, dialogs, pagingContext) {

			addUtilsToScope($scope);

			$scope.ravs = [];

			$scope.pagingContext = null;
			$scope.whereClause = "is_resistance_associated_variant = 'true'"
			$scope.sortProperties = "featureLoc.feature.name,rav_first_codon,rav_substitutions";
			$scope.fieldNames = [
					                "featureLoc.feature.name",
					                "rav_substitutions",
					                "rav_first_codon",
					                "featureLoc.referenceSequence.name",
					                "name"
					            ];

			
			glueWS.runGlueCommand("", {
				"count":{
					"variation":{
						"whereClause":$scope.whereClause
					}
				}
			}
			)
		    .success(function(data, status, headers, config) {
				console.info('count variations raw result', data);
				$scope.pagingContext = pagingContext.createPagingContext(data.countResult.count, 10, $scope.updatePage);
		    })
		    .error(glueWS.raiseErrorDialog(dialogs, "counting variations"));

			
			$scope.updatePage = function(pContext) {
				console.log("updatePage", pContext);
				var cmdParams = {
			            "whereClause":$scope.whereClause,
			            "sortProperties":$scope.sortProperties,
			            "fieldName":$scope.fieldNames
				};
				cmdParams.pageSize = pContext.itemsPerPage;
				cmdParams.fetchLimit = pContext.itemsPerPage;
				cmdParams.fetchOffset = pContext.firstItemIndex - 1;
				glueWS.runGlueCommand("", {
			    	"list": { "variation": cmdParams } 
				})
				.success(function(data, status, headers, config) {
					$scope.ravs = tableResultAsObjectList(data);
					console.info('$scope.ravs', $scope.ravs);
				})
				.error(glueWS.raiseErrorDialog(dialogs, "retrieving resistance associated substitutions"));
			}

		}]);
