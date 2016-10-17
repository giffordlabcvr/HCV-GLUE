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
					 "gb_length",
					 "gb_isolate",
					 "gb_country_official",
					 "gb_collection_year",
					 "gb_pubmed_id"] );
	
}]);
