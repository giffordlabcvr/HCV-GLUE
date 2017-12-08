hcvApp.controller('aboutGlueProjectCtrl', 
		[ '$scope', 'glueWS', 'dialogs', 'saveFile', 'FileSaver', '$http', '$location', '$anchorScroll',
		function($scope, glueWS, dialogs, saveFile, FileSaver, $http, $location, $anchorScroll) {

			$scope.downloadResistanceGeno1 = function() {
				var url;
				if(userAgent.os.family.indexOf("Windows") !== -1) {
					url = "exampleSequencesMsWindows/resistanceGeno1.fasta";
				} else {
					url = "exampleSequences/resistanceGeno1.fasta";
				}
				$http.get(url)
				.success(function(data, status, headers, config) {
					console.log("data", data);
			    	var blob = new Blob([data], {type: "text/plain"});
			    	saveFile.saveFile(blob, "resistanceGeno1.fasta file", "resistanceGeno1.fasta");
			    })
			    .error(glueWS.raiseErrorDialog(dialogs, "downloading resistanceGeno1.fasta file"));
			}

			$scope.downloadNgsData = function() {
				var url = "exampleSequences/ngsData.bam";
				$http.get(url)
				.success(function(data, status, headers, config) {
					console.log("data", data);
			    	var blob = new Blob([data], {type: "text/plain"});
			    	saveFile.saveFile(blob, "ngsData.bam file", "ngsData.bam");
			    })
			    .error(glueWS.raiseErrorDialog(dialogs, "downloading ngsData.bam file"));
			}
			
		    $scope.scrollTo = function(id) {
		        $location.hash(id);
		        $anchorScroll();
		     }
			
		} ]);
