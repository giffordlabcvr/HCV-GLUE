hcvApp.controller('hcvRapsCtrl', 
		[ '$scope', '$route', '$routeParams', 'glueWS', 'dialogs', 'pagingContext', 
		  function($scope, $route, $routeParams, glueWS, dialogs, pagingContext) {

			addUtilsToScope($scope);

			$scope.raps = [];

			$scope.pagingContext = null;
			$scope.whereClause = "phdr_resistance_finding != null"

			
			$scope.updateCount = function(pContext) {
				console.log("updateCount", pContext);
				var cmdParams = {
						"tableName": "phdr_ras",
						"whereClause": $scope.whereClause
				};
				pContext.extendCountCmdParams(cmdParams);
				glueWS.runGlueCommand("", {
					"count":{
						"custom-table-row":cmdParams
					}
				}
				)
			    .success(function(data, status, headers, config) {
					console.info('count raw result', data);
					pContext.setTotalItems(data.countResult.count);
					pContext.firstPage();
			    })
			    .error(glueWS.raiseErrorDialog(dialogs, "counting polymorphisms"));
			}
			
			$scope.updatePage = function(pContext) {
				console.log("updatePage", pContext);
				var cmdParams = {
						"tableName": "phdr_ras",
						"allObjects": false,
			            "whereClause":$scope.whereClause,
			            "rendererModuleName": "phdrRasListRenderer"
				};
				pContext.extendListCmdParams(cmdParams);
				glueWS.runGlueCommand("", {
			    	"multi-render": cmdParams 
				})
				.success(function(data, status, headers, config) {
					$scope.raps = data.multiRenderResult.resultDocument;
					console.info('$scope.raps', $scope.raps);
				})
				.error(glueWS.raiseErrorDialog(dialogs, "retrieving resistance associated polymorphisms"));
			}
			
			$scope.pagingContext = pagingContext.createPagingContext($scope.updateCount, $scope.updatePage);

			$scope.pagingContext.setDefaultSortOrder([
	            { property:"variation.featureLoc.feature.name", displayName: "Virus protein", order: "+" },
  	            { property:"sort_key", displayName: "Polymorphic locations", order: "+" }
			]);

  			$scope.pagingContext.setSortableProperties([
  	            { property:"variation.featureLoc.feature.name", displayName: "Virus protein" },
  	            { property:"sort_key", displayName: "Polymorphic locations" }
              ]);

			$scope.pagingContext.setFilterProperties([
	            { property:"variation.featureLoc.feature.name", displayName: "Virus protein", filterHints: {type: "String"} },
	            { property:"phdr_resistance_finding.alignment.displayName", altProperties:["phdr_resistance_finding.alignment.name"], displayName: "Genotype / subtype", filterHints: {type: "String"} },
	            { property:"phdr_resistance_finding.phdr_drug.id", displayName: "Drug", altProperties:["phdr_resistance_finding.phdr_drug.abbreviation", "phdr_resistance_finding.phdr_drug.research_code"], filterHints: {type: "String"} }
	        ]);
			                          			                          			
  			$scope.pagingContext.setDefaultFilterElems([]);
  			$scope.pagingContext.countChanged();

		}]);
