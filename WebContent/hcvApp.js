	  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  })(window,document,'script','https:www.google-analytics.com/analytics.js','ga');
	
	  console.log("document.location.hostname", document.location.hostname);
	  var trackingID;
	  if(document.location.hostname.indexOf("hcv-glue.cvr.gla.ac.uk") >= 0) {
		  // HCV-GLUE production analytics account
		  trackingID = 'UA-93745543-1';
		  ga('create', trackingID, 'auto');
	  } else {
		  // sandbox analytics account
		  trackingID = 'UA-93752139-1';
		  ga('create', trackingID, 'none');
	  }
	  
	  console.log("before hcvApp module definition");

var hcvApp = angular.module('hcvApp', [
    'ngRoute', 
    'projectBrowser', 
    'angularFileUpload', 
    'home',
    'glueWS',
    'glueWebToolConfig',
    'treeControl',
    'angulartics',
    'angulartics.google.analytics',
    'angular-cookie-law',
    'hljs',
    'rzModule'
  ]);

console.log("after hcvApp module definition");

hcvApp.config(['$routeProvider', 'projectBrowserStandardRoutesProvider',
  function($routeProvider, projectBrowserStandardRoutesProvider) {
	
	var projectBrowserStandardRoutes = projectBrowserStandardRoutesProvider.$get();
	var projectBrowserURL = "../gluetools-web/www/projectBrowser";

    // custom reference view
	$routeProvider.
    when('/project/reference/:referenceName', {
  	  templateUrl: 'views/hcvReference.html',
  	  controller: 'hcvReferenceCtrl'
      });
    // custom sequences view
	$routeProvider.
    when('/project/sequence', {
  	  templateUrl: 'views/hcvSequences.html',
  	  controller: 'hcvSequencesCtrl'
      });
    // custom sequence view
	$routeProvider.
    when('/project/sequence/:sourceName/:sequenceID', {
  	  templateUrl: 'views/hcvSequence.html',
  	  controller: 'hcvSequenceCtrl'
      });
	// custom alignments view
	$routeProvider.
    when('/project/alignment', {
  	  templateUrl: 'views/hcvAlignments.html',
  	  controller: 'hcvAlignmentsCtrl'
      });
	// drugs overview
	$routeProvider.
    when('/project/drug', {
    	  templateUrl: 'views/hcvDrugs.html',
    	  controller: 'hcvDrugsCtrl'
        });
	// specific drug
	$routeProvider.
    when('/project/drug/:id', {
    	  templateUrl: 'views/hcvDrug.html',
    	  controller: 'hcvDrugCtrl'
        });
	// specific RAP
	$routeProvider.
    when('/project/rap/:id', {
    	  templateUrl: 'views/hcvRap.html',
    	  controller: 'hcvRapCtrl'
        });
	// RAPs overview
	$routeProvider.
    when('/project/rap', {
    	  templateUrl: 'views/hcvRaps.html',
    	  controller: 'hcvRapsCtrl'
        });
	// custom single alignment view
	$routeProvider.
    when('/project/alignment/:alignmentName', {
	  templateUrl: 'views/hcvAlignment.html',
	  controller: 'hcvAlignmentCtrl'
    });
	
    $routeProvider.
      when('/hcvFastaAnalysis', {
        templateUrl: '../views/hcvFastaAnalysis.html',
        controller: 'hcvFastaAnalysisCtrl'
      }).
      when('/aboutGlueProject', {
    	  templateUrl: './views/aboutGlueProject.html',
    	  controller: 'aboutGlueProjectCtrl'
      }).
      when('/aboutGlueProject/exampleFastaReport', {
    	  templateUrl: './views/exampleFastaReport.html',
    	  controller: 'exampleFastaReportCtrl'
      }).
      when('/aboutGlueProject/exampleBamReport', {
    	  templateUrl: './views/exampleBamReport.html',
    	  controller: 'exampleBamReportCtrl'
      }).
      when('/versionInfo', {
    	  templateUrl: './views/versionInfo.html',
    	  controller: 'versionInfoCtrl'
      }).
      when('/team', {
    	  templateUrl: './views/team.html',
    	  controller: 'teamCtrl'
      }).
      when('/howToCite', {
    	  templateUrl: './views/howToCite.html',
    	  controller: 'howToCiteCtrl'
      }).
      when('/home', {
    	  templateUrl: './modules/home/home.html',
    	  controller: 'homeCtrl'
      }).
      otherwise({
    	  redirectTo: '/home'
      });
}]);

hcvApp.controller('hcvAppCtrl', 
  [ '$scope', 'glueWS', 'glueWebToolConfig',
function ($scope, glueWS, glueWebToolConfig) {
	$scope.brand = "HCV-GLUE";
	$scope.homeMenuTitle = "Home";
	$scope.analysisMenuTitle = "Analysis";
	$scope.analysisToolMenuTitle = "Genotyping and Interpretation";
	$scope.projectBrowserMenuTitle = "Sequence Data";
	$scope.drugResistanceMenuTitle = "Drug Resistance";
	$scope.projectBrowserAlignmentMenuTitle = "NCBI Sequences by Clade";
	$scope.projectBrowserDrugMenuTitle = "Direct-acting Antivirals";
	$scope.projectBrowserRapMenuTitle = "Resistance-associated Polymorphisms";
	$scope.projectBrowserSequenceMenuTitle = "All NCBI Sequences";
	$scope.glueProjectMenuTitle = "Offline version";
	$scope.aboutHcvGlueMenuTitle = "About";
	$scope.aboutMenuTitle = "About";
	$scope.teamTitle = "The HCV-GLUE team";
	$scope.versionInfoTitle = "Version information";
	$scope.howToCiteTitle = "How to cite";
	glueWS.setProjectURL("../../../gluetools-ws/project/hcv");
	glueWS.setAsyncURL("../../../gluetools-ws");
	glueWebToolConfig.setAnalysisToolURL("../gluetools-web/www/analysisTool");
	glueWebToolConfig.setAnalysisToolExampleSequenceURL("exampleSequences/exampleSequences.fasta");
	glueWebToolConfig.setAnalysisToolExampleMsWindowsSequenceURL("exampleSequencesMsWindows/exampleSequences.fasta");
	glueWebToolConfig.setProjectBrowserURL("../gluetools-web/www/projectBrowser");
	glueWebToolConfig.setGlueWSURL("../gluetools-web/www/glueWS");
} ]);


