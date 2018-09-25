hcvApp.controller('hcvFastaAnalysisCtrl', 
		[ '$scope', '$controller', 'glueWS', 'glueWebToolConfig', 'dialogs', '$analytics', 'saveFile', 'FileSaver', '$http', '$window', '$timeout', '$rootScope',
		  function($scope, $controller, glueWS, glueWebToolConfig, dialogs, $analytics, saveFile, FileSaver, $http, $window, $timeout, $rootScope) {
			
			addUtilsToScope($scope);

			$scope.analytics = $analytics;
			$scope.visualisationUpdating = false;
			$scope.svgUrlCache = {};
			$scope.featureNameToScrollLeft = {};
			$scope.lastFeatureName = null;
			
			// begin experimental
			var watchers;

			$scope.$on('suspend', function () {
			  watchers = $scope.$$watchers;
			  $scope.$$watchers = [];
			});

			$scope.$on('resume', function () {
			  $scope.$$watchers = watchers;
			  watchers = null;
			});
			// end experimental
			
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
		    	$scope.setFileItemUnderAnalysis(item);
		    	$scope.summary = true;
				$scope.genomeVisualisation = false;
		    };
			
		    $scope.setFileItemUnderAnalysis = function(item) {
		    	if(item.sequenceReport == null) {
		    		$scope.setSequenceReport(item, item.response.phdrWebReport.results[0]);
		    	}
		    	$scope.fileItemUnderAnalysis = item;
		    }
		    
		    $scope.setSequenceReport = function(item, sequenceReport) {
		    	if(sequenceReport.phdrReport.comparisonRef == null) {
		    		$scope.setComparisonRef(sequenceReport, sequenceReport.phdrReport.sequenceResult.visualisationHints.comparisonRefs[0]);
		    	}
	    		var availableFeatures = sequenceReport.phdrReport.sequenceResult.visualisationHints.features;
	    		var feature = sequenceReport.phdrReport.feature;
		    	if(feature == null) {
		    		feature = availableFeatures[0];
		    	}
	    		if(item.sequenceReport != null) {
	    			var currentFeatureName = item.sequenceReport.phdrReport.feature.name;
	    			var equivalentFeature = _.find(availableFeatures, function(availableFeature) { return availableFeature.name == currentFeatureName; });
	    			if(equivalentFeature != null) {
	    				feature = equivalentFeature;
	    			}
	    		}
	    		$scope.setFeature(sequenceReport, feature);
		    	item.sequenceReport = sequenceReport;
		    }

		    
		    $scope.setComparisonRef = function(sequenceReport, comparisonRef) {
		    	// need to nest comparisonRef within phdrReport to avoid breaking command doc assumptions.
		    	sequenceReport.phdrReport.comparisonRef = comparisonRef;
		    }

		    $scope.setFeature = function(sequenceReport, feature) {
		    	// need to nest feature within phdrReport to avoid breaking command doc assumptions.
		    	sequenceReport.phdrReport.feature = feature;
		    }

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

			$scope.svgLoaded = function() {
				console.info('svgLoaded');
				var visualisationSvgElem = document.getElementById('visualisationSvg');
				if(visualisationSvgElem != null) {
					var featureName = $scope.fileItemUnderAnalysis.sequenceReport.phdrReport.feature.name;
					console.info('featureName', featureName);
					var featureScrollLeft = $scope.featureNameToScrollLeft[featureName];
					console.info('featureScrollLeft', featureScrollLeft);
					if(featureScrollLeft != null) {
						visualisationSvgElem.scrollLeft = featureScrollLeft;
					} else {
						visualisationSvgElem.scrollLeft = 0;
					}
					$scope.lastFeatureName = featureName;
				}
				$scope.visualisationUpdating = false;
				
				
				
			}
			$scope.updateSvg = function() {
				
				$scope.visualisationUpdating = true;
				var sequenceReport = $scope.fileItemUnderAnalysis.sequenceReport;
				var visualisationHints = sequenceReport.phdrReport.sequenceResult.visualisationHints;

				var cacheKey = $scope.fileItemUnderAnalysis.file.name+":"+
					sequenceReport.phdrReport.sequenceResult.id+":"+
					sequenceReport.phdrReport.comparisonRef.refName+":"+
					sequenceReport.phdrReport.feature.name;
				console.info('cacheKey', cacheKey);
				
				if($scope.lastFeatureName != null) {
					var visualisationSvgElem = document.getElementById('visualisationSvg');
					if(visualisationSvgElem != null) {
						$scope.featureNameToScrollLeft[$scope.lastFeatureName]	= visualisationSvgElem.scrollLeft;
					}
				}
				
				var featureName = sequenceReport.phdrReport.feature.name;


				var cachedSvgUrl = $scope.svgUrlCache[cacheKey];
				
				if(cachedSvgUrl != null) {
					$timeout(function() {$scope.visualisationSvgUrl = cachedSvgUrl;});
				} else {
					console.info('visualisationHints', visualisationHints);
					glueWS.runGlueCommand("module/phdrVisualisationUtility", 
							{ "visualise-feature": {
							    "targetReferenceName": visualisationHints.targetReferenceName,
							    "comparisonReferenceName": sequenceReport.phdrReport.comparisonRef.refName,
							    "featureName": featureName,
							    "queryNucleotides": visualisationHints.queryNucleotides,
							    "queryToTargetRefSegments": visualisationHints.queryToTargetRefSegments,
							    "queryDetails": []
							  } }
					).success(function(data, status, headers, config) {
						console.info('visualise-feature result', data);
						var featureVisualisation = data;
						var fileName = "visualisation.svg";
						glueWS.runGlueCommand("module/phdrFeatureToSvgTransformer", {
							"transform-to-web-file": {
								"webFileType": "WEB_PAGE",
								"commandDocument":{
									transformerInput: {
										featureVisualisation: featureVisualisation.featureVisualisation,
										ntWidth: 16
									}
								},
								"outputFile": fileName
							}
						})
						.success(function(data, status, headers, config) {
							console.info('transform-to-web-file result', data);
							var transformerResult = data.freemarkerDocTransformerWebResult;
							$scope.visualisationSvgUrl = "/glue_web_files/"+transformerResult.webSubDirUuid+"/"+transformerResult.webFileName;
							// BEGIN experimental	
							$scope.$broadcast('suspend');
							$http.get($scope.visualisationSvgUrl)
						    .then(function(response) {
						        //console.log("get response.data", response.data);
								var visualisationSvgElem = document.getElementById('visualisationSvg');
								while(visualisationSvgElem.firstChild) {
									visualisationSvgElem.removeChild(visualisationSvgElem.firstChild);
								}
								var parser = new DOMParser()
								var svgDoc = parser.parseFromString(response.data, "text/xml");
								var adoptedSvgElem = document.adoptNode(svgDoc.firstChild);
								visualisationSvgElem.appendChild(adoptedSvgElem);
								$scope.visualisationUpdating = false;
								$scope.$broadcast('resume');
						    });

							// END experimental	
							
							//$scope.svgUrlCache[cacheKey] = $scope.visualisationSvgUrl;
						})
						.error(function(data, status, headers, config) {
							$scope.visualisationUpdating = false;
							var dlgFunction = glueWS.raiseErrorDialog(dialogs, "rendering genome feature to SVG");
							dlgFunction(data, status, headers, config);
						});
					})
					.error(function(data, status, headers, config) {
						$scope.visualisationUpdating = false;
						var dlgFunction = glueWS.raiseErrorDialog(dialogs, "visualising genome feature");
						dlgFunction(data, status, headers, config);
					});
				}
			}
			
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
