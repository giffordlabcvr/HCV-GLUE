hcvApp.controller('hcvFastaAnalysisCtrl', 
		[ '$scope', '$controller', 'glueWS', 'glueWebToolConfig', 'dialogs', '$analytics',
		  function($scope, $controller, glueWS, glueWebToolConfig, dialogs, $analytics) {
			
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
				console.log(response);
		    };
		    $scope.uploader.onErrorItem = function(fileItem, response, status, headers) {
		        console.info('onErrorItem', fileItem, response, status, headers);
		        var errorFn = glueWS.raiseErrorDialog(dialogs, "processing sequence file \""+fileItem.file.name+"\"");
		        errorFn(response, status, headers, {});
		    };
		    $scope.uploader.onWhenAddingFileFailed = function(item, filter, options) {
		        console.info('onWhenAddingFileFailed', item, filter, options);
		    };
		    $scope.uploader.onAfterAddingFile = function(fileItem) {
		        console.info('onAfterAddingFile', fileItem);
		    };
		    $scope.uploader.onAfterAddingAll = function(addedFileItems) {
		        console.info('onAfterAddingAll', addedFileItems);
		    };
		    $scope.uploader.onProgressItem = function(fileItem, progress) {
		        console.info('onProgressItem', fileItem, progress);
		    };
		    $scope.uploader.onProgressAll = function(progress) {
		        console.info('onProgressAll', progress);
		    };
		    $scope.uploader.onCancelItem = function(fileItem, response, status, headers) {
		        console.info('onCancelItem', fileItem, response, status, headers);
		    };
		    $scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
		        console.info('onCompleteItem', fileItem, response, status, headers);
		    };
		    $scope.uploader.onCompleteAll = function() {
		        console.info('onCompleteAll');
		    };

			
		}]);
