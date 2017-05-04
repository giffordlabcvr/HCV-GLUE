hcvApp.controller('hcvAlignmentCtrl', 
		[ '$scope', '$routeParams', '$controller', 'glueWS', 'glueWebToolConfig', 'dialogs', 'pagingContext',
		  function($scope, $routeParams, $controller, glueWS, glueWebToolConfig, dialogs, pagingContext) {
			
			addUtilsToScope($scope);

			$controller('alignmentCtrl', { $scope: $scope, 
				glueWebToolConfig: glueWebToolConfig, 
				glueWS: glueWS, 
				dialogs: dialogs});

			$scope.init($routeParams.alignmentName, 
					"hcvAlignmentRenderer", "sequence.source.name = 'ncbi-curated' and referenceMember = false",
					[
                     "sequence.sequenceID",
                     "alignment.name",
                     "alignment.displayName",
                     "sequence.gb_country_iso",
                     "sequence.gb_country_short",
                     "sequence.gb_collection_year",
                     "sequence.earliest_collection_year",
                     "sequence.latest_collection_year",
                     "sequence.gb_length",
                     "sequence.gb_create_date",
                     "sequence.gb_update_date",
                     "sequence.gb_pubmed_id",
                     "sequence.gb_isolate"
                 ]);

			$scope.pagingContext.setDefaultSortOrder([
			    { property: "sequence.sequenceID", displayName: "NCBI Nucleotide ID", order: "+" }
			]);

			
			$scope.pagingContext.setSortableProperties([
                { property:"alignment.name", displayName: "Genotype / Subtype" },
                { property:"sequence.sequenceID", displayName: "NCBI Nucleotide ID" },
	            { property:"sequence.gb_create_date", displayName: "NCBI Entry Creation Date" },
	            { property:"sequence.gb_update_date", displayName: "NCBI Last Update Date" },
  	            { property:"sequence.gb_country_iso", displayName: "Country of Origin" },
  	            { property:"sequence.earliest_collection_year", displayName: "Earliest Collection Year" },
  	            { property:"sequence.latest_collection_year", displayName: "Latest Collection Year" },
	            { property:"sequence.gb_isolate", displayName: "Isolate ID" },
	            { property:"sequence.gb_pubmed_id", displayName: "PubMed ID" },
	            { property:"sequence.gb_length", displayName: "Sequence Length" }
            ]);
			
			
			$scope.pagingContext.setFilterProperties([
           		{ property:"sequence.sequenceID", displayName: "NCBI Nucleotide ID", filterHints: {type: "String"} },
          		{ property:"sequence.gb_length", displayName: "Sequence Length", filterHints: {type: "Integer"} },
                { property:"alignment.displayName", displayName: "Genotype / Subtype", filterHints: {type: "String"}  },
                // note property here is a dummy value.
                { property:"featurePresence", displayName: "Coverage of Genome Region", filterHints: 
                	{ type: "FeaturePresence", 
                	  generateCustomDefault: function() {
                		  return {
                			  feature: $scope.featureList[0], 
                			  minCoveragePct: 90.0
                		  };
                	  },
                	  generatePredicateFromCustom: function(custom) {
                		  var cayennePredicate = 
                  		  	"fLocNotes.featureLoc.referenceSequence.name = '"+$scope.referenceName+"' and "+
                		  	"fLocNotes.featureLoc.feature.name = '"+custom.feature.featureName+"' and "+
                		  	"fLocNotes.ref_nt_coverage_pct >= "+custom.minCoveragePct;
                		  return cayennePredicate;
                	  },
                	  getFeaturePresenceFeatures: function() {
                		  if($scope.nonInformationalFeatureList == null && $scope.featureList != null) {
                			  $scope.nonInformationalFeatureList = _.filter($scope.featureList, 
                					  function(f) { return f.featureMetatag == null || f.featureMetatag.indexOf("INFORMATIONAL") < 0;});
                		  }
                		  return($scope.nonInformationalFeatureList);
                	  }
                	}
                },
          		{ property:"sequence.gb_create_date", displayName: "NCBI Entry Creation Date", filterHints: {type: "Date"} },
          		{ property:"sequence.gb_update_date", displayName: "NCBI Last Update Date", filterHints: {type: "Date"} },
  	            { property:"sequence.gb_country_short", altProperties:["sequence.gb_country_iso"], displayName: "Country of Origin", filterHints: {type: "String"} },
	            { property:"sequence.earliest_collection_year", displayName: "Earliest Collection Year", filterHints: {type: "Integer"} },
	            { property:"sequence.latest_collection_year", displayName: "Latest Collection Year", filterHints: {type: "Integer"} },
	            { property:"sequence.gb_isolate", displayName: "Isolate ID", filterHints: {type: "String"} },
	            { property:"sequence.gb_pubmed_id", displayName: "PubMed ID", filterHints: {type: "String"} }

  			]);
  			                          			
  			$scope.pagingContext.setDefaultFilterElems([]);


			$scope.rasNoteWhereClause = "variation.is_resistance_associated_variant = 'true' and alignment.name = '"+$scope.almtName+"'";
			$scope.rasNoteFields = [
                "variation.featureLoc.feature.name",
                "variation.featureLoc.referenceSequence.name",
                "variation.name",
                "variation.rav_substitutions",
                "variation.rav_first_codon",
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
			    { property: "variation.featureLoc.feature.name", displayName: "Gene", order: "+" }
			]);

			$scope.rasPagingContext.setSortableProperties([
	            { property:"variation.featureLoc.feature.name", displayName: "Gene" },
	            { property:"variation.rav_first_codon", displayName: "Start Location" },
	            { property:"variation.rav_substitutions", displayName: "Substitutions" },
	            { property:"ncbi_curated_frequency", displayName: "Frequency" }
            ]);

			
			$scope.rasPagingContext.setFilterProperties([
	     		{ property: "variation.featureLoc.feature.name", displayName: "Gene", filterHints: {type: "String"} },
	    		{ property: "variation.rav_substitutions", displayName: "Substitutions", filterHints: {type: "String"} },
	    		{ property: "ncbi_curated_frequency", displayName: "Frequency (percentage)", filterHints: {type: "Double"} }
			]);
			                          			
			$scope.rasPagingContext.setDefaultFilterElems([]);

			
			$scope.rasPagingContext.countChanged();

			
		}]);
