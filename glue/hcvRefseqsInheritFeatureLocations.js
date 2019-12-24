
// These locations should exist on all reference sequences. 
// (As of 24/12/2019 these were associated with category I resistance in one or more drugs/subtypes)
// If not we should at least investigate why.
// A few reference sequences miss NS5B location 556 because they are truncated.

var drLocs = {
		"NS3": ["36", "56", "80", "107", "155", "156", "168"],
		"NS5A": ["24", "28", "30", "31", "32", "38", "54", "58", "93"],
		"NS5B": ["150", "159", "282", "316", "556"]
}


glue.command(["multi-delete", "feature_location", "-w", "referenceSequence.name != 'REF_MASTER_NC_004102'"]);

var refSeqObjs = glue.tableToObjects(glue.command(["list", "reference", "-w", "name != 'REF_MASTER_NC_004102'", "name", "sequence.source.name", "sequence.sequenceID"]));

var problematicRefs = {};


_.each(refSeqObjs, function(refSeqObj) {
	var seqLength;
	glue.inMode("sequence/"+refSeqObj["sequence.source.name"]+"/"+refSeqObj["sequence.sequenceID"], function() {
		seqLength = glue.command(["show", "length"]).lengthResult.length;
	});
	
	glue.inMode("reference/"+refSeqObj.name, function() {
		glue.command(["add", "feature-location", "whole_genome"]);
		glue.inMode("feature-location/whole_genome", function() {
			glue.command(["add", "segment", 1, seqLength]);
		});
		var featureName = "precursor_polyprotein";
		glue.command(["inherit", "feature-location", 
			"--recursive", "--spanGaps",
			"AL_UNCONSTRAINED", "--relRefName", "REF_MASTER_NC_004102", featureName]);
		var polyproteinEnd;
		var polyproteinStart;
		var updateNS5B = false; 
		var polyproteinStopFound = false;
		glue.inMode("feature-location/"+featureName, function() {
			var aaRows = glue.tableToObjects(glue.command(["amino-acid"]));
			for(var i = 0; i < aaRows.length; i++) {
				var aa = aaRows[i].aminoAcid;
				if(i == 0 && aa != "M") {
					glue.log("WARNING", "Residue "+aaRows[i].codonLabel+" of feature "+featureName+" on reference "+refSeqObj.name+" should be M");
					problematicRefs[refSeqObj.name] = "yes";
				}
				if(i < aaRows.length-1 && aa == "*") {
					glue.log("WARNING", "Residue "+aaRows[i].codonLabel+" of feature "+featureName+" on reference "+refSeqObj.name+" should not be *");
					problematicRefs[refSeqObj.name] = "yes";
				}
				/* if(i < aaRows.length-1 && aa == "X") {
					glue.log("WARNING", "Residue "+aaRows[i].codonLabel+" of feature "+featureName+" on reference "+refSeqObj.name+" should not be X");
					problematicRefs[refSeqObj.name] = "yes";
				} */
				if(i == aaRows.length-1 && aa == "*") {
					polyproteinStopFound = true;
				}
			}

			var listSegmentResults = glue.tableToObjects(glue.command(["list", "segment"]));
			if(listSegmentResults.length != 1) {
				throw new Error("Expected polyprotein on reference "+refSeqObj.name+" to have a single feature segment");
			}
			var singleFSegment = listSegmentResults[0];
			polyproteinStart = singleFSegment.refStart;
			polyproteinEnd = singleFSegment.refEnd;

			// may need to remove 1 or 2 nucleotides from the end of polyprotein
			var endOfLastCodon = aaRows[aaRows.length-1].refNt + 2;
			if(endOfLastCodon < polyproteinEnd) {
				glue.log("INFO", "Polyprotein on reference "+refSeqObj.name+" has non-coding nucleotides, truncating it");
				glue.command(["remove", "segment", polyproteinStart, polyproteinEnd]);
				polyproteinEnd = endOfLastCodon;
				glue.command(["add", "segment", polyproteinStart, polyproteinEnd]);
				updateNS5B = true; 
			}

			// may need to extend polyprotein further towards 3'
			if(!polyproteinStopFound) {
				glue.log("INFO", "Polyprotein on reference "+refSeqObj.name+" does not end in a stop, may extend it");
				while(!polyproteinStopFound && polyproteinEnd < seqLength - 2) {
					updateNS5B = true;
					glue.command(["remove", "segment", polyproteinStart, polyproteinEnd]);
					polyproteinEnd = polyproteinEnd+3;
					glue.command(["add", "segment", polyproteinStart, polyproteinEnd]);
					glue.command(["new-context"]); // ref amino acid translations are cached!
					aaRows = glue.tableToObjects(glue.command(["amino-acid"]));
					aa = aaRows[aaRows.length-1].aminoAcid;
					if(aa == "*") {
						polyproteinStopFound = true;
					}
				}
			}
		});
		if(updateNS5B) {
			glue.log("INFO", "Updated polyprotein on reference "+refSeqObj.name+", also updating NS5B");
			glue.inMode("feature-location/NS5B", function() {
				var listSegmentResults = glue.tableToObjects(glue.command(["list", "segment"]));
				if(listSegmentResults.length != 1) {
					throw new Error("Expected NS5B on reference "+refSeqObj.name+" to have a single feature segment");
				}
				var singleFSegment = listSegmentResults[0];
				var ns5BStart = singleFSegment.refStart;
				var ns5BEnd = singleFSegment.refEnd;
				glue.command(["remove", "segment", ns5BStart, ns5BEnd]);
				glue.command(["add", "segment", ns5BStart, polyproteinEnd]);
			});

		}
		if(polyproteinStart > 1) {
			glue.command(["add", "feature-location", "5UTR"]);
			glue.inMode("feature-location/5UTR", function() {
				glue.command(["add", "segment", 1, polyproteinStart-1]);
			});
		}
		if(polyproteinStopFound && polyproteinEnd < seqLength) {
			glue.command(["add", "feature-location", "3UTR"]);
			glue.inMode("feature-location/3UTR", function() {
				glue.command(["add", "segment", polyproteinEnd+1, seqLength]);
			});
		}
		_.each(_.pairs(drLocs), function(pair) {
			var protein = pair[0];
			var locsRequired = pair[1];
			glue.inMode("feature-location/"+protein, function() {
				var aaRows = glue.tableToObjects(glue.command(["amino-acid"]));
				var locsPresent = _.map(aaRows, function(aaRow) {return aaRow.codonLabel;});
				var missing = _.difference(locsRequired, locsPresent);
				if(missing.length > 0) {
					glue.log("WARNING", "Missing drug resistant locations in feature loc "+protein+" of reference "+refSeqObj.name+": "+missing);
					problematicRefs[refSeqObj.name] = "yes";
				}
			});
		});	
	});
});

// This sequence has a single nucleotide insertion taking it out of frame then a matching deletion taking it back in
// a few hundred bases downstream.
// Not sure how realistic this is but need to do an explicit modification so that it validates.

glue.inMode("reference/REF_6_unassigned_MG878999/feature-location/E2", function() {
	glue.command(["remove", "segment", "1150", "2251"]);
	glue.command(["add", "segment", "1150", "2250"]);
});

glue.inMode("reference/REF_6_unassigned_MG878999/feature-location/NS2", function() {
	glue.command(["remove", "segment", "2441", "3090"]);
	glue.command(["add", "segment", "2441", "3088"]);
});

glue.logInfo("Problematic reference sequences: ", _.keys(problematicRefs));