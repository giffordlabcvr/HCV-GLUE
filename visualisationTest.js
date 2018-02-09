

var nucleotides;
var segments;

var almtName = "AL_3a";
var sourceName = "ncbi-curated";
var sequenceID = "MG455685";
var referenceName;
var featureName = "NS5A";

//glue.inMode("/alignment/"+almtName, function() {
//	referenceName = glue.command(["show", "reference"]).showReferenceResult.referenceName;
//});

referenceName = "REF_MASTER_NC_004102"

glue.inMode("/sequence/"+sourceName+"/"+sequenceID, function() {
	nucleotides = glue.command(["show", "nucleotides"]).nucleotidesResult.nucleotides;
});

glue.inMode("/alignment/"+almtName+"/member/"+sourceName+"/"+sequenceID, function() {
	segments = glue.command(["show", "feature-segments", "--relRefName", referenceName, 
	     "--featureName", "whole_genome", "--queryAlignedSegments"]).queryAlignedSegmentsResult.segments;
});

glue.inMode("/module/hcvWebVisualisationUtility", function() {
	glue.logInfo("commandResults", glue.command({
		"visualise-feature" : {
			"referenceName": referenceName,
			"featureName": featureName,
			"queryToRefSegments": segments,
			"queryNucleotides": nucleotides
		}
	}));
});