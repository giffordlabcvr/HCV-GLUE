hcvApp.controller('hcvFastaAnalysisCtrl', 
		[ '$scope', '$controller', 'glueWS', 'glueWebToolConfig', 'dialogs', '$analytics', 'saveFile', 'FileSaver', '$http', '$window',
		  function($scope, $controller, glueWS, glueWebToolConfig, dialogs, $analytics, saveFile, FileSaver, $http, $window) {
			
			addUtilsToScope($scope);

			$scope.analytics = $analytics;
			
			$controller('fileConsumerCtrl', { $scope: $scope, 
				glueWebToolConfig: glueWebToolConfig, 
				glueWS: glueWS, 
				dialogs: dialogs});

			// executed after the project URL is set
			glueWS.addProjectUrlListener( {
				reportProjectURL: function(projectURL) {
				    $scope.uploader.url = projectURL + "/module/phdrReportingController";
				    console.info('uploader.url', $scope.uploader.url);
				}
			});
			
			
		    // CALLBACKS
		    $scope.uploader.onBeforeUploadItem = function(item) {
				var commandObject = {
						"invoke-consumes-binary-function" : {
							"functionName": "reportFastaWeb",
							"argument": [item.file.name]
						}
				};
		    	item.formData = [{command: JSON.stringify(commandObject)}];
		        console.info('formData', JSON.stringify(item.formData));
		        console.info('onBeforeUploadItem', item);
				$scope.analytics.eventTrack("submitFastaFile", 
						{   category: 'hcvFastaAnalysis', 
							label: 'fileName:'+item.file.name+',fileSize:'+item.file.size});


		    };
		    $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
		        console.info('onSuccessItem', fileItem, response, status, headers);
				$scope.analytics.eventTrack("hcvFastaAnalysisResult", 
						{  category: 'hcvFastaAnalysis', 
							label: 'fileName:'+fileItem.file.name+',fileSize:'+fileItem.file.size });
				fileItem.response = response;
				console.log("hcvFastaAnalysis.response", response);
		    };
		    $scope.uploader.onErrorItem = function(fileItem, response, status, headers) {
		        console.info('onErrorItem', fileItem, response, status, headers);
		        var errorFn = glueWS.raiseErrorDialog(dialogs, "processing sequence file \""+fileItem.file.name+"\"");
		        errorFn(response, status, headers, {});
		    };

			$scope.removeAll = function() {
				$scope.uploader.clearQueue();
				$scope.fileItemUnderAnalysis = null;
			}

			$scope.removeItem = function(item) {
				if($scope.fileItemUnderAnalysis == item) {
					$scope.fileItemUnderAnalysis = null;
				}
				item.remove();
			}
		    
		    $scope.showAnalysisResults = function(item) {
		    	$scope.fileItemUnderAnalysis = item;
				$scope.summary = true;
				$scope.genomeVisualisation = false;
		    };
			
		    $scope.getGenotype = function(sequenceResult) {
		    	var genotypeCladeResult = _.find(sequenceResult.genotypingResult.queryCladeCategoryResult, function(qccr) {return qccr.categoryName == 'genotype'});
		    	if(genotypeCladeResult == null) {
		    		return "-";
		    	}
		    	return genotypeCladeResult.shortRenderedName;
		    };

		    $scope.getSubtype = function(sequenceResult) {
		    	var subtypeCladeResult = _.find(sequenceResult.genotypingResult.queryCladeCategoryResult, function(qccr) {return qccr.categoryName == 'subtype'});
		    	if(subtypeCladeResult == null) {
		    		return "-";
		    	}
		    	return subtypeCladeResult.shortRenderedName;
		    };

		    $scope.getClosestReferenceSequence = function(sequenceResult) {
		    	var genotypeCladeResult = _.find(sequenceResult.genotypingResult.queryCladeCategoryResult, function(qccr) {return qccr.categoryName == 'genotype'});
		    	if(genotypeCladeResult == null) {
		    		return "-";
		    	}
		    	return genotypeCladeResult.closestTargetSequenceID;
		    };

		    $scope.getResistanceLevel = function(sequenceResult, drugId) {
		    	if(sequenceResult.drugScores != null) { 
		    		for(var i = 0; i < sequenceResult.drugScores.length; i++) {
		    			var categoryScores = sequenceResult.drugScores[i];
		    			for(var j = 0; j < categoryScores.drugAssessments.length; j++) {
		    				var drugAssessment = categoryScores.drugAssessments[j];
		    				if(drugAssessment.drug.id == drugId) {
		    					return drugAssessment.drugScore;
		    				}
		    			}
		    		}
		    	}
		    	return "none";
		    };

		    $scope.getResistanceLevelText = function(sequenceResult, drugId) {
		    	if(sequenceResult.drugScores != null) { 
		    		for(var i = 0; i < sequenceResult.drugScores.length; i++) {
		    			var categoryScores = sequenceResult.drugScores[i];
		    			for(var j = 0; j < categoryScores.drugAssessments.length; j++) {
		    				var drugAssessment = categoryScores.drugAssessments[j];
		    				if(drugAssessment.drug.id == drugId) {
		    					return drugAssessment.drugScoreDisplayShort;
		    				}
		    			}
		    		}
		    	}
		    	return "-";
		    };

			$scope.$watch('summary', function(newObj, oldObj) {
				if(!$scope.updating) {
					$scope.updating = true;
					if(newObj) {
						$scope.genomeVisualisation = false;
					}
					$scope.updating = false;
				}
			}, false);

			$scope.$watch('genomeVisualisation', function(newObj, oldObj) {
				if(!$scope.updating) {
					$scope.updating = true;
					if(newObj) {
						$scope.summary = false;
					}
					$scope.updating = false;
				}
			}, false);

			$scope.downloadExampleSequence = function() {
				var url;
				if(userAgent.os.family.indexOf("Windows") !== -1) {
					url = "exampleSequences/exampleSequences.fasta";
				} else {
					url = "exampleSequencesMsWindows/exampleSequences.fasta";
				}
				$http.get(url)
				.success(function(data, status, headers, config) {
					console.log("data", data);
			    	var blob = new Blob([data], {type: "text/plain"});
			    	saveFile.saveFile(blob, "example sequence file", "exampleSequenceFile.fasta");
			    })
			    .error(glueWS.raiseErrorDialog(dialogs, "downloading example sequence file"));
			};
		    
			$scope.viewFullReport = function(fileItem, sequenceId, phdrResult) {
				if(fileItem.seqIdToReportUrl == null) {
					fileItem.seqIdToReportUrl = {};
				}
				var reportUrl = fileItem.seqIdToReportUrl[sequenceId];
				var fileName = "hcvReport.html";
				if(reportUrl == null) {
					glueWS.runGlueCommand("module/phdrRasReportTransformer", {
						"transform-to-web-file": {
							"webFileType": "WEB_PAGE",
							"commandDocument":phdrResult,
							"outputFile": fileName
						}
					})
					.success(function(data, status, headers, config) {
						console.info('transform-to-web-file result', data);
						var transformerResult = data.freemarkerDocTransformerWebResult;
						reportUrl = "/glue_web_files/"+transformerResult.webSubDirUuid+"/"+transformerResult.webFileName;
						fileItem.seqIdToReportUrl[sequenceId] = reportUrl;
						$window.open(reportUrl, '_blank');
					})
					.error(glueWS.raiseErrorDialog(dialogs, "rendering full HCV report"));
				} else {
					$window.open(reportUrl, '_blank');
				}
			};
			
		}]);
