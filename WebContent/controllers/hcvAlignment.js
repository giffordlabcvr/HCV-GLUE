hcvApp.controller('hcvAlignmentCtrl', 
		[ '$scope', '$routeParams', '$controller', 'glueWS', 'dialogs', 'pagingContext',
		  function($scope, $routeParams, $controller, glueWS, dialogs, pagingContext) {
			
			addUtilsToScope($scope);

			$controller('alignmentCtrl', { $scope: $scope, 
				glueWebToolConfig: glueWebToolConfig, 
				glueWS: glueWS, 
				dialogs: dialogs});

			$scope.init($routeParams.alignmentName, 
					"hcvAlignmentRenderer", "sequence.source.name = 'ncbi-curated'",
					[
                     "sequence.sequenceID",
                     "alignment.name",
                     "alignment.displayName",
                     "sequence.gb_country_official",
                     "sequence.gb_collection_year",
                     "sequence.gb_length",
                     "sequence.gb_create_date",
                     "sequence.gb_pubmed_id",
                     "sequence.gb_isolate"
                 ]);

			$scope.pagingContext.setDefaultSortOrder([
			    { property: "sequence.sequenceID", displayName: "NCBI Nucleotide ID", order: "+" }
			]);

			
			$scope.pagingContext.setSortableProperties([
            { property:"alignment.name", displayName: "Genotype / Subtype" },
            { property:"sequence.sequenceID", displayName: "NCBI Nucleotide ID" },
	            { property:"sequence.gb_create_date", displayName: "Creation Date" },
	            { property:"sequence.gb_country_official", displayName: "Country of Origin" },
	            { property:"sequence.gb_collection_year", displayName: "Collection Year" },
	            { property:"sequence.gb_isolate", displayName: "Isolate ID" },
	            { property:"sequence.gb_pubmed_id", displayName: "PubMed ID" },
	            { property:"sequence.gb_length", displayName: "Sequence Length" }
            ]);

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
			
			$scope.rasPagingContext = pagingContext.createPagingContext($scope.updateRasPage);

			$scope.rasPagingContext.setDefaultSortOrder([
			    { property: "variation.featureLoc.feature.name", displayName: "Gene", order: "+" }
			]);

			$scope.rasPagingContext.setSortableProperties([
	            { property:"variation.featureLoc.feature.name", displayName: "Gene" },
	            { property:"variation.rav_first_codon", displayName: "Start Location" },
	            { property:"variation.rav_substitutions", displayName: "Substitutions" },
	            { property:"ncbi_curated_frequency", displayName: "Frequency" }
            ]);
			
			glueWS.runGlueCommand("", {
		    	"count": { 
			        "var-almt-note":{
			            "whereClause": $scope.rasNoteWhereClause
			        }
		    	} 
			})
		    .success(function(data, status, headers, config) {
				console.info('count RAS frequency notes raw result', data);
				$scope.rasPagingContext.setTotalItems(data.countResult.count);
				$scope.rasPagingContext.firstPage();
		    })
		    .error(glueWS.raiseErrorDialog(dialogs, "counting RAS frequency notes"));

			
		}]);
