
// This is a hack.
// When closing a dialog which was launched from an SVG element, on Internet Explorer, 
// there is an attempt to invoke focus() on the main svg element, which doesn't exist.
// this hack defines it.
if (typeof SVGElement.prototype.focus == 'undefined') {
    SVGElement.prototype.focus = function() {};
}

analysisTool.directive('epitopeComparison', function() {
	  return {
		    restrict: 'A',
		    controller: function($scope) {
		    	var params = $scope.svgParams;
		    	
		    	$scope.$watch( 'epitopePattern', function(newObj, oldObj) {
		    		$scope.updateElem();
		    	}, false);

		    	$scope.$watch( 'queryPattern', function(newObj, oldObj) {
		    		$scope.updateElem();
		    	}, false);


		    	$scope.updateElem = function() {
		    		if($scope.epitopePattern == null || $scope.queryPattern == null) {
		    			return;
		    		}
	    			var docFrag = angular.element(document.createDocumentFragment());
	    			
	    			var epitopeAas = $scope.epitopePattern.split("");
	    			var queryAas = $scope.queryPattern.split("");
	    			
    				var x = 0;
    				var y = 0;
	    			for(var i = 0; i < epitopeAas.length; i++) {
	    				docFrag.append(svgElem('rect', {
		    				"class": "epitopeAaBackground", 
		    				x: x,
		    				y: y,
		    				width: $scope.svgParams.aaWidth,
		    				height: $scope.svgParams.aaHeight
		    			}));
	    				docFrag.append(svgElem('text', {
		    				"class": "epitopeAa", 
		    				x: x + $scope.svgParams.aaWidth/2,
		    				y: y + $scope.svgParams.aaHeight/2,
		    				width: $scope.svgParams.aaWidth,
		    				height: $scope.svgParams.aaHeight,
		    				dy: svgDyValue(userAgent)
		    			}, function(text) {
		    				text.append(epitopeAas[i]);
		    			}));
	    				x = x + $scope.svgParams.aaWidth + $scope.svgParams.aaGap;
	    			}
    				x = 0;
    				y = $scope.svgParams.aaHeight + $scope.svgParams.aaGap;
	    			for(var i = 0; i < queryAas.length; i++) {
	    				var diff = false;
	    				if(queryAas[i] != epitopeAas[i]) {
	    					diff = true;
	    				}
	    				docFrag.append(svgElem('rect', {
		    				"class": diff ? "queryAaDiffBackground" : "queryAaBackground", 
		    				x: x,
		    				y: y,
		    				width: $scope.svgParams.aaWidth,
		    				height: $scope.svgParams.aaHeight
		    			}));
	    				docFrag.append(svgElem('text', {
		    				"class": diff ? "queryAaDiff" : "queryAa", 
		    				"style": "font-size: 100%;",
		    				x: x + $scope.svgParams.aaWidth/2,
		    				y: y + $scope.svgParams.aaHeight/2,
		    				width: $scope.svgParams.aaWidth,
		    				height: $scope.svgParams.aaHeight,
		    				dy: svgDyValue(userAgent)
		    			}, function(text) {
		    				text.append(queryAas[i]);
		    			}));
	    				x = x + $scope.svgParams.aaWidth + $scope.svgParams.aaGap;
	    			}
		    		$scope.elem.empty();
		    		$scope.elem.append(docFrag);
    			}
		    	
		    },
		    link: function(scope, element, attributes){
		    	scope.elem = element;
		    },
		    scope: {
		      svgParams: '=',
		      epitopePattern: '=',
			  queryPattern: '='
		    }
		  };
		});