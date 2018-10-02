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
  			                          			

			$scope.freqNoteWhereClause = "(variation.phdr_ras.phdr_alignment_ras.id != null and alignment.name = '"+$scope.almtName+"')";

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
 	            { property:"variation.phdr_ras.gene", displayName: "Virus protein", order: "+"  },
	            { property:"variation.phdr_ras.sort_key", displayName: "Polymorphic locations", order: "+" }
			]);

			$scope.freqNotePagingContext.setSortableProperties([
   	            { property:"variation.phdr_ras.gene", displayName: "Virus protein" },
	            { property:"variation.phdr_ras.sort_key", displayName: "Polymorphic locations" },
	            { property:"ncbi_curated_frequency", displayName: "Frequency" }
            ]);

			
			$scope.freqNotePagingContext.setFilterProperties([
	     		{ property: "variation.phdr_ras.gene", displayName: "Virus protein", filterHints: {type: "String"} },
	            { property: "variation.phdr_ras.phdr_alignment_ras.alignment.displayName", altProperties:["variation.phdr_ras.phdr_alignment_ras.alignment.name"], displayName: "Resisted genotype / subtype", filterHints: {type: "String"} },
	            { property: "variation.phdr_ras.phdr_alignment_ras.phdr_alignment_ras_drug.phdr_drug.id", displayName: "Drug", altProperties:["variation.phdr_ras.phdr_alignment_ras.phdr_alignment_ras_drug.phdr_drug.abbreviation", "variation.phdr_ras.phdr_alignment_ras.phdr_alignment_ras_drug.phdr_drug.research_code"], filterHints: {type: "String"} },
	    		{ property: "ncbi_curated_frequency", displayName: "Frequency (percentage)", filterHints: {type: "Double"} }
			]);
			                          			
			$scope.freqNotePagingContext.setDefaultFilterElems([]);

			
			$scope.freqNotePagingContext.countChanged();

			$scope.rapWhereClause = "(phdr_alignment_ras.alignment.name = '"+$scope.almtName+"' or phdr_alignment_ras.alignment.parent.name = '"+$scope.almtName+"' or phdr_alignment_ras.alignment.parent.parent.name = '"+$scope.almtName+"')";

			$scope.updateRapPage = function(pContext) {
				console.log("updateRapPage", pContext);
				
				var cmdParams = {
						"tableName": "phdr_alignment_ras_drug",
			            "whereClause": $scope.rapWhereClause,
			            "allObjects": false,
			            "rendererModuleName": "phdrAlignmentRasDrugRenderer"
				};
				pContext.extendListCmdParams(cmdParams);
				glueWS.runGlueCommand("", {
				    "multi-render": cmdParams
				})
			    .success(function(data, status, headers, config) {
			    	$scope.phdrAlignmentRasDrugs = data.multiRenderResult.resultDocument;
					console.info('phdr_alignment_ras_drug objects', $scope.phdrAlignmentRasDrugs);
			    })
			    .error(glueWS.raiseErrorDialog(dialogs, "listing RAPs"));
			}
			
			$scope.updateRapCount = function(pContext) {
				console.log("updateRapCount", pContext);
				
				var cmdParams = {
						"tableName": "phdr_alignment_ras_drug",
			            "whereClause": $scope.rapWhereClause
				};
				pContext.extendCountCmdParams(cmdParams);
				glueWS.runGlueCommand("", {
			    	"count": { 
				        "custom-table-row":cmdParams
			    	} 
				})
			    .success(function(data, status, headers, config) {
					console.info('count phdr_alignment_ras_drug objects raw result', data);
					$scope.rapPagingContext.setTotalItems(data.countResult.count);
					$scope.rapPagingContext.firstPage();
			    })
			    .error(glueWS.raiseErrorDialog(dialogs, "counting phdr_alignment_ras_drug objects"));
			}
			
			$scope.rapPagingContext = pagingContext.createPagingContext($scope.updateRapCount, $scope.updateRapPage);

			$scope.rapPagingContext.setDefaultSortOrder([
   	            { property:"numeric_resistance_category", displayName: "Resistance category", order: "+" },
 	            { property:"phdr_alignment_ras.phdr_ras.gene", displayName: "Virus protein", order: "+" },
  	            { property:"phdr_alignment_ras.phdr_ras.sort_key", displayName: "Polymorphic locations", order: "+" }
			]);

			$scope.rapPagingContext.setSortableProperties([
 	            { property:"phdr_alignment_ras.phdr_ras.gene", displayName: "Virus protein" },
  	            { property:"phdr_alignment_ras.phdr_ras.sort_key", displayName: "Polymorphic locations" },
	            { property:"numeric_resistance_category", displayName: "Resistance category"},
	            { property:"in_vitro_max_ec50_midpoint", displayName: "EC50 log fold change"}
            ]);

			
			$scope.rapPagingContext.setFilterProperties([
 	            { property:"phdr_alignment_ras.phdr_ras.gene", displayName: "Virus protein", filterHints: {type: "String"} },
	            { property:"phdr_alignment_ras.alignment.displayName", altProperties:["alignment.name"], displayName: "Genotype / subtype", filterHints: {type: "String"} },
	            { property:"phdr_drug.id", displayName: "Drug", altProperties:["phdr_drug.abbreviation", "phdr_drug.research_code"], filterHints: {type: "String"} },
  	            { property:"any_in_vitro_evidence", displayName: "In vitro evidence?", filterHints: {type: "Boolean"} }, 
  	            { property:"in_vitro_max_ec50_midpoint", displayName: "EC50 log fold change", filterHints: {type: "Double"} }, 
  	            { property:"any_in_vivo_evidencee", displayName: "In vivo evidence?", filterHints: {type: "Boolean"} }, 
  	            { property:"in_vivo_baseline", displayName: "Found at baseline?", filterHints: {type: "Boolean"} }, 
  	            { property:"in_vivo_treatment_emergent", displayName: "Treatment emergent?", filterHints: {type: "Boolean"} }
			]);
			                          			
			$scope.rapPagingContext.setDefaultFilterElems([]);

			
			$scope.rapPagingContext.countChanged();

			
			
			
		}]);
