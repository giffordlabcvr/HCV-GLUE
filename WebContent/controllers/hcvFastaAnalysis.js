hcvApp.controller('hcvFastaAnalysisCtrl', 
		[ '$scope', '$controller', 'glueWS', 'glueWebToolConfig', 'dialogs', '$analytics', 'saveFile', 'FileSaver', '$http', '$window', '$timeout',
		  function($scope, $controller, glueWS, glueWebToolConfig, dialogs, $analytics, saveFile, FileSaver, $http, $window, $timeout) {
			
			addUtilsToScope($scope);

			$scope.analytics = $analytics;
			$scope.featureVisualisationUpdating = false;
			$scope.phyloVisualisationUpdating = false;
			$scope.phyloLegendUpdating = false;
			$scope.featureSvgUrlCache = {};
			$scope.phyloSvgResultObjectCache = {};
			$scope.featureNameToScrollLeft = {};
			$scope.lastFeatureName = null;
	    	$scope.displaySection = 'summary';
			
	    	$scope.neighbourSlider = {
	    			  value: 45,
	    			  options: {
	    			    precision: 2,
	    			    floor: 0,
	    			    ceil: 200,
	    			    hideLimitLabels: true,
	    			    hidePointerLabels: true,
	    			    getLegend: function(value, sliderId) { return toFixed(value/100, 1); }, 
	    			    step: 1,
	    			    showTicks: 10,
	    			    keyboardSupport: false,
	    			  }
	    			};
	    	
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
		    };
			
		    $scope.setFileItemUnderAnalysis = function(item) {
				$scope.saveFeatureScrollLeft();
		    	if(item.sequenceReport == null) {
		    		$scope.setSequenceReport(item, item.response.phdrWebReport.results[0]);
		    	}
		    	$scope.fileItemUnderAnalysis = item;
		    	$scope.featureVisualisationSvgUrl = null;
		    	$scope.phyloVisualisationSvgResultObject = null;
		    	$scope.phyloVisualisationSvgUrl = null;
		    	$scope.phyloLegendSvgUrl = null;
		    }
		    
		    $scope.setSequenceReport = function(item, sequenceReport) {
		    	// e.g. null genotype
		    	if(sequenceReport.phdrReport.sequenceResult.visualisationHints == null) {
		    		$scope.setComparisonRef(sequenceReport, null);
		    		$scope.setFeature(sequenceReport, null);
		    	} else {
			    	if(sequenceReport.phdrReport.comparisonRef == null) {
			    		$scope.setComparisonRef(sequenceReport, sequenceReport.phdrReport.sequenceResult.visualisationHints.comparisonRefs[0]);
			    	}
		    		var availableFeatures = sequenceReport.phdrReport.sequenceResult.visualisationHints.features;
		    		var feature = sequenceReport.phdrReport.feature;
			    	if(feature == null) {
			    		feature = availableFeatures[0];
			    	}
		    		if($scope.lastFeatureName != null) {
		    			var equivalentFeature = _.find(availableFeatures, function(availableFeature) { return availableFeature.name == $scope.lastFeatureName; });
		    			if(equivalentFeature != null) {
		    				feature = equivalentFeature;
		    			}
		    		}
		    		$scope.setFeature(sequenceReport, feature);
		    	}
		    	if(sequenceReport.phdrReport.sequenceResult.placements == null) {
		    		$scope.setPlacement(sequenceReport, null);
		    	} else {
		    		if(sequenceReport.phdrReport.placement == null) {
			    		$scope.setPlacement(sequenceReport, sequenceReport.phdrReport.sequenceResult.placements[0]);
		    		}
		    	}
		    	item.sequenceReport = sequenceReport;
		    }

			$scope.$watch('displaySection', function(newObj, oldObj) {
				if(newObj == "phyloPlacement") {
					$scope.refreshSlider();
				}
			});
		    
		    $scope.refreshSlider = function() {
		        $timeout(function () {
		        	console.log("rzSliderForceRender");
		            $scope.$broadcast('rzSliderForceRender');
		        });
		    };

		    
		    $scope.setComparisonRef = function(sequenceReport, comparisonRef) {
		    	// need to nest comparisonRef within phdrReport to avoid breaking command doc assumptions.
		    	sequenceReport.phdrReport.comparisonRef = comparisonRef;
		    }

		    $scope.setFeature = function(sequenceReport, feature) {
		    	// need to nest feature within phdrReport to avoid breaking command doc assumptions.
		    	sequenceReport.phdrReport.feature = feature;
		    }

		    $scope.setPlacement = function(sequenceReport, placement) {
		    	// need to nest feature within phdrReport to avoid breaking command doc assumptions.
		    	sequenceReport.phdrReport.placement = placement;
				$scope.refreshSlider();
		    }


			$scope.featureSvgUpdated = function() {
				console.info('featureSvgUpdated');
				var visualisationSvgElem = document.getElementById('featureVisualisationSvg');
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
				$scope.featureVisualisationUpdating = false;
				
			}
			
			$scope.phyloSvgUpdated = function() {
				$scope.phyloVisualisationUpdating = false;
			}

			$scope.phyloLegendSvgUpdated = function() {
				$scope.phyloLegendUpdating = false;
			}

			$scope.updateFeatureSvgFromUrl = function(cacheKey, svgUrl) {
				if(svgUrl == $scope.featureVisualisationSvgUrl) {
					// onLoad does not get invoked again for the same URL.
					$scope.featureSvgUpdated();
				} else {
					$scope.featureVisualisationSvgUrl = svgUrl;
					$scope.featureSvgUrlCache[cacheKey] = svgUrl;
				}
			}

			$scope.updatePhyloSvgFromResultObject = function(cacheKey, svgResultObject) {
				if(_.isEqual(svgResultObject, $scope.phyloVisualisationSvgResultObject)) {
					// onLoad does not get invoked again for the same URLs.
					$scope.phyloSvgUpdated();
					$scope.phyloLegendSvgUpdated();
				} else {
					$scope.phyloSvgResultObjectCache[cacheKey] = svgResultObject;
					$scope.phyloVisualisationSvgResultObject = svgResultObject;
					$scope.phyloVisualisationSvgUrl = "/glue_web_files/"+
					svgResultObject.treeTransformResult.freemarkerDocTransformerWebResult.webSubDirUuid+"/"+
					svgResultObject.treeTransformResult.freemarkerDocTransformerWebResult.webFileName;
					$scope.phyloLegendSvgUrl = "/glue_web_files/"+
					svgResultObject.legendTransformResult.freemarkerDocTransformerWebResult.webSubDirUuid+"/"+
					svgResultObject.legendTransformResult.freemarkerDocTransformerWebResult.webFileName;
				}
			}

			
			$scope.saveFeatureScrollLeft = function() {
				if($scope.lastFeatureName != null) {
					var visualisationSvgElem = document.getElementById('visualisationSvg');
					if(visualisationSvgElem != null) {
						$scope.featureNameToScrollLeft[$scope.lastFeatureName]	= visualisationSvgElem.scrollLeft;
					}
				}

			}
			
			$scope.updateFeatureSvg = function() {
				
				$scope.featureVisualisationUpdating = true;
				var sequenceReport = $scope.fileItemUnderAnalysis.sequenceReport;
				var visualisationHints = sequenceReport.phdrReport.sequenceResult.visualisationHints;

				var cacheKey = $scope.fileItemUnderAnalysis.file.name+":"+
					sequenceReport.phdrReport.sequenceResult.id+":"+
					sequenceReport.phdrReport.comparisonRef.refName+":"+
					sequenceReport.phdrReport.feature.name;
				console.info('cacheKey', cacheKey);
				
				$scope.saveFeatureScrollLeft();
				
				var featureName = sequenceReport.phdrReport.feature.name;

		    	$scope.lastFeatureName = featureName;

				var cachedSvgUrl = $scope.featureSvgUrlCache[cacheKey];
				
				if(cachedSvgUrl != null) {
					$timeout(function() {
						$scope.updateFeatureSvgFromUrl(cacheKey, cachedSvgUrl);
					});
				} else {
					var fileName = "visualisation.svg";
					console.info('visualisationHints', visualisationHints);
					glueWS.runGlueCommand("module/phdrSvgFeatureVisualisation", 
							{ 
								"invoke-function": {
									"functionName": "visualiseFeatureAsSvg", 
									"document": {
										"inputDocument": {
										    "targetReferenceName": visualisationHints.targetReferenceName,
										    "comparisonReferenceName": sequenceReport.phdrReport.comparisonRef.refName,
										    "featureName": featureName,
										    "queryNucleotides": visualisationHints.queryNucleotides,
										    "queryToTargetRefSegments": visualisationHints.queryToTargetRefSegments,
										    "queryDetails": visualisationHints.queryDetails, 
										    "fileName": fileName
										}
									}
								} 
							}
					).then(function onSuccess(response) {
						    // Handle success
					    var data = response.data;
						console.info('visualiseFeatureAsSvg result', data);
						var transformerResult = data.freemarkerDocTransformerWebResult;
						$scope.updateFeatureSvgFromUrl(cacheKey, "/glue_web_files/"+transformerResult.webSubDirUuid+"/"+transformerResult.webFileName);
					}, function onError(response) {
						    // Handle error
							$scope.featureVisualisationUpdating = false;
							var dlgFunction = glueWS.raiseErrorDialog(dialogs, "visualising genome feature");
							dlgFunction(response.data, response.status, response.headers, response.config);
					});
				}
			}

			
			$scope.updatePhyloSvg = function() {
				
				$scope.phyloVisualisationUpdating = true;
				$scope.phyloLegendUpdating = true;
				var sequenceReport = $scope.fileItemUnderAnalysis.sequenceReport;
				var placement = sequenceReport.phdrReport.placement;

				var cacheKey = $scope.fileItemUnderAnalysis.file.name+":"+
					sequenceReport.phdrReport.sequenceResult.id+":"+
					placement.placementIndex+":"+$scope.neighbourSlider.value;
				console.info('cacheKey', cacheKey);
				

				var cachedSvgResultObject = $scope.phyloSvgResultObjectCache[cacheKey];
				
				if(cachedSvgResultObject != null) {
					$timeout(function() {
						console.info('phylo SVG result object found in cache');
						$scope.updatePhyloSvgFromResultObject(cacheKey, cachedSvgResultObject);
					});
				} else {
					var fileName = "visualisation.svg";
					var legendFileName = "legend.svg";
					var scrollbarWidth = 17;
					glueWS.runGlueCommand("module/phdrSvgPhyloVisualisation", 
							{ 
								"invoke-function": {
									"functionName": "visualisePhyloAsSvg", 
									"document": {
										"inputDocument": {
										    "placerResult" : $scope.fileItemUnderAnalysis.response.phdrWebReport.placerResult, 
										    "queryName" : sequenceReport.phdrReport.sequenceResult.id,
										    "placementIndex" : placement.placementIndex,
										    "maxDistance" : toFixed($scope.neighbourSlider.value/100, 2),
											"pxWidth" : 1136 - scrollbarWidth, 
											"pxHeight" : 2500,
											"legendPxWidth" : 1136, 
											"legendPxHeight" : 80,
										    "fileName": fileName,
										    "legendFileName": legendFileName
										}
									}
								} 
							}
					).then(function onSuccess(response) {
						// Handle success
					    var data = response.data;
						console.info('visualisePhyloAsSvg result', data);
						var svgResultObj = data.visualisePhyloAsSvgResult;
						$scope.updatePhyloSvgFromResultObject(cacheKey, svgResultObj);
					}, function onError(response) {
					    // Handle error
						$scope.phyloVisualisationUpdating = false;
						$scope.phyloLegendUpdating = false;
						var dlgFunction = glueWS.raiseErrorDialog(dialogs, "visualising phylo tree");
						dlgFunction(response.data, response.status, response.headers, response.config);
					});
				}
			}
			
		    $scope.getPlacementLabel = function(placement) {
		    	return placement.placementIndex + " (" + toFixed(placement.likeWeightRatio * 100, 2) + "%)";
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
		    					if(drugAssessment.sufficientCoverage) {
		    						return drugAssessment.drugScore;
		    					} else {
		    						return 'insufficient_coverage';
		    					}
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
		    					if(drugAssessment.sufficientCoverage) {
		    						return drugAssessment.drugScoreDisplayShort;
		    					} else {
		    						return 'Insufficient coverage';
		    					}
		    				}
		    			}
		    		}
		    	}
		    	return "-";
		    };

			
		}]);


