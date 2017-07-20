hcvApp.controller('aboutGlueProjectCtrl', 
		[ '$scope', 'glueWS', 'dialogs', 
		function($scope, glueWS, dialogs) {
			
			glueWS.runGlueCommand("", {
			    "show":{
			        "setting":{
			            "settingName":"project-version"
			        }
			    }
			})
			.success(function(data, status, headers, config) {
				$scope.hcvGlueProjectVersion = data.projectShowSettingResult.settingValue;
			})
			.error(glueWS.raiseErrorDialog(dialogs, "retrieving project-version setting"));

			glueWS.runGlueCommand("", {
			    "show":{
			        "setting":{
			            "settingName":"extension-version"
			        }
			    }
			})
			.success(function(data, status, headers, config) {
				$scope.ncbiHcvGlueExtensionProjectVersion = data.projectShowSettingResult.settingValue;
			})
			.error(glueWS.raiseErrorDialog(dialogs, "retrieving extension-version setting"));

			glueWS.runGlueCommand("", {
			    "show":{
			        "setting":{
			            "settingName":"extension-build-date"
			        }
			    }
			})
			.success(function(data, status, headers, config) {
				$scope.ncbiHcvGlueExtensionBuildDate = data.projectShowSettingResult.settingValue;
			})
			.error(glueWS.raiseErrorDialog(dialogs, "retrieving extension-build-date setting"));

			glueWS.runGlueCommand("", {
			    "show":{
			        "setting":{
			            "settingName":"extension-build-id"
			        }
			    }
			})
			.success(function(data, status, headers, config) {
				$scope.ncbiHcvGlueExtensionBuildId = data.projectShowSettingResult.settingValue;
			})
			.error(glueWS.raiseErrorDialog(dialogs, "retrieving extension-build-id setting"));

			
		} ]);
