projectBrowser.controller('hcvSequencesCtrl', 
		[ '$scope', 'glueWebToolConfig', 'glueWS', '$controller', 'dialogs', 
		    function($scope, glueWebToolConfig, glueWS, $controller, dialogs) {

			$controller('sequencesCtrl', { $scope: $scope, 
				glueWebToolConfig: glueWebToolConfig, 
				glueWS: glueWS, 
				dialogs: dialogs});

			console.log("initializing hcv sequences");
			

			$scope.init("source.name = 'ncbi-curated'", 
					["source.name",
					 "sequenceID",
					 "gb_create_date",
                     "gb_update_date",
					 "gb_length",
					 "gb_isolate",
                     "gb_country_iso",
                     "gb_country_short",
					 "gb_collection_year",
					 "gb_pubmed_id"] );
			
			$scope.pagingContext.setSortableProperties([
	            { property:"sequenceID", displayName: "NCBI Nucleotide ID" },
	            { property:"gb_create_date", displayName: "NCBI Entry Creation Date" },
	            { property:"gb_update_date", displayName: "NCBI Last Update Date" },
  	            { property:"gb_country_iso", displayName: "Country of Origin" },
	            { property:"gb_collection_year", displayName: "Collection Year" },
	            { property:"gb_isolate", displayName: "Isolate ID" },
	            { property:"gb_pubmed_id", displayName: "PubMed ID" },
	            { property:"gb_length", displayName: "Sequence Length" }
            ]);

			$scope.pagingContext.setDefaultSortOrder([
  			    { property: "sequenceID", displayName: "NCBI Nucleotide ID", order: "+" }
			]);

			$scope.pagingContext.setFilterProperties([
         		{ property:"sequenceID", displayName: "NCBI Nucleotide ID", filterHints: {type: "String"} },
        		{ property:"gb_length", displayName: "Sequence Length", filterHints: {type: "Integer"} },
        		{ property:"gb_create_date", displayName: "NCBI Entry Creation Date", filterHints: {type: "Date"} },
        		{ property:"gb_update_date", displayName: "NCBI Last Update Date", filterHints: {type: "Date"} },
  	            { property:"gb_country_short", altProperties:["gb_country_iso"], displayName: "Country of Origin", filterHints: {type: "String"} },
	            { property:"gb_collection_year", displayName: "Collection Year", filterHints: {type: "Integer"} },
	            { property:"gb_isolate", displayName: "Isolate ID", filterHints: {type: "String"} },
	            { property:"gb_pubmed_id", displayName: "PubMed ID", filterHints: {type: "String"} },
	            { property:"gb_lab_construct", displayName: "Lab Construct?", filterHints: {type: "Boolean"} },
	            { property:"gb_recombinant", displayName: "Recombinant?", filterHints: {type: "Boolean"} }
			]);
			                          			
			$scope.pagingContext.setDefaultFilterElems([]);

}]);
