/**
 * This module generates various objects (reference sequences, module configs, alignments) based on a
 * single JSON file which defines the clade structure and reference sequence choices.
 * 
 * The point of this is to have these choices in one place, so that they can be updated easily.
 * 
 */



function getRefSeqName(alignmentObj, refSeqObj) {
	var cladeID = getCladeID(alignmentObj);
	if(cladeID.indexOf("unassigned") >= 0) {
		return "REF_"+cladeID;
	}
	return "REF_"+cladeID+"_"+refSeqObj.sequenceID;
}

function getCladeID(alignmentObj) {
	return alignmentObj.alignmentName.replace("AL_", "");
}

function generateRefSeqNcbiImporter(jsonStructureFile, ncbiImporterFile) {
	
	var cladeStructure = loadJsonCladeStructure(jsonStructureFile);
	
	var refSeqImporterString = 
		"<ncbiImporter>\n"+
		"  <sequenceFormat>GENBANK_XML</sequenceFormat>\n"+
		"  <specificPrimaryAccessions>\n";

	var sourceName = cladeStructure.referenceSourceName;
	
	visitStructureRefseqs(cladeStructure, function(refseq) {
		refSeqImporterString += 
			"    <primaryAccession>"+refseq.sequenceID+"</primaryAccession>\n"
	});
	
	refSeqImporterString += 
		"  </specificPrimaryAccessions>\n"+
		"  <sequenceIdField>PRIMARY_ACCESSION</sequenceIdField>\n"+
		"  <sourceName>"+sourceName+"</sourceName>\n"+
		"</ncbiImporter>\n";
		
	glue.command(["file-util", "save-string", refSeqImporterString, ncbiImporterFile]);
}

function generateSequenceRecogniser(jsonStructureFile, blastRecogniserFile) {

	var cladeStructure = loadJsonCladeStructure(jsonStructureFile);
	
	var refsString = "";
	
	visitStructureAlignmentsPost(cladeStructure, function(alignment) {
		if(alignment.referenceSequences != null) {
			_.each(alignment.referenceSequences, function(refSeqObj) {
				var refSeqName = getRefSeqName(alignment, refSeqObj);
				refsString +=
					"<referenceSequence>"+refSeqName+"</referenceSequence>\n";
			});
		}
	});
	
	var blastRecogniserString = 
		"<blastSequenceRecogniser>\n"+
		"  <blastRunner>\n"+
		"    <generalSearch>\n"+
		"      <evalue>0.1</evalue>\n"+
		"    </generalSearch>\n"+
		"    <restrictSearchOrResults>\n"+
		"      <max_target_seqs>1</max_target_seqs>\n"+
		"    </restrictSearchOrResults>\n"+
		"  </blastRunner>\n";
	
	blastRecogniserString += refsString;

	blastRecogniserString += 
		"<recognitionCategory>\n"+
		"  <id>HCV</id>\n"+
		"  <maximumEValue>0.1</maximumEValue>\n"+
		"  <minimumTotalAlignLength>250</minimumTotalAlignLength>\n"+
		refsString+
		"</recognitionCategory>\n";
	
	blastRecogniserString += "</blastSequenceRecogniser>\n";
		
	glue.command(["file-util", "save-string", blastRecogniserString, blastRecogniserFile]);
}

function createGlueReferenceSequences(jsonStructureFile) {

	glue.command(["multi-delete", "reference", "-w", "sequence.source.name = 'ncbi-refseqs'"]);
	
	var cladeStructure = loadJsonCladeStructure(jsonStructureFile);
	var sourceName = cladeStructure.referenceSourceName;
	
	visitStructureAlignmentsPost(cladeStructure, function(alignment) {
		var allRefs = [];
		allRefs.push(alignment.constrainingRef);
		if(alignment.referenceSequences != null) {
			allRefs = allRefs.concat(alignment.referenceSequences);
		}
		allRefs = _.uniq(allRefs, function(refSeqObj) { return refSeqObj.sequenceID; });
		_.each(allRefs, function(refSeqObj) {
			var refSeqName = getRefSeqName(alignment, refSeqObj);
			glue.command(["create", "reference", refSeqName, sourceName, refSeqObj.sequenceID]);
			glue.inMode("reference/"+refSeqName, function() {
				var displayName;
				if(alignment.cladeCategory == "species") {
					displayName = "Hepatitis C Virus Reference ("+refSeqObj.sequenceID+")"
				} else if(alignment.cladeCategory == "genotype") {
					displayName = "Genotype "+alignment.genotype+" Reference ("+refSeqObj.sequenceID+")"
				} else if(alignment.cladeCategory == "subtype") {
					if(alignment.status == "confirmed") {
						displayName = "Subtype "+alignment.subtype+" Reference ("+refSeqObj.sequenceID+")"
					} else {
						displayName = "Unassigned Subtype "+alignment.genotype+"_"+refSeqObj.sequenceID+" Reference"
					}
				} 
				glue.command(["set", "field", "displayName", displayName]);
			});
		});
	});
	
	visitStructureAlignmentsPost(cladeStructure, function(alignment) {
		if(alignment.cladeCategory == "subtype") {
			_.each(alignment.referenceSequences, function(refSeqObj) {
				var refSeqName = getRefSeqName(alignment, refSeqObj);
				glue.inMode("sequence/"+sourceName+"/"+refSeqObj.sequenceID, function() {
					if(refSeqObj.genotype != null) {
						glue.command(["set", "field", "genotype", refSeqObj.genotype]);
					}
					if(refSeqObj.subtype != null) {
						glue.command(["set", "field", "subtype", refSeqObj.subtype]);
					}
					if(refSeqObj.status != null) {
						glue.command(["set", "field", "reference_status", refSeqObj.status]);
					}
				});
			});
		}
	});

}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) {
    	s = "0" + s;
    }
    return s;
}

function createAlignmentTree(jsonStructureFile) {

	glue.command(["multi-delete", "alignment", "-w", "refSequence != null"]);
	
	var cladeStructure = loadJsonCladeStructure(jsonStructureFile);
	var sourceName = cladeStructure.referenceSourceName;
	var masterRefObj = cladeStructure.constrainingRef;
	var masterRefName = getRefSeqName(cladeStructure, masterRefObj);
	var masterAlmtName = cladeStructure.alignmentName;
	glue.command(["create", "alignment", masterAlmtName, "--refSeqName", masterRefName]);
	visitStructureAlignmentsPre(cladeStructure, function(alignment) {
		glue.inMode("/alignment/"+alignment.alignmentName, function() {
			glue.command(["set", "field", "clade_category", alignment.cladeCategory]);
			if(alignment.almtDisplayName != null) {
				glue.command(["set", "field", "displayName", alignment.almtDisplayName]);
			}
			if(alignment.status != null) {
				glue.command(["set", "field", "status", alignment.status]);
			}
		});
		if(alignment.childAlignments != null) {
			_.each(alignment.childAlignments, function(childAlignment) {
				glue.inMode("/alignment/"+alignment.alignmentName, function() {
					var childRefName = getRefSeqName(childAlignment, childAlignment.constrainingRef);
					glue.command(["add", "member", "--refName", childRefName]);
					glue.command(["extract", "child", childAlignment.alignmentName, "--refName", childRefName]);
					// this demote member command is just to get the referenceMember flag set to true on the member
					// in the parent alignment.
					glue.command(["demote", "member", childAlignment.alignmentName, "--member", sourceName, childAlignment.constrainingRef.sequenceID]);

				});
			});
		}
		if(alignment.referenceSequences != null) {
			_.each(alignment.referenceSequences, function(refObj) {
				glue.inMode("/alignment/"+alignment.alignmentName, function() {
					glue.command(["add", "member", sourceName, refObj.sequenceID]);
				});
			});
		}
		glue.inMode("/alignment/"+alignment.alignmentName, function() {
			glue.command(["derive", "segments", "AL_UNCONSTRAINED", "--existingMembersOnly", "--allMembers"]);
		});
			
	});

}




function loadJsonCladeStructure(jsonStructureFile) {
	var loadedString = 
		glue.command(["file-util", "load-string", jsonStructureFile]).fileUtilLoadStringResult.loadedString;
	return JSON.parse(loadedString);
}

// visit all refseq objects in post-order fashion
function visitStructureRefseqs(structureNode, refseqCallback) {
	if(structureNode.childAlignments != null) {
		_.each(structureNode.childAlignments, function(childAlignment) {
			visitStructureRefseqs(childAlignment, refseqCallback);
		});
	}
	if(structureNode.referenceSequences != null) {
		_.each(structureNode.referenceSequences, refseqCallback);
	}
}

//visit all alignment objects in post-order fashion
function visitStructureAlignmentsPost(structureNode, alignmentCallback) {
	if(structureNode.childAlignments != null) {
		_.each(structureNode.childAlignments, function(childAlignment) {
			visitStructureAlignmentsPost(childAlignment, alignmentCallback);
		});
	}
	alignmentCallback(structureNode);
}

//visit all alignment objects in pre-order fashion
function visitStructureAlignmentsPre(structureNode, alignmentCallback) {
	alignmentCallback(structureNode);
	if(structureNode.childAlignments != null) {
		_.each(structureNode.childAlignments, function(childAlignment) {
			visitStructureAlignmentsPre(childAlignment, alignmentCallback);
		});
	}
}
