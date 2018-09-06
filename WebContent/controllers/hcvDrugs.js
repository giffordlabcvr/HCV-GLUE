hcvApp.controller('hcvDrugsCtrl', 
		[ '$scope', '$route', '$routeParams', 'glueWS', 'dialogs', 
		  function($scope, $route, $routeParams, glueWS, dialogs) {

			addUtilsToScope($scope);

			$scope.drugs = [];


			glueWS.runGlueCommand("", {
			    "list":{
			        "custom-table-row":{
			            "tableName":"phdr_drug",
			            "fieldName":[
						    "id",
			                "abbreviation",
			                "category",
			                "producer",
			                "research_code"
			            ]
			        }
			    }
			})
			.success(function(data, status, headers, config) {
				var resultList = tableResultAsObjectList(data);
				console.info('$scope.drugs unsorted', resultList);
				$scope.drugs = _(resultList).chain().sortBy(function(drug) {
				    return drug.id;
				}).sortBy(function(drug) {
				    return drug.category;
				}).value();
				console.info('$scope.drugs', $scope.drugs);
			})
			.error(glueWS.raiseErrorDialog(dialogs, "retrieving drug"));

		}]);
