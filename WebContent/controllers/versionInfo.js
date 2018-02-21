hcvApp.controller('versionInfoCtrl', 
		[ '$scope', 'glueWS', 'dialogs', 
		function($scope, glueWS, dialogs) {

			glueWS.runGlueCommand("", {
			    "glue-engine":{
			        "show-version":{}
			    }
			})
			.success(function(data, status, headers, config) {
				$scope.glueEngineVersion = data.glueEngineShowVersionResult.glueEngineVersion;
			})
			.error(glueWS.raiseErrorDialog(dialogs, "retrieving GLUE engine version"));
			
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
			        "extension-setting":{
			            "extensionName":"hcv_dr",
				        "extSettingName":"extension-version"
			        }
			    }
			})
			.success(function(data, status, headers, config) {
				$scope.hcvDRExtensionProjectVersion = data.projectShowExtensionSettingResult.extSettingValue;
			})
			.error(glueWS.raiseErrorDialog(dialogs, "retrieving hcv_dr extension-version setting"));

			glueWS.runGlueCommand("", {
			    "show":{
			        "extension-setting":{
			            "extensionName":"ncbi_hcv",
				        "extSettingName":"extension-version"
			        }
			    }
			})
			.success(function(data, status, headers, config) {
				$scope.ncbiHcvGlueExtensionProjectVersion = data.projectShowExtensionSettingResult.extSettingValue;
			})
			.error(glueWS.raiseErrorDialog(dialogs, "retrieving ncbi_hcv extension-version setting"));

			glueWS.runGlueCommand("", {
			    "show":{
			        "extension-setting":{
			            "extensionName":"ncbi_hcv",
			            "extSettingName":"extension-build-date"
			        }
			    }
			})
			.success(function(data, status, headers, config) {
				$scope.ncbiHcvGlueExtensionBuildDate = data.projectShowExtensionSettingResult.extSettingValue;
			})
			.error(glueWS.raiseErrorDialog(dialogs, "retrieving ncbi_hcv extension-build-date setting"));

			glueWS.runGlueCommand("", {
			    "show":{
			        "extension-setting":{
			            "extensionName":"ncbi_hcv",
			            "extSettingName":"extension-build-id"
			        }
			    }
			})
			.success(function(data, status, headers, config) {
				$scope.ncbiHcvGlueExtensionBuildId = data.projectShowExtensionSettingResult.extSettingValue;
			})
			.error(glueWS.raiseErrorDialog(dialogs, "retrieving ncbi_hcv extension-build-id setting"));

			
		} ]);
