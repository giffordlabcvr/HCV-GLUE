hcvApp.controller('hcvRapCtrl', 
		[ '$scope', '$route', '$routeParams', 'glueWS', 'dialogs', 'pagingContext',
		  function($scope, $route, $routeParams, glueWS, dialogs, pagingContext) {

			addUtilsToScope($scope);

			$scope.rap = null;
			$scope.rapId = $routeParams.id;
			
			$scope.displaySection = 'evidenceBase';

			
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

			
			glueWS.runGlueCommand("custom-table-row/phdr_ras/"+$scope.rapId, {
			    "render-object":{
			        "rendererModuleName":"phdrRasRenderer"
			    }
			})
			.success(function(data, status, headers, config) {
				$scope.rap = data.phdrRas;
				console.info('$scope.rap', $scope.rap);
			})
			.error(glueWS.raiseErrorDialog(dialogs, "rendering resistance associated polymorphism"));

			$scope.freqNoteWhereClause = "variation.phdr_ras.id = '"+$scope.rapId+"'";

			$scope.updateFreqNotePage = function(pContext) {
				console.log("updateFreqNotePage", pContext);
				
				var cmdParams = {
						"tableName": "var_almt_note",
			            "whereClause": $scope.freqNoteWhereClause,
			            "allObjects": false,
			            "rendererModuleName": "phdrRasFrequencyRenderer"
				};
				pContext.extendListCmdParams(cmdParams);
				glueWS.runGlueCommand("", {
				    "multi-render": cmdParams
				})
			    .success(function(data, status, headers, config) {
			    	$scope.rasNoteList = data.multiRenderResult.resultDocument;
					console.info('listing RAP frequency notes result as object list', $scope.rasNoteList);
			    })
			    .error(glueWS.raiseErrorDialog(dialogs, "listing RAP frequency notes"));
			}
			
			$scope.updateFreqNoteCount = function(pContext) {
				console.log("updateFreqNoteCount", pContext);
				
				var cmdParams = {
			            "whereClause": $scope.freqNoteWhereClause
				};
				pContext.extendCountCmdParams(cmdParams);
				glueWS.runGlueCommand("", {
			    	"count": { 
				        "var-almt-note":cmdParams
			    	} 
				})
			    .success(function(data, status, headers, config) {
					console.info('count RAS frequency notes raw result', data);
					$scope.freqNotePagingContext.setTotalItems(data.countResult.count);
					$scope.freqNotePagingContext.firstPage();
			    })
			    .error(glueWS.raiseErrorDialog(dialogs, "counting RAP frequency notes"));
			}
			
			$scope.freqNotePagingContext = pagingContext.createPagingContext($scope.updateFreqNoteCount, $scope.updateFreqNotePage);

			$scope.freqNotePagingContext.setDefaultSortOrder([
  	            { property:"ncbi_curated_frequency", displayName: "Frequency", order: "-"   }
			]);

			$scope.freqNotePagingContext.setSortableProperties([
	            { property: "alignment.name", displayName: "Genotype / subtype" },
	            { property:"ncbi_curated_frequency", displayName: "Frequency" }
            ]);

			
			$scope.freqNotePagingContext.setFilterProperties([
	            { property: "alignment.displayName", altProperties:["alignment.name"], displayName: "Genotype / subtype", filterHints: {type: "String"} },
	    		{ property: "ncbi_curated_frequency", displayName: "Frequency (percentage)", filterHints: {type: "Double"} }
			]);
			                          			
			$scope.freqNotePagingContext.setDefaultFilterElems([]);

			
			$scope.freqNotePagingContext.countChanged();

			
		}]);
