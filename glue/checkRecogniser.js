var sequenceMap = {};

var whereClause = "sequenceID like 'J%' and source.name = 'ncbi-curated' and ( gb_host = 'Homo sapiens' or gb_host = null ) and ( gb_lab_construct = 'false' ) and ( gb_recombinant = 'false' )";

var segmentSequences = glue.command(["list", "sequence", "-w", whereClause, "source.name", "sequenceID"], {convertTableToObjects: true});

_.each(segmentSequences, function(segmentSequence) {
	sequenceMap[segmentSequence["source.name"]+"/"+segmentSequence["sequenceID"]] = {categories:[]};
});

var recognitionResults;

glue.inMode("/module/hcvSequenceRecogniser", function() {
	recognitionResults = glue.command(["recognise", "sequence", "-w", whereClause], {convertTableToObjects: true});
});

_.each(recognitionResults, function(recognitionResult) {
	var sequenceEntry = sequenceMap[recognitionResult.querySequenceId];
	sequenceEntry.categories.push({category:recognitionResult.categoryId, direction:recognitionResult.direction});
});

_.each(_.pairs(sequenceMap), function(pair) {
	var seqId = pair[0];
	var seqEntry = pair[1];
	if(seqEntry.categories.length != 1 || !_.isEqual(seqEntry.categories[0], {category:"HCV", direction:"FORWARD"})) {
		glue.log("INFO", "Unexpected sequence recognition result", pair);
	}
});
