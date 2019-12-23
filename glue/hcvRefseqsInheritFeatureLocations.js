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
		var polyproteinEnd = null;
		var polyproteinStart = null;
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
				if(i == aaRows.length-1 && aa != "*" && aaRows[i].refNt < seqLength-2) {
					glue.log("WARNING", "Residue "+aaRows[i].codonLabel+" of feature "+featureName+" on reference "+refSeqObj.name+" should be *");
					problematicRefs[refSeqObj.name] = "yes";
				}
			}
			var listSegmentResults = glue.tableToObjects(glue.command(["list", "segment"]));
			_.each(listSegmentResults, function(lsr) {
				if(polyproteinStart == null || lsr.refStart < polyproteinStart) {
					polyproteinStart = lsr.refStart;
				}
				if(polyproteinEnd == null || lsr.refEnd > polyproteinEnd) {
					polyproteinEnd = lsr.refEnd;
				}
			});
		});
		if(polyproteinStart != null && polyproteinStart > 1) {
			glue.command(["add", "feature-location", "5UTR"]);
			glue.inMode("feature-location/5UTR", function() {
				glue.command(["add", "segment", 1, polyproteinStart-1]);
			});
		}
		if(polyproteinEnd != null && polyproteinEnd < seqLength) {
			glue.command(["add", "feature-location", "3UTR"]);
			glue.inMode("feature-location/3UTR", function() {
				glue.command(["add", "segment", polyproteinEnd+1, seqLength]);
			});
		}
			
	});
});

glue.logInfo("Problematic reference sequences: ", _.keys(problematicRefs));