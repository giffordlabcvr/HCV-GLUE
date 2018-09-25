hcvApp.controller('hcvAlignmentCtrl', 
		[ '$scope', '$routeParams', '$controller', 'glueWS', 'glueWebToolConfig', 'dialogs', 'pagingContext', 'filterUtils',
		  function($scope, $routeParams, $controller, glueWS, glueWebToolConfig, dialogs, pagingContext, filterUtils) {
			
			addUtilsToScope($scope);

			$controller('alignmentCtrl', { $scope: $scope, 
				glueWebToolConfig: glueWebToolConfig, 
				glueWS: glueWS, 
				dialogs: dialogs});

			$scope.displaySection = 'memberSequences';
			
			$scope.init($routeParams.alignmentName, 
					"hcvAlignmentRenderer", "sequence.source.name = 'ncbi-curated' and referenceMember = false",
					[
                     "sequence.sequenceID",
                     "alignment.name",
                     "alignment.displayName",
                     "sequence.who_country.id",
                     "sequence.who_country.display_name",
                     "sequence.who_country.who_region.id",
                     "sequence.who_country.who_region.display_name",
                     "sequence.who_country.development_status",
                     "sequence.who_country.who_sub_region.id",
                     "sequence.who_country.who_sub_region.display_name",
                     "sequence.who_country.who_intermediate_region.id",
                     "sequence.who_country.who_intermediate_region.display_name",
                     "sequence.gb_collection_year",
                     "sequence.earliest_collection_year",
                     "sequence.latest_collection_year",
                     "sequence.gb_length",
                     "sequence.gb_create_date",
                     "sequence.gb_update_date",
                     "sequence.gb_pubmed_id",
                     "sequence.gb_isolate"
                 ]);

			$scope.initGlobalRegionFixedValueSet();
			$scope.initDevelopmentStatusFixedValueSet();
			
			$scope.pagingContext.setDefaultSortOrder([
  	            { property:"sequence.gb_create_date", displayName: "NCBI Entry Creation Date", order: "-" }
			    // { property: "sequence.sequenceID", displayName: "NCBI Nucleotide ID", order: "+" }
			]);

			
			$scope.pagingContext.setSortableProperties([
                { property:"alignment.name", displayName: "Genotype / Subtype" },
                { property:"sequence.sequenceID", displayName: "NCBI Nucleotide ID" },
	            { property:"sequence.gb_create_date", displayName: "NCBI Entry Creation Date" },
	            { property:"sequence.gb_update_date", displayName: "NCBI Last Update Date" },
  	            { property:"sequence.who_country.id", displayName: "Country of Origin" },
  	            { property:"sequence.earliest_collection_year", displayName: "Earliest Collection Year" },
  	            { property:"sequence.latest_collection_year", displayName: "Latest Collection Year" },
	            { property:"sequence.gb_isolate", displayName: "Isolate ID" },
	            { property:"sequence.gb_pubmed_id", displayName: "PubMed ID" },
	            { property:"sequence.gb_length", displayName: "Sequence Length" }
            ]);
			
  			$scope.pagingContext.setDefaultFilterElems([]);

			$scope.pagingContext.setFilterProperties([
           		{ property:"sequence.sequenceID", displayName: "NCBI Nucleotide ID", filterHints: {type: "String"} },
          		{ property:"sequence.gb_length", displayName: "Sequence Length", filterHints: {type: "Integer"} },
                { property:"alignment.displayName", displayName: "Genotype / Subtype", filterHints: {type: "String"}  },
                $scope.featurePresenceFilter(),
  	            { property:"sequence.who_country.display_name", nullProperty:"sequence.who_country", altProperties:["sequence.who_country.id"], displayName: "Country of Origin", filterHints: {type: "String"} },
  	            $scope.globalRegionFilter(),
  	            $scope.developmentStatusFilter(),
	            { property:"sequence.gb_isolate", displayName: "Isolate ID", filterHints: {type: "String"} },
	            { property:"sequence.gb_pubmed_id", displayName: "PubMed ID", filterHints: {type: "String"} },
          		{ property:"sequence.gb_create_date", displayName: "NCBI Entry Creation Date", filterHints: {type: "Date"} },
          		{ property:"sequence.gb_update_date", displayName: "NCBI Last Update Date", filterHints: {type: "Date"} },
	            { property:"sequence.earliest_collection_year", displayName: "Earliest Collection Year", filterHints: {type: "Integer"} },
	            { property:"sequence.latest_collection_year", displayName: "Latest Collection Year", filterHints: {type: "Integer"} }

  			]);
  			                          			

			$scope.rasNoteWhereClause = "variation.phdr_ras != null and alignment.name = '"+$scope.almtName+"'";
			$scope.rasNoteFields = [
                "variation.phdr_ras.id",
                "variation.phdr_ras.gene",
                "variation.phdr_ras.structure",
                "ncbi_curated_total_present",
                "ncbi_curated_total_absent",
                "ncbi_curated_frequency"
            ];

			$scope.updateRasPage = function(pContext) {
				console.log("updateRasPage", pContext);
				
				var cmdParams = {
			            "whereClause": $scope.rasNoteWhereClause,
			            "fieldName": $scope.rasNoteFields
				};
				pContext.extendListCmdParams(cmdParams);
				glueWS.runGlueCommand("", {
				    "list":{
				        "var-almt-note": cmdParams
				    }
				})
			    .success(function(data, status, headers, config) {
					  console.info('listing RAS frequency notes', data);
					  $scope.rasNoteList = tableResultAsObjectList(data);
					  console.info('listing RAS frequency notes result as object list', $scope.rasNoteList);
			    })
			    .error(glueWS.raiseErrorDialog(dialogs, "listing RAS frequency notes"));
			}
			
			$scope.updateRasCount = function(pContext) {
				console.log("updateRasCount", pContext);
				
				var cmdParams = {
			            "whereClause": $scope.rasNoteWhereClause
				};
				pContext.extendCountCmdParams(cmdParams);
				glueWS.runGlueCommand("", {
			    	"count": { 
				        "var-almt-note":cmdParams
			    	} 
				})
			    .success(function(data, status, headers, config) {
					console.info('count RAS frequency notes raw result', data);
					$scope.rasPagingContext.setTotalItems(data.countResult.count);
					$scope.rasPagingContext.firstPage();
			    })
			    .error(glueWS.raiseErrorDialog(dialogs, "counting RAS frequency notes"));
			}
			
			$scope.rasPagingContext = pagingContext.createPagingContext($scope.updateRasCount, $scope.updateRasPage);

			$scope.rasPagingContext.setDefaultSortOrder([
 	            { property:"variation.phdr_ras.gene", displayName: "Virus protein", order: "+"  },
	            { property:"variation.phdr_ras.sort_key", displayName: "Polymorphic locations", order: "+" }
			]);

			$scope.rasPagingContext.setSortableProperties([
   	            { property:"variation.phdr_ras.gene", displayName: "Virus protein" },
	            { property:"variation.phdr_ras.sort_key", displayName: "Polymorphic locations" },
	            { property:"ncbi_curated_frequency", displayName: "Frequency" }
            ]);

			
			$scope.rasPagingContext.setFilterProperties([
	     		{ property: "variation.phdr_ras.gene", displayName: "Virus protein", filterHints: {type: "String"} },
	    		{ property: "ncbi_curated_frequency", displayName: "Frequency (percentage)", filterHints: {type: "Double"} }
			]);
			                          			
			$scope.rasPagingContext.setDefaultFilterElems([]);

			
			$scope.rasPagingContext.countChanged();

			
		}]);
