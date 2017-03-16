	  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  })(window,document,'script','https:www.google-analytics.com/analytics.js','ga');
	
	  console.log("document.location.hostname", document.location.hostname);
	  var trackingID;
	  if(document.location.hostname.indexOf("hcv.glue.cvr.ac.uk") >= 0) {
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
    'analysisTool', 
    'projectBrowser', 
    'home',
    'glueWS',
    'glueWebToolConfig',
    'treeControl',
    'angulartics',
    'angulartics.google.analytics',
    'angular-cookie-law'
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
	// Drug resistance publications overview
	$routeProvider.
    when('/project/drug_resistance_publication', {
    	  templateUrl: 'views/hcvDrugResistancePublications.html',
    	  controller: 'hcvDrugResistancePublicationsCtrl'
        });
	// specific drug resistance publication
	$routeProvider.
    when('/project/drug_resistance_publication/:id', {
    	  templateUrl: 'views/hcvDrugResistancePublication.html',
    	  controller: 'hcvDrugResistancePublicationCtrl'
        });
	// specific RAV
	$routeProvider.
    when('/project/rav/:referenceName/:featureName/:variationName', {
    	  templateUrl: 'views/hcvRav.html',
    	  controller: 'hcvRavCtrl'
        });
	// RAVs overview
	$routeProvider.
    when('/project/rav', {
    	  templateUrl: 'views/hcvRavs.html',
    	  controller: 'hcvRavsCtrl'
        });
	// custom single alignment view
	$routeProvider.
    when('/project/alignment/:alignmentName', {
	  templateUrl: 'views/hcvAlignment.html',
	  controller: 'hcvAlignmentCtrl'
    });
	
    $routeProvider.
      when('/analysisTool', {
        templateUrl: '../gluetools-web/www/analysisTool/analysisTool.html',
        controller: 'analysisToolCtrl'
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
	$scope.projectBrowserMenuTitle = "Sequence Database";
	$scope.drugResistanceMenuTitle = "Drug Resistance";
	$scope.projectBrowserAlignmentMenuTitle = "Clade Tree";
	$scope.projectBrowserDrugMenuTitle = "Direct-acting Antivirals";
	$scope.projectBrowserRavMenuTitle = "Resistance-associated Substitutions";
	$scope.projectBrowserDrugPubMenuTitle = "Drug Resistance References";
	$scope.projectBrowserSequenceMenuTitle = "Sequences";
	glueWS.setProjectURL("../../../gluetools-ws/project/hcv");
	glueWebToolConfig.setAnalysisToolURL("../gluetools-web/www/analysisTool");
	glueWebToolConfig.setProjectBrowserURL("../gluetools-web/www/projectBrowser");
	glueWebToolConfig.setGlueWSURL("../gluetools-web/www/glueWS");
	glueWebToolConfig.setRendererDialogs([
	                              	    {
	                            	    	renderer: "hcvEpitopeRenderer",
	                            	    	dialogURL: "dialogs/displayEpitope.html",
	                            	    	dialogController: "displayEpitopeCtrl"
	                            	    },
	                            	    {
	                            	    	renderer: "hcvCommonAaPolymorphismRenderer",
	                            	    	dialogURL: "dialogs/displayCommonAa.html",
	                            	    	dialogController: "displayCommonAaCtrl"
	                            	    },
	                            	    {
	                            	    	renderer: "hcvResistanceAssociatedVariantRenderer",
	                            	    	dialogURL: "dialogs/displayRAV.html",
	                            	    	dialogController: "displayRAVCtrl"
	                            	    }
	]);
} ]);


